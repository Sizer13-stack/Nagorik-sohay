// Client-side sync: if the backend is configured, replace the local report cache with the shared database copy.
// Returns true when the cache changed (so the page can re-read it). If the backend is off, nothing changes.
const K='cs_reports_v2',OWN='cs_own_v1';
export async function syncReports(){
 try{
  const r=await fetch('/api/reports',{cache:'no-store'});if(!r.ok)return false;
  const j=await r.json();if(!j||!Array.isArray(j.reports))return false;
  const own=JSON.parse(localStorage.getItem(OWN)||'[]');const mine=Object.fromEntries(own.map(o=>[o.id,o]));
  const ids=new Set(j.reports.map(x=>x.id));
  // this browser's own reports keep their full description; unsent ones (e.g. filed offline) stay visible
  const merged=[...own.filter(o=>!ids.has(o.id)),...j.reports.map(x=>mine[x.id]?{...x,desc:mine[x.id].desc,desc_en:null,loc:mine[x.id].loc}:x)];
  const next=JSON.stringify(merged);if(next===localStorage.getItem(K))return false;
  localStorage.setItem(K,next);return true;
 }catch{return false}}

// Shared knowledge base + budget: if the backend has them, they replace this browser's copy. If not, nothing changes.
export async function syncShared(){
 try{
  const r=await fetch('/api/shared',{cache:'no-store'});if(!r.ok)return false;
  const j=await r.json();if(!j||!j.configured)return false;let ch=false;
  if(Array.isArray(j.kb)&&j.kb.length){const n=JSON.stringify(j.kb);if(n!==localStorage.getItem('cs_kb_v6')){localStorage.setItem('cs_kb_v6',n);ch=true}}
  if(typeof j.budget==='string'&&j.budget){const n=JSON.stringify(j.budget);if(n!==localStorage.getItem('cs_budget_v3')){localStorage.setItem('cs_budget_v3',n);ch=true}}
  return ch;
 }catch{return false}}
// Staff push: uses the PIN kept for this browser tab after admin login. Silent no-op if the backend is off.
export async function pushShared(key,value){
 try{const pin=sessionStorage.getItem('cs_pin');if(!pin)return;
  await fetch('/api/shared',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pin,key,value})})}catch{}}
