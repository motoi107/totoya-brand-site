// Board numbers follow Honolulu's Neighborhood Commission. Query aliases are search intent.
export const boards = {
  1:'Hawaii Kai',2:'Kuliouou–Kalani Iki',3:'Waialae–Kahala',4:'Kaimuki',
  5:'Diamond Head–Kapahulu–St. Louis Heights',6:'Palolo',7:'Manoa',8:'McCully–Moiliili',
  9:'Waikiki',10:'Makiki–Tantalus',11:'Ala Moana–Kakaako',12:'Nuuanu–Punchbowl',
  13:'Downtown–Chinatown',14:'Liliha–Alewa',15:'Kalihi–Palama',16:'Kalihi Valley',
  17:'Moanalua',18:'Aliamanu–Salt Lake–Airport',20:'Aiea',21:'Pearl City',22:'Waipahu',
  23:'Ewa',24:'Waianae Coast',25:'Mililani–Waipio',26:'Wahiawa–Whitmore Village',
  27:'North Shore',28:'Koolauloa',29:'Kahaluu',30:'Kaneohe',31:'Kailua',
  32:'Waimanalo',33:'Mokapu',34:'Makakilo–Kapolei',35:'Mililani Mauka',36:'Nanakuli–Maili'
};
const places = [
  ['Waikiki','ワイキキ'],['Kaimuki','カイムキ'],['Aiea','アイエア','アイエアー'],
  ['Piikoi','ピイコイ','ピーコイ'],['Ala Moana','アラモアナ','alamoana'],
  ['Kakaako','カカアコ'],['Kapahulu','カパフル'],['Kahala','カハラ'],
  ['Diamond Head','ダイヤモンドヘッド'],['Chinatown','チャイナタウン'],
  ['Downtown','ダウンタウン'],['University of Hawaii','ハワイ大学'],['Moiliili','モイリイリ'],
  ['Haleiwa','ハレイワ'],['Airport','hnl airport','ホノルル空港'],['Ko Olina','コオリナ','koolina'],
  ['North Shore','ノースショア'],['Kaneohe','カネオヘ'],['Kailua','カイルア'],
  ['Pearl City','パールシティ'],['Hawaii Kai','ハワイカイ'],['Manoa','マノア'],['Ewa Beach','エヴァビーチ'],
  ['Kapolei','カポレイ'],['Waipahu','ワイパフ'],['Makiki','マキキ'],['Palolo','パロロ']
];
for (const name of Object.values(boards).flatMap(s => s.split('–'))) {
  if (!places.some(row => row[0] === name)) places.push([name]);
}
function normalize(s) {
  return s.normalize('NFKC').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/['’‘ʻʼ]/g,'').replace(/[-‐‑–_]+/g,' ').replace(/\s+/g,' ');
}
const names = places.map(([name,...aliases])=>[name,[name,...aliases].map(raw=>{
  const alias=normalize(raw);
  if (/[ぁ-ヿ一-龯]/.test(alias)) return text=>text.includes(alias);
  // All Latin aliases in the fixed catalog contain only letters, spaces and periods.
  const pattern=new RegExp('(?:^|[^a-z0-9])'+alias.replaceAll('.',String.fromCharCode(92)+'.')+'(?:$|[^a-z0-9])');
  return text=>pattern.test(text);
})]);
export function queryArea(query) {
  const text=normalize(query);
  const found=names.filter(([,matches])=>matches.some(match=>match(text))).map(row=>row[0]);
  return found.length?found.sort().join(' ＋ '):'地名未特定';
}
// Approximate distance to a short polygon edge in metres, evaluated at the device latitude.
function ringInfo(ring,lat,lon) {
  let inside=false, clearance=Infinity;
  const mx=111320*Math.cos(lat*Math.PI/180), my=110540;
  for(let i=1;i<ring.length;i++) {
    const [ax,ay]=ring[i-1], [bx,by]=ring[i];
    if ((ay>lat)!==(by>lat) && lon<(bx-ax)*(lat-ay)/(by-ay)+ax) inside=!inside;
    const x=(ax-lon)*mx,y=(ay-lat)*my,dx=(bx-ax)*mx,dy=(by-ay)*my;
    const t=Math.max(0,Math.min(1,-(x*dx+y*dy)/(dx*dx+dy*dy||1)));
    clearance=Math.min(clearance,Math.hypot(x+t*dx,y+t*dy));
  }
  return {inside,clearance};
}
export function locate(coords,features) {
  const {latitude:lat,longitude:lon,accuracy}=coords;
  if(![lat,lon,accuracy].every(Number.isFinite)||accuracy<=0||accuracy>1500) return {status:'uncertain'};
  let touches=false;
  for(const {geometry,properties} of features) {
    if(!geometry || !boards[properties.board_num]) continue;
    const polygons=geometry.type==='MultiPolygon'?geometry.coordinates:geometry.type==='Polygon'?[geometry.coordinates]:[];
    for(const rings of polygons) {
      const info=rings.map(r=>ringInfo(r,lat,lon));
      if(!info.length) continue;
      const edge=Math.min(...info.map(x=>x.clearance));
      if(edge<=accuracy+12) touches=true;
      if(info[0].inside&&!info.slice(1).some(x=>x.inside)) {
        if(edge<=accuracy+12) return {status:'uncertain'};
        return {status:'district',board:Number(properties.board_num),district:Number(properties.dist_num)||0};
      }
    }
  }
  return {status:touches?'uncertain':'outside'};
}
