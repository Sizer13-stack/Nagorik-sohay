import {sb,sbOn} from '../../../lib/sb';
import {limited} from '../../../lib/claude';
export const dynamic='force-dynamic';

// GET: public. Returns the shared knowledge base and budget table (null = not set yet, client keeps its built-in sample).
export async function GET(){
 if(!sbOn())return Response.json({configured:false},{status:503});
 const r=await sb('shared_data?select=key,value&key=in.(kb,budget)');
 if(!r.ok)return Response.json({error:'db'},{status:502});
 const m=Object.fromEntries((r.data||[]).map(x=>[x.key,x.value]));
 return Response.json({configured:true,kb:Array.isArray(m.kb)?m.kb:null,budget:typeof m.budget==='string'?m.budget:null});
}

// POST: staff only (PIN checked on the server, same rule as /api/staff). Replaces the whole value for one key.
export async function POST(req){
 if(!sbOn())return Response.json({configured:false},{status:503});
 const expected=process.env.ADMIN_PIN||(process.env.NODE_ENV!=='production'?'1234':'');
 if(!expected)return Response.json({error:'no_admin_pin'},{status:503});
 if(limited(req))return Response.json({error:'rate'},{status:429});
 const b=await req.json().catch(()=>({}));
 if(String(b.pin||'')!==expected)return Response.json({error:'bad_pin'},{status:401});
 const key=b.key,v=b.value;
 const okShape=(key==='kb'&&Array.isArray(v))||(key==='budget'&&typeof v==='string');
 if(!okShape||JSON.stringify(v).length>800000)return Response.json({error:'invalid'},{status:400});
 const a=await sb('shared_data?on_conflict=key',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:{key,value:v,updated_at:new Date().toISOString()}});
 if(!a.ok)return Response.json({error:'db'},{status:502});
 return Response.json({ok:true});
}
