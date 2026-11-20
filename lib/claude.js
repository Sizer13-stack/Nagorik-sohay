// Server-side helper. Needs ANTHROPIC_API_KEY (never exposed to the browser).
// Model router: cheap/fast tier for classification + extraction, main tier for grounded answers and web search.
// Override with ANTHROPIC_MODEL (main) and ANTHROPIC_MODEL_FAST (fast) env vars.
export const MODELS={fast:process.env.ANTHROPIC_MODEL_FAST||'claude-haiku-5-5',main:process.env.ANTHROPIC_MODEL||'claude-sonnet-5-5'};
async function call(model,{system,messages,max,tools},key){
 const body={model,max_tokens:max,system,messages};if(tools)body.tools=tools;
 const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},body:JSON.stringify(body)});
 if(!r.ok)return{error:'api_'+r.status};const d=await r.json();const cites=[],seen=new Set();
 const text=(d.content||[]).map(c=>{if(c.type!=='text')return'';(c.citations||[]).forEach(z=>{if(z.url&&!seen.has(z.url)){seen.add(z.url);cites.push({url:z.url,title:z.title})}});return c.text||''}).join('');
 return{text,cites,model}}
// Gemini fallback (free key from aistudio.google.com). Text only: no web search tool, so the route skips the live-web step.
const GEM=process.env.GEMINI_MODEL||'gemini-2.5-flash';
async function gem({system,messages,max},key){
 const body={systemInstruction:{parts:[{text:system||''}]},contents:messages.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:String(m.content)}]})),generationConfig:{maxOutputTokens:max*3+1500}};
 const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+GEM+':generateContent',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)});
 if(!r.ok){let m='';try{m=((await r.json()).error||{}).message||''}catch{}return{error:'api_'+r.status+' '+m.slice(0,160)}}const d=await r.json();
 const text=((d.candidates||[])[0]?.content?.parts||[]).map(p=>p.text||'').join('');
 return text?{text,cites:[],model:GEM}:{error:'empty '+((d.candidates||[])[0]?.finishReason||d.promptFeedback?.blockReason||'')}}
// tier: 'fast' (classify/extract) or 'main' (default). If the fast tier fails for a non-rate-limit reason, retry once on main.
// Provider: ANTHROPIC_API_KEY first; otherwise GEMINI_API_KEY (no tools). Neither set -> {error:'no_key'}.
export async function claude({system,messages,max=800,tools,tier='main'}){
 const key=process.env.ANTHROPIC_API_KEY,gk=process.env.GEMINI_API_KEY;
 if(!key&&!gk)return{error:'no_key'};
 try{
  if(!key){if(tools)return{error:'no_web'};return await gem({system,messages,max},gk)}
  const a={system,messages,max,tools};let r=await call(MODELS[tier]||MODELS.main,a,key);
  if(r.error&&tier==='fast'&&r.error!=='api_429'&&MODELS.fast!==MODELS.main)r=await call(MODELS.main,a,key);
  return r}catch{return{error:'network'}}}
export function parse(t){try{const a=t.indexOf('{'),b=t.lastIndexOf('}');return JSON.parse(t.slice(a,b+1))}catch{return null}}
const hits=new Map();// best-effort per-instance rate limit (use Upstash/Vercel KV for production)
export function limited(req){const ip=(req.headers.get('x-forwarded-for')||'x').split(',')[0];const now=Date.now();const a=(hits.get(ip)||[]).filter(x=>now-x<60000);a.push(now);hits.set(ip,a);return a.length>20}
