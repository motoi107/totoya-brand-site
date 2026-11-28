import {boards} from '../analytics/areas.mjs';
const origins=new Set(['https://www.totoyahawaii.com','https://totoyahawaii.com']);
const prefix='/api/areas/';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const day=86400000;
function range(period,now=Date.now()) {
  const hstStart=Math.floor((now-10*3600000)/day)*day+10*3600000;
  const end=hstStart+(period==='yesterday'?0:day);
  const days=({'today':1,'yesterday':1,'7':7,'30':30,'90':90})[period];
  return days?[end-days*day,end]:null;
}
export async function handleAreas(request,env) {
  const url=new URL(request.url), route=url.pathname.slice(prefix.length);
  const origin=request.headers.get('Origin');
  function respond(value,status=200) {
    const headers={'Content-Type':'application/json','Vary':'Origin','Cache-Control':'no-store'};
    if(origins.has(origin)) Object.assign(headers,{'Access-Control-Allow-Origin':origin,
      'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});
    return new Response(value===null?null:JSON.stringify(value),{status,headers});
  }
  if(!url.pathname.startsWith(prefix)) return null;
  if(origin&&!origins.has(origin)) return respond({},403);
  if(request.method==='OPTIONS') return respond(null,204);
  try {
    if(request.method==='GET'&&route==='ready') {
      await env.DB.prepare('SELECT session_id FROM totoya_visit_areas LIMIT 1').first();
      return respond({version:1});
    }
    if(request.method==='POST'&&route==='visit') {
      if(!origins.has(origin)||!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type')||'')) return respond({},403);
      if(Number(request.headers.get('Content-Length')||0)>512) return respond({},413);
      const raw=await request.text();
      if(raw.length>512) return respond({},413);
      let v;
      try{v=JSON.parse(raw)}catch{return respond({},400)}
      if(!v||!uuid.test(v.pageviewId)||!['district','uncertain','outside'].includes(v.status)||
        Object.keys(v).some(k=>!['pageviewId','status','board','district'].includes(k))) return respond({},400);
      const known=v.status==='district';
      if(known&&(!Number.isInteger(v.board)||!boards[v.board]||!Number.isInteger(v.district)||v.district<0||v.district>99)) return respond({},400);
      const now=Date.now();
      const match=await env.DB.prepare('SELECT session_id FROM analytics_pageviews WHERE pageview_id=? AND updated_at>=?').bind(v.pageviewId,now-30*60000).first();
      if(!match) return respond({},409);
      // A retry never doubles a session. A later good fix may refine an inconclusive first fix.
      await env.DB.prepare(`INSERT INTO totoya_visit_areas(session_id,measured_at,status,board,district)
        VALUES(?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET measured_at=excluded.measured_at,
        status=excluded.status,board=excluded.board,district=excluded.district
        WHERE totoya_visit_areas.status='uncertain' AND excluded.status='district'`)
        .bind(match.session_id,now,v.status,known?v.board:null,known?v.district:null).run();
      return respond(null,204);
    }
    if(request.method==='GET'&&route==='report') {
      const bounds=range(url.searchParams.get('period'));
      if(!bounds) return respond({},400);
      const condition=' FROM totoya_visit_areas WHERE measured_at>=? AND measured_at<? ';
      const run=sql=>env.DB.prepare(sql).bind(...bounds);
      const [counts,boardRows,subRows,hours,coverage]=await env.DB.batch([
        run('SELECT status,COUNT(*) AS n'+condition+' GROUP BY status'),
        run('SELECT board,COUNT(*) AS n'+condition+"AND status='district' GROUP BY board HAVING COUNT(*)>=5 ORDER BY n DESC"),
        run('SELECT board,district,COUNT(*) AS n'+condition+"AND status='district' AND district>0 GROUP BY board,district HAVING COUNT(*)>=5 ORDER BY n DESC"),
        run("SELECT board,strftime('%w',measured_at/1000,'unixepoch','-10 hours') AS weekday,strftime('%H',measured_at/1000,'unixepoch','-10 hours') AS hour,COUNT(*) AS n"+condition+"AND status='district' GROUP BY board,weekday,hour HAVING COUNT(*)>=5 ORDER BY n DESC"),
        env.DB.prepare(`WITH active AS (SELECT DISTINCT session_id FROM analytics_pageviews WHERE started_at>=? AND started_at<?)
          SELECT COUNT(*) AS total,COUNT(v.session_id) AS measured FROM active
          LEFT JOIN totoya_visit_areas v ON v.session_id=active.session_id AND v.measured_at>=? AND v.measured_at<?`).bind(...bounds,...bounds)
      ]);
      return respond({version:1,counts:counts.results,boards:boardRows.results,subdistricts:subRows.results,hours:hours.results,coverage:coverage.results[0]});
    }
    return respond({},404);
  } catch { return respond({error:'unavailable'},503); }
}
// Mount around the existing module's default export; all original handlers/bindings are preserved.
export function withAreas(worker) {
  return {...worker,async fetch(request,env,ctx) {
    return (await handleAreas(request,env))??worker.fetch(request,env,ctx);
  }};
}
