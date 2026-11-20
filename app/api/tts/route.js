export const runtime='nodejs';
export const maxDuration=30;
const MODELS=[...new Set([process.env.GEMINI_TTS_MODEL,'gemini-3.1-flash-tts-preview','gemini-2.5-flash-preview-tts'].filter(Boolean))];
const wav=(pcm,rate)=>{const h=Buffer.alloc(44);h.write('RIFF',0);h.writeUInt32LE(36+pcm.length,4);h.write('WAVEfmt ',8);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(rate,24);h.writeUInt32LE(rate*2,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(pcm.length,40);return Buffer.concat([h,pcm])};
export async function POST(req){
 const key=process.env.GEMINI_API_KEY;if(!key)return Response.json({error:'no_key'},{status:503});
 let text='';try{text=String((await req.json()).text||'').replace(/\*\*/g,'').trim().slice(0,1500)}catch(e){}
 if(!text)return Response.json({error:'empty'},{status:400});
 const errs=[];
 for(const m of MODELS){
  try{
   const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+m+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Kore'}}}}})});
   if(!r.ok){errs.push(m+':'+r.status);continue}
   const j=await r.json();const p=(j.candidates?.[0]?.content?.parts||[]).find(x=>x.inlineData?.data);
   if(!p){errs.push(m+':nodata');continue}
   const rate=+((/rate=(\d+)/.exec(p.inlineData.mimeType||'')||[])[1]||24000);
   return new Response(wav(Buffer.from(p.inlineData.data,'base64'),rate),{headers:{'Content-Type':'audio/wav','Cache-Control':'no-store'}});
  }catch(e){errs.push(m+':'+e.message)}
 }
 return Response.json({error:'tts_failed',errs},{status:502});
}