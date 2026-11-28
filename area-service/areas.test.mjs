import assert from 'node:assert/strict';
import test from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {locate,queryArea} from '../analytics/areas.mjs';
import {readQueries,groupQueries,fetchQueries} from '../analytics/search-area.mjs';
import {handleAreas,withAreas} from './handler.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const features=JSON.parse(read('../analytics/oahu-neighborhoods.geojson')).features;
test('official polygons, uncertainty and outside coverage',()=>{
  assert.equal(features.length,128);
  const check=(latitude,longitude,accuracy=10)=>locate({latitude,longitude,accuracy},features);
  assert.equal(check(21.2809,-157.8359).board,9);assert.equal(check(21.281,-157.806).board,4);
  assert.equal(check(21.3965,-157.9073).board,20);
  assert.equal(check(21.281,-157.806,20000).status,'uncertain');
  const shape=features[0].geometry;const [lon,lat]=(shape.type==='Polygon'?shape.coordinates:shape.coordinates[0])[0][0];
  assert.equal(check(lat,lon).status,'uncertain');
  assert.equal(check(34,-118).status,'outside');
});
test('queries CSV handles Japanese, duplicate dimensions, accents and quoted fields',()=>{
  const rows=readQueries('\uFEFF上位のクエリ,クリック数,表示回数,CTR,掲載順位\r\n"waikīkī, bowl",3,"1,500",0.2%,2.3\r\nワイキキ おすすめ,2,100,2%,5\r\nnear me,1,30,3%,4');
  const [g]=groupQueries(rows);assert.deepEqual([g.area,g.clicks,g.impressions],['Waikiki',5,1600]);
  assert.equal(queryArea('Kaimukī & ワイキキ'),'Kaimuki ＋ Waikiki');assert.equal(queryArea('aieabc'),'地名未特定');
  assert.throws(()=>readQueries('Query,Impressions\na,1'));assert.throws(()=>readQueries('Query,Clicks,Impressions\na,no,1'));
});
test('GSC request uses all detailed dimensions and preserves genuine zero-click rows',async()=>{
  const real=globalThis.fetch;let body;
  try{globalThis.fetch=async(url,init)=>{body=JSON.parse(init.body);assert.ok(url.includes('sc-domain%3Atotoyahawaii.com'));return Response.json({rows:[{keys:['2026-11-21','totoya kaimuki','usa','MOBILE','https://www.totoyahawaii.com/'],clicks:0,impressions:2,position:12}]});};
    const {rows}=await fetchQueries({property:'sc-domain:totoyahawaii.com',from:'2026-11-20',to:'2026-11-21',token:'test'});
    assert.deepEqual(body.dimensions,['date','query','country','device','page']);assert.equal(rows[0].clicks,0);assert.equal(rows[0].country,'usa');
  }finally{globalThis.fetch=real;}
});
function database(){
  const db=new DatabaseSync(':memory:');
  db.exec('CREATE TABLE analytics_pageviews(pageview_id TEXT,session_id TEXT,started_at INTEGER,updated_at INTEGER)');
  db.exec(read('./areas.sql'));db.exec(read('./areas.sql'));
  const wrapper=(q,v=[])=>({bind:(...params)=>wrapper(q,params),first:()=>db.prepare(q).get(...v),run:()=>db.prepare(q).run(...v),all:()=>db.prepare(q).all(...v)});
  return {db,env:{DB:{prepare:q=>wrapper(q),batch:statements=>statements.map(s=>({results:s.all()}))}}};
}
test('collector retry, opt-in-only data, public suppression, HST reporting and legacy pass-through',async()=>{
  const {db,env}=database(),origin='https://www.totoyahawaii.com';
  const call=(route,opts)=>handleAreas(new Request('https://collector.example/api/areas/'+route,opts),env);
  const submit=(v,from=origin)=>call('visit',{method:'POST',headers:{Origin:from,'Content-Type':'application/json'},body:JSON.stringify(v)});
  assert.equal((await call('ready')).status,200);
  const add=db.prepare('INSERT INTO analytics_pageviews VALUES(?,?,?,?)');
  const now=Date.now(),ids=Array.from({length:7},()=>crypto.randomUUID());
  for(let i=0;i<ids.length;i++)add.run(ids[i],'s'+i,now,now);
  const legacy=db.prepare('SELECT * FROM analytics_pageviews ORDER BY session_id').all();
  const payload=i=>({pageviewId:ids[i],status:'district',board:9,district:1});
  assert.equal((await submit({...payload(0),latitude:21})).status,400);
  assert.equal((await submit(payload(0),'https://outside.example')).status,403);
  assert.equal((await submit({...payload(0),pageviewId:crypto.randomUUID()})).status,409);
  await submit({pageviewId:ids[0],status:'uncertain'});
  for(let i=0;i<4;i++)assert.equal((await submit(payload(i))).status,204);
  const small=await (await call('report?period=7')).json();assert.deepEqual(small.boards,[]);
  await submit(payload(4));await submit(payload(4));
  const report=await (await call('report?period=7')).json();
  assert.deepEqual(report.boards,[{board:9,n:5}]);assert.deepEqual(report.coverage,{total:7,measured:5});
  assert.equal(report.subdistricts[0].district,1);assert.equal(report.hours[0].n,5);
  assert.deepEqual(db.prepare('SELECT * FROM analytics_pageviews ORDER BY session_id').all(),legacy);
  assert.equal((await withAreas({fetch:()=>new Response('original')}).fetch(new Request('https://x/api/public/analytics'),env)).status,200);
  assert.equal((await call('report?period=bad')).status,400);db.close();
});
test('locator opt-in stays off by default; only the coarse code leaves after opt-in',async()=>{
  const {install}=await import('../analytics/visit-area.mjs');
  const saved={window:globalThis.window,document:globalThis.document,fetch:globalThis.fetch};
  let mounted,enabled=true,posts=[];
  const handlers={};globalThis.window={addEventListener:(key,fn)=>handlers[key]=fn};
  globalThis.document={documentElement:{lang:'ja'},createElement:()=>({style:{},children:[],addEventListener(){},append(...els){this.children.push(...els);}})};
  const button={parentElement:{after:label=>mounted=label}};
  try{globalThis.fetch=async url=>new Response('unavailable',{status:503});
    await install({button,pageviewId:'test',allowed:()=>enabled});assert.equal(mounted,undefined);
    globalThis.fetch=async (url,init)=>{if(url.endsWith('/ready'))return Response.json({version:1});
      if(url.endsWith('.geojson'))return Response.json({features});
      posts.push(JSON.parse(init.body));return new Response(null,{status:204});};
    await install({button,pageviewId:'test',allowed:()=>enabled});
    const point={latitude:21.281,longitude:-157.806,accuracy:10};
    await window.totoyaVisitArea(point);assert.equal(posts.length,0);
    mounted.children[0].checked=true;assert.equal(window.totoyaAreaAccuracyWanted(),true);
    await window.totoyaVisitArea(point);await window.totoyaVisitArea(point);
    assert.deepEqual(posts,[{pageviewId:'test',status:'district',board:4,district:3}]);
    enabled=false;handlers['totoya:analytics-preference']();assert.equal(window.totoyaAreaAccuracyWanted(),false);
  }finally{Object.assign(globalThis,saved);}
});
