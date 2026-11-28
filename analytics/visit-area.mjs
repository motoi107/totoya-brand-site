import {locate} from './areas.mjs';
const service='https://totoya-production-analytics.m-kubota1984.chatgpt.site/api/areas';
const gis='/analytics/oahu-neighborhoods.geojson';
const captions={en:'Include my approximate neighborhood in TOTOYA visit statistics (optional). Only the area is sent.',ja:'訪問エリアの集計に協力する（任意）。送信するのは判定した地区のみです。',es:'Incluir mi barrio aproximado en las estadísticas de TOTOYA (opcional). Solo se envía la zona.',fr:'Inclure mon quartier approximatif dans les statistiques de TOTOYA (facultatif). Seule la zone est envoyée.',ko:'방문 지역 통계에 참여합니다(선택). 판정된 지역만 전송됩니다.','zh-Hans':'自愿参与到访地区统计。仅发送判定出的地区。','zh-Hant':'自願參與到訪地區統計。僅傳送判定出的地區。'};
export async function install({button,pageviewId,allowed}) {
  const opts={credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(6500)};
  const ready=await fetch(service+'/ready',opts);
  if(!ready.ok || (await ready.json()).version!==1 || !allowed()) return;
  const label=document.createElement('label'), box=document.createElement('input');
  box.type='checkbox';
  label.style.cssText='display:block;font-size:0.9rem;margin:0.7rem 0;line-height:1.5';
  label.append(box,' '+(captions[document.documentElement.lang]||captions.en));
  button.parentElement.after(label);
  let busy=false, done=false, revision=0;
  window.totoyaAreaAccuracyWanted=()=>box.checked&&!done&&allowed();
  box.addEventListener('change',()=>revision++);
  window.addEventListener('totoya:analytics-preference',()=>{box.checked=false;revision++;label.hidden=true});
  window.totoyaVisitArea=async coords=>{
    if(busy||done||!box.checked||!allowed()) return;
    busy=true;
    const selected=revision, valid=()=>box.checked&&allowed()&&revision===selected;
    try {
      // The GIS request always downloads the same island-wide geometry. No position in its URL or body.
      const resp=await fetch(gis,{...opts,cache:'force-cache',signal:AbortSignal.timeout(15000)});
      if(!resp.ok) return;
      const map=await resp.json();
      if(!Array.isArray(map.features)||!map.features.length||map.exceededTransferLimit||map.properties?.exceededTransferLimit) return;
      const area=locate(coords,map.features);
      for(let attempt=0;attempt<3&&valid();attempt++) {
        const result=await fetch(service+'/visit',{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',
          headers:{'Content-Type':'application/json'},body:JSON.stringify({pageviewId,...area}),signal:AbortSignal.timeout(6000)});
        if(result.ok){done=true;break;}
        if(result.status!==409) break;
        await new Promise(resolve=>setTimeout(resolve,1500*(attempt+1)));
      }
    } catch { /* The nearest-store feature works independently of analytics. */ } finally {busy=false;}
  };
}
