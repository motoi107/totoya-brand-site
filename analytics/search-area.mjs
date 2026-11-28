import {queryArea} from './areas.mjs';
const normalize=s=>s.replace(/^\uFEFF/,'').trim().toLowerCase();
export function readQueries(csv) {
  const delimiter=csv.split(/[\r\n]/,1)[0].includes('\t')?'\t':',';
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<csv.length;i++){
    const c=csv[i];
    if(c==='"'&&quoted&&csv[i+1]==='"'){field+='"';i++;}
    else if(c==='"') quoted=!quoted;
    else if(c===delimiter&&!quoted){row.push(field);field='';}
    else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&csv[i+1]==='\n')i++;row.push(field);rows.push(row);row=[];field='';}
    else field+=c;
  }
  if(quoted)throw Error('CSVの引用符が閉じていません。');
  if(field||row.length){row.push(field);rows.push(row);}
  const keys=(rows.shift()||[]).map(normalize);
  const col=(...names)=>keys.findIndex(k=>names.includes(k));
  const q=col('top queries','query','queries','上位のクエリ','クエリ','上位の検索キーワード'),c=col('clicks','クリック数'),im=col('impressions','表示回数'),pos=col('position','掲載順位','平均掲載順位');
  if([q,c,im].includes(-1))throw Error('Search Console の「クエリ」表をCSV形式で選んでください。');
  function num(s,integer){const t=(s??'').trim().replaceAll(',','');const n=Number(t);if(!t||!Number.isFinite(n)||n<0||(integer&&!Number.isSafeInteger(n)))throw Error('CSVの数値を確認してください。');return n;}
  return rows.filter(r=>r.some(v=>v.trim())).map(r=>{if(!r[q]?.trim())throw Error('検索語が空の行があります。');return {q:r[q],clicks:num(r[c],true),impressions:num(r[im],true),position:pos<0?null:num(r[pos],false)};});
}
export function groupQueries(rows) {
  const grouped=new Map();
  for(const row of rows) {
    const area=row.area??queryArea(row.q);
    if(!grouped.has(area))grouped.set(area,{area,clicks:0,impressions:0,rows:[]});
    const group=grouped.get(area);group.clicks+=row.clicks;group.impressions+=row.impressions;group.rows.push(row);
  }
  return [...grouped.values()].sort((a,b)=>b.clicks-a.clicks||b.impressions-a.impressions);
}
export async function fetchQueries({property,from,to,token,signal}) {
  const endpoint='https://www.googleapis.com/webmasters/v3/sites/'+encodeURIComponent(property)+'/searchAnalytics/query';
  let rows=[],partial=false;
  for(let offset=0;;offset+=25000) {
    const response=await fetch(endpoint,{method:'POST',signal,credentials:'omit',referrerPolicy:'no-referrer',
      headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify({startDate:from,endDate:to,dimensions:['date','query','country','device','page'],rowLimit:25000,startRow:offset,type:'web',dataState:'final'})});
    if(!response.ok)throw Error(response.status===403?'プロパティの閲覧権限とSearch Console APIの有効化を確認してください。':'Googleから取得できませんでした（'+response.status+'）。');
    const {rows:batch=[]}=await response.json();
    rows.push(...batch.map(r=>({date:r.keys[0],q:r.keys[1],country:r.keys[2],device:r.keys[3],page:r.keys[4],clicks:r.clicks,impressions:r.impressions,position:r.position})));
    if(batch.length<25000) break;
    if(rows.length>=250000){partial=true;break;}
  }
  return {rows,partial};
}
