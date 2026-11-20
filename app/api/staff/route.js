import {sb,sbOn,full,SEL,STATUSES,idOk} from '../../../lib/sb';
import {limited} from '../../../lib/claude';
export const dynamic='force-dynamic';

// Staff actions. The PIN is checked on the SERVER against the ADMIN_PIN env var.
// In production there is no default PIN: if ADMIN_PIN is not set, staff access is closed.
// This is a shared PIN, not per-user login. Supabase Auth (per-officer accounts) is the next step.
export async function POST(req){
 if(!sbOn())return Response.json({configured:false},{status:503});
 const expected=process.env.ADMIN_PIN||(process.env.NODE_ENV!=='production'?'1234':'');
 if(!expected)return Response.json({error:'no_admin_pin'},{status:503});
 if(limited(req))return Response.json({error:'rate'},{status:429});
 const b=await req.json().catch(()=>({}));
 if(String(b.pin||'')!==expected)return Response.json({error:'bad_pin'},{status:401});
 if(b.action==='list'){
  const r=await sb('reports?select='+SEL+'&order=created_at.desc&limit=500');
  if(!r.ok)return Response.json({error:'db'},{status:502});
  return Response.json({reports:(r.data||[]).map(x=>full(x,true))});
 }
 if(b.action==='update'){
  if(!idOk(b.id)||!STATUSES.includes(b.status))return Response.json({error:'invalid'},{status:400});
  const a=await sb('reports?id=eq.'+b.id,{method:'PATCH',prefer:'return=minimal',body:{status:b.status}});
  if(!a.ok)return Response.json({error:'db'},{status:502});
  await sb('report_events',{method:'POST',prefer:'return=minimal',body:{report_id:b.id,status:b.status,note:String(b.note||'upd').slice(0,200)}});
  return Response.json({ok:true});
 }
 return Response.json({error:'invalid'},{status:400});
}
