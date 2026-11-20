import {sb,sbOn,pub,idOk,LBL} from '../../../lib/sb';
import {limited} from '../../../lib/claude';
export const dynamic='force-dynamic';

// GET: public, ward-level list (no descriptions, no exact locations).
export async function GET(){
 if(!sbOn())return Response.json({configured:false},{status:503});
 const r=await sb('reports?select=id,cat,ward,status,priority,created_at,is_mock,report_events(status,at,note)&order=created_at.desc&limit=300');
 if(!r.ok)return Response.json({error:'db'},{status:502});
 return Response.json({configured:true,reports:(r.data||[]).map(pub)});
}

// POST: anyone may file a report. Input is validated; nothing is trusted from the client.
export async function POST(req){
 if(!sbOn())return Response.json({configured:false},{status:503});
 if(limited(req))return Response.json({error:'rate'},{status:429});
 const b=await req.json().catch(()=>({}));
 const id=String(b.id||''),cat=String(b.cat||''),ward=+b.ward,descr=String(b.desc||'').trim().slice(0,1000);
 if(!idOk(id)||!LBL[cat]||!(ward>=1&&ward<=9)||descr.length<6)return Response.json({error:'invalid'},{status:400});
 const priority=['high','medium','low'].includes(b.priority)?b.priority:'medium';
 const loc=String(b.loc||'').slice(0,200);
 const g=b.geo&&typeof b.geo==='object'?{lat:+b.geo.lat,lng:+(b.geo.lng??b.geo.lon)}:null;
 const geo=g&&isFinite(g.lat)&&isFinite(g.lng)?g:null;
 const ai=b.ai&&typeof b.ai==='object'?{cat:String(b.ai.cat||'').slice(0,20),confidence:String(b.ai.confidence||'').slice(0,10)}:null;
 const a=await sb('reports',{method:'POST',prefer:'return=minimal',body:{id,cat,descr,ward,status:'received',priority,ai,geo,loc}});
 if(!a.ok)return Response.json({error:a.status===409?'exists':'db'},{status:a.status===409?409:502});
 await sb('report_events',{method:'POST',prefer:'return=minimal',body:{report_id:id,status:'received',note:'rec'}});
 return Response.json({ok:true,id});
}
