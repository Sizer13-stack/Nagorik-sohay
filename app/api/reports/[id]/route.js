import {sb,sbOn,idOk,full,SEL} from '../../../../lib/sb';
export const dynamic='force-dynamic';

// GET one report by tracking ID. The ID is the capability: whoever filed it has it.
// Returns the description, but never the exact coordinates.
export async function GET(_req,{params}){
 if(!sbOn())return Response.json({configured:false},{status:503});
 if(!idOk(params.id))return Response.json({error:'invalid'},{status:400});
 const r=await sb('reports?id=eq.'+params.id+'&select='+SEL);
 if(!r.ok)return Response.json({error:'db'},{status:502});
 if(!r.data||!r.data[0])return Response.json({error:'not_found'},{status:404});
 return Response.json({report:full(r.data[0],false)});
}
