import {subdistricts} from './subdistricts.mjs';
import {boards,queryArea} from './areas.mjs';
import {readQueries,groupQueries,fetchQueries} from './search-area.mjs';
const $=id=>document.getElementById(id);
const node=(tag,text)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;return e;};
const nf=new Intl.NumberFormat('ja-JP'),days='日月火水木金土';
function table(headers,rows) {
  const wrap=node('div'),t=node('table'),head=t.createTHead().insertRow(),body=t.createTBody();wrap.className='area-scroll';
  headers.forEach(h=>head.append(node('th',h)));for(const r of rows){const tr=body.insertRow();for(const cell of r)tr.append(node('td',cell));}
  wrap.append(t);return wrap;
}
function options(el,items){el.replaceChildren(new Option(items.length?'すべて':'内訳なし',''),...items.sort().map(x=>new Option(x,x)));el.disabled=!items.length;}
let sourceRows=[],request=0,controller;
function clearSearch(){sourceRows=[];$('query-controls').hidden=true;$('g-groups').replaceChildren();}
function display(rows,label) {
  const aliases=new Map();
  for(const row of rows){if(!aliases.has(row.q))aliases.set(row.q,queryArea(row.q));row.area=aliases.get(row.q);}
  sourceRows=rows;
  for(const [id,key] of [['g-country','country'],['g-device','device']])options($(id),[...new Set(rows.map(r=>r[key]).filter(Boolean))]);
  $('g-filter').value='';$('query-controls').hidden=!rows.length;
  $('g-status').textContent=label+' · '+nf.format(rows.length)+' 行。Googleが開示した検索語が対象です。';
  render();
}
function render(){
  const term=$('g-filter').value.trim().toLowerCase(),country=$('g-country').value,device=$('g-device').value;
  const target=$('g-groups');target.replaceChildren();
  for(const g of groupQueries(sourceRows.filter(r=>(!country||r.country===country)&&(!device||r.device===device)))) {
    const rows=g.rows.filter(r=>!term||[g.area,r.q,r.page||''].some(s=>s.toLowerCase().includes(term)));
    if(!rows.length)continue;
    const clicks=rows.reduce((n,r)=>n+r.clicks,0), impressions=rows.reduce((n,r)=>n+r.impressions,0);
    const detail=node('details');detail.append(node('summary',g.area+'　'+nf.format(impressions)+' 表示 ／ '+nf.format(clicks)+' クリック'));
    detail.addEventListener('toggle',()=>{
      if(!detail.open||detail.children.length>1)return;
      const rich=!!rows[0].date, sorted=rows.slice().sort((a,b)=>b.clicks-a.clicks||b.impressions-a.impressions);
      const headers=['検索語','表示','クリック','CTR','平均順位',...(rich?['日付（PT）','国','端末','ページ']:[])];
      let index=0;const more=node('button','さらに100行表示');
      function append(){
        const chunk=sorted.slice(index,index+100);index+=chunk.length;
        const part=table(headers,chunk.map(r=>[r.q,nf.format(r.impressions),nf.format(r.clicks),r.impressions?(r.clicks/r.impressions*100).toFixed(1)+'%':'—',r.position==null?'—':r.position.toFixed(1),...(rich?[r.date,r.country,r.device,r.page]:[])]));
        detail.insertBefore(part,more);more.hidden=index>=sorted.length;
      }
      more.addEventListener('click',append);detail.append(more);append();
    });target.append(detail);
  }
  if(!target.childElementCount)target.append(node('p','該当する検索語はありません。'));
}
for(const id of ['g-country','g-device','g-filter'])$(id).addEventListener('input',render);
$('g-csv').addEventListener('change',async()=>{
  const f=$('g-csv').files[0];if(!f)return;
  const id=++request;controller?.abort();clearSearch();
  try{if(f.size>24*1024*1024)throw Error('24 MB以下のクエリCSVを選んでください。');
    const rows=readQueries(await f.text());if(id===request)display(rows,'CSV '+f.name+'（エクスポート対象期間）');
  }catch(e){if(id===request)$('g-status').textContent=e.message;}
});
const pt=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'});
const ago=d=>pt.format(new Date(Date.now()-d*86400000));
$('g-start').value=ago(30);$('g-end').value=ago(3);
try{$('g-client').value=localStorage.getItem('totoya.gsc.publicClientId')||'';}catch{}
let sdk;
$('google-setup').addEventListener('toggle',()=>{
  if(!$('google-setup').open||sdk)return;
  sdk=node('script');sdk.src='https://accounts.google.com/gsi/client';
  sdk.onload=()=>{$('google-load').disabled=false;};
  sdk.onerror=()=>{$('g-status').textContent='Google認証を読み込めません。CSVでも集計できます。';sdk.remove();sdk=null;};
  document.head.append(sdk);
});
$('google-load').addEventListener('click',()=>{
  const client=$('g-client').value.trim(),property=$('g-property').value,from=$('g-start').value,to=$('g-end').value;
  if(!/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(client)||!from||!to||from>to){$('g-status').textContent='クライアントIDと取得期間を確認してください。';return;}
  const id=++request;controller?.abort();controller=new AbortController();const signal=controller.signal;clearSearch();
  try{localStorage.setItem('totoya.gsc.publicClientId',client);}catch{}
  $('g-status').textContent='Google認証を待っています…';
  const failure=()=>{if(id===request)$('g-status').textContent='Google認証が完了しませんでした。CSVでも集計できます。';};
  try{window.google.accounts.oauth2.initTokenClient({client_id:client,scope:'https://www.googleapis.com/auth/webmasters.readonly',error_callback:failure,
    callback:async answer=>{
      if(id!==request)return;
      if(!answer.access_token){failure();return;}
      $('g-status').textContent='検索実績を読み込み中…';
      try{const result=await fetchQueries({property,from,to,token:answer.access_token,signal});
        if(id===request)display(result.rows,from+' ～ '+to+'（PT、確定値）'+(result.partial?' · 25万行上限。期間を短くすると続きを取得できます':''));
      }catch(e){if(id===request)$('g-status').textContent=e.message;}
    }}).requestAccessToken();}catch{failure();}
});
let generation=0;
async function visitReport(){
  const id=++generation,period=document.querySelector('[data-period][aria-pressed="true"]')?.dataset.period||'7';
  $('a-status').textContent='取得中…';$('a-list').replaceChildren();
  try{
    const resp=await fetch('https://totoya-production-analytics.m-kubota1984.chatgpt.site/api/areas/report?period='+period,{credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(8000)});
    if(!resp.ok)throw Error();const d=await resp.json();if(d.version!==1||!Array.isArray(d.boards))throw Error();
    if(id!==generation)return;const counts=Object.fromEntries(d.counts.map(r=>[r.status,r.n]));
    $('a-status').textContent='地区判定 '+(counts.district||0)+' 件 ／ 境界・精度不足 '+(counts.uncertain||0)+' 件 ／ 対象地区外 '+(counts.outside||0)+' 件。期間中に閲覧した '+nf.format(d.coverage.total)+' セッションのうち、地区計測なし '+nf.format(d.coverage.total-d.coverage.measured)+' 件。公開内訳は各区分5件以上。';
    for(const b of d.boards){const e=node('details');e.append(node('summary',(boards[b.board]||b.board)+'　'+b.n+' セッション'));
      const sub=d.subdistricts.filter(r=>r.board===b.board),hrs=d.hours.filter(r=>r.board===b.board);
      if(sub.length)e.append(table(['地区番号','セッション'],sub.map(r=>[(subdistricts[b.board+'-'+r.district]||'地区')+' ('+b.board+'-'+r.district+')',r.n])));
      if(hrs.length)e.append(table(['曜日・計測時刻（HST）','セッション'],hrs.map(r=>[days[Number(r.weekday)]+'曜 '+r.hour+'時台',r.n])));
      if(!hrs.length&&!sub.length)e.append(node('p','表示基準に達した内訳はありません。'));$('a-list').append(e);}
  }catch{if(id===generation)$('a-status').textContent='地区集計サービス未接続、または取得できませんでした。';}
}
document.querySelectorAll('[data-period],#refresh').forEach(b=>b.addEventListener('click',()=>queueMicrotask(visitReport)));
visitReport();
