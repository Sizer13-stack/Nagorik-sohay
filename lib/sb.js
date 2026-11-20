// Server-only Supabase REST helper. The service-role key never reaches the browser.
// If SUPABASE_URL / SUPABASE_SERVICE_KEY are not set, every route answers 503 and the app falls back to localStorage.
const URL_=process.env.SUPABASE_URL,KEY=process.env.SUPABASE_SERVICE_KEY;
export const sbOn=()=>!!(URL_&&KEY);
export async function sb(path,{method='GET',body,prefer}={}){
 try{
  const r=await fetch(URL_.replace(/\/$/,'')+'/rest/v1/'+path,{method,cache:'no-store',headers:{apikey:KEY,authorization:'Bearer '+KEY,'content-type':'application/json',...(prefer?{prefer}:{})},body:body?JSON.stringify(body):undefined});
  const txt=await r.text();let data=null;try{data=txt?JSON.parse(txt):null}catch{}
  return{ok:r.ok,status:r.status,data}
 }catch{return{ok:false,status:0,data:null}}}
export const LBL={road:['রাস্তা','Roads'],drain:['ড্রেন/জলাবদ্ধতা','Drainage'],light:['স্ট্রিটলাইট','Streetlights'],waste:['ময়লা-আবর্জনা','Waste'],water:['পানি সরবরাহ','Water supply']};
export const STATUSES=['received','review','progress','done'];
export const idOk=id=>/^CS-\d{5}$/.test(String(id||''));
const evs=x=>(x||[]).map(e=>({status:e.status,at:e.at,note:e.note})).sort((a,b)=>new Date(a.at)-new Date(b.at));
// Public view: no free-text description, no exact location, no AI details. Ward-level only.
export const pub=x=>({id:x.id,cat:x.cat,desc:LBL[x.cat]?.[0]||'',desc_en:LBL[x.cat]?.[1]||'',ward:x.ward,status:x.status,priority:x.priority,created:x.created_at,is_mock:!!x.is_mock,events:evs(x.report_events)});
// Full view: only for the person who holds the tracking ID, or for staff.
export const full=(x,withGeo)=>({...pub(x),desc:x.descr,desc_en:null,loc:x.loc,ai:x.ai,...(withGeo?{geo:x.geo}:{})});
export const SEL='id,cat,descr,ward,status,priority,created_at,is_mock,loc,ai,geo,report_events(status,at,note)';
