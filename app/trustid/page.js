'use client';
import {useState,useEffect,useRef} from 'react';
import {useL} from '../../lib/i18n';

const enc=new TextEncoder();
const b64=u=>btoa(String.fromCharCode(...new Uint8Array(u)));
const YEAR=new Date().getFullYear();

// Each request: who asks, what they ask, what they will NOT see, and how the wallet answers it.
const REQ=[
 {id:'w',k:'income_below_20000',
  bn:'কল্যাণ ভাতার যোগ্যতা',en:'Welfare eligibility',
  wb:'নমুনা কল্যাণ কার্যালয়',we:'Sample welfare office',
  cb:'পরিবারের মাসিক আয় ২০,০০০ টাকার নিচে',ce:'Monthly household income is below BDT 20,000',
  why_b:'ভাতার জন্য আপনি যোগ্য কি না ঠিক করতে',why_e:'to decide whether you qualify for the allowance',
  hb:['আয়ের পরিমাণ','নাম ও ঠিকানা','জন্মসাল'],he:['Income amount','Name and address','Birth year'],
  calc:ID=>ID.income<20000},
 {id:'a',k:'age_18_plus',
  bn:'বয়স ১৮+ যাচাই',en:'Age 18+ check',
  wb:'নমুনা সেবা কেন্দ্র',we:'Sample service centre',
  cb:'আবেদনকারীর বয়স ১৮ বছর বা তার বেশি',ce:'The applicant is 18 years or older',
  why_b:'আবেদনের ন্যূনতম বয়স পূরণ হয়েছে কি না দেখতে',why_e:'to check the minimum age for the application',
  hb:['জন্ম তারিখ ও সাল','নাম ও ঠিকানা','আয়'],he:['Date and year of birth','Name and address','Income'],
  calc:ID=>YEAR-ID.born>=18}
];

export default function TrustID(){
 const t=useL();
 const [i,setI]=useState(0);
 const [ID,setID]=useState({income:14000,born:1998});
 const [res,setRes]=useState(null);
 const [ready,setReady]=useState(false);
 const [log,setLog]=useState([]);
 const [declined,setDeclined]=useState(false);
 const keys=useRef(null);
 const q=REQ[i];
 const answer=q.calc(ID);

 useEffect(()=>{(async()=>{try{keys.current=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);setReady(true)}catch{}})()},[]);

 const reset=()=>{setRes(null);setDeclined(false)};
 const pick=k=>{setI(k);reset()};
 const edit=(k,v)=>{setID(p=>({...p,[k]:Number(v)||0}));reset()};
 const note=(who,decision)=>setLog(l=>[{at:new Date().toLocaleTimeString(),who,claim:q.k,decision},...l].slice(0,8));

 async function check(att,sig){
  const s=Uint8Array.from(atob(sig),c=>c.charCodeAt(0));
  return crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},keys.current.publicKey,s,enc.encode(JSON.stringify(att)));
 }
 async function allow(){
  // The wallet answers ONLY the yes/no, then signs it. The raw income / birth year never leaves this function.
  const att={claim:q.k,value:answer,sub:'anon-'+Math.floor(Math.random()*1e6),nonce:Math.random().toString(36).slice(2),exp:new Date(Date.now()+3e5).toISOString()};
  const sig=b64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},keys.current.privateKey,enc.encode(JSON.stringify(att))));
  const valid=await check(att,sig);
  setDeclined(false);setRes({att,sig,valid});note(t(q.wb,q.we),t('অনুমতি দেওয়া হয়েছে','Allowed'));
 }
 function decline(){setRes(null);setDeclined(true);note(t(q.wb,q.we),t('প্রত্যাখ্যান','Declined'))}
 async function tamper(){
  const a={...res.att,value:!res.att.value};
  setRes({...res,att:a,valid:await check(a,res.sig),tampered:true});
 }

 const steps=[
  [t('১. ইস্যুকারী','1. Issuer'),t('সরকারি অফিস আপনার তথ্য যাচাই করে আপনার ওয়ালেটে স্বাক্ষর করে দেয়।','A government office verifies your facts and signs them into your wallet.')],
  [t('২. প্রশ্ন','2. Question'),t('কোনো সেবা কেন্দ্র একটি নির্দিষ্ট প্রশ্ন করে, যেমন "আয় কি ২০,০০০-এর নিচে?"','A service asks one specific question, such as "Is income below 20,000?"')],
  [t('৩. আপনার অনুমতি','3. Your consent'),t('আপনি সম্মতি দিলে ওয়ালেট শুধু "হ্যাঁ" বা "না" বানিয়ে ডিজিটাল স্বাক্ষর দেয়।','If you agree, the wallet creates only a "yes" or "no" and signs it.')],
  [t('৪. যাচাই','4. Verification'),t('সেবা কেন্দ্র স্বাক্ষর মিলিয়ে দেখে। উত্তর বদলানো হলে স্বাক্ষর ভেঙে যায়, তাই ধরা পড়ে।','The service checks the signature. If the answer is changed, the signature breaks and it is caught.')]
 ];

 return<div className="page wide">
  <p className="mut" style={{fontSize:16}}>{t('পুরো কাগজ না দিয়ে শুধু প্রশ্নের উত্তরটুকু প্রমাণ করুন।','Prove just the answer to a question, without handing over the whole document.')}</p>

  <div className="card" style={{margin:'14px 0'}}>
   <h3 style={{marginTop:0}}>{t('এটি কী, আর কেন দরকার?','What is this, and why is it needed?')}</h3>
   <p style={{margin:'6px 0'}}><b>{t('আজকের সমস্যা:','The problem today:')}</b> {t('কোনো সেবা নিতে গেলে আমরা NID-র ফটোকপি, আয়ের কাগজ, ঠিকানা, সবই দিয়ে দিই, অথচ তাদের দরকার ছিল শুধু একটি উত্তর। এই কাগজ হারালে বা অপব্যবহার হলে ক্ষতি আপনার।','To get a service we hand over an ID photocopy, income papers and address, when all they needed was one answer. If those papers leak or are misused, you pay the price.')}</p>
   <p style={{margin:'6px 0'}}><b>{t('ট্রাস্টআইডি-তে:','With TrustID:')}</b> {t('আপনার ওয়ালেট শুধু বলে "আয় ২০,০০০-এর নিচে: হ্যাঁ", সেই সঙ্গে একটি স্বাক্ষর যা জাল করা যায় না। আসল আয়ের সংখ্যা কেউ দেখে না।','your wallet only says "income below 20,000: yes", together with a signature that cannot be forged. Nobody sees the actual income number.')}</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12,marginTop:12}}>
    {steps.map(([h,d])=><div key={h} style={{border:'1px solid var(--line)',borderRadius:12,padding:12}}><b>{h}</b><p className="mut" style={{margin:'6px 0 0',fontSize:14}}>{d}</p></div>)}
   </div>
  </div>

  <p className="kick" style={{color:'var(--mut)',fontSize:11,letterSpacing:'.14em',fontWeight:700,margin:'18px 0 6px'}}>{t('নিজে চালিয়ে দেখুন','TRY IT YOURSELF')}</p>
  <div className="two">
   <div className="card">
    <h3 style={{marginTop:0}}>{t('আপনার নমুনা ওয়ালেট','Your sample wallet')}</h3>
    <p className="mut" style={{fontSize:13}}>{t('এই তথ্য শুধু আপনার ব্রাউজারে থাকে, কোথাও পাঠানো হয় না। সংখ্যা বদলে দেখুন উত্তর কীভাবে বদলায়।','This data stays in your browser and is never sent anywhere. Change the numbers and watch the answer change.')}</p>
    <label style={{display:'block',margin:'8px 0',fontSize:14}}>{t('মাসিক আয় (টাকা)','Monthly income (BDT)')}
     <input type="number" value={ID.income} onChange={e=>edit('income',e.target.value)} style={{display:'block',marginTop:4,padding:'8px 10px',borderRadius:8,border:'1px solid var(--line)',width:'100%'}}/></label>
    <label style={{display:'block',margin:'8px 0',fontSize:14}}>{t('জন্মসাল','Birth year')}
     <input type="number" value={ID.born} onChange={e=>edit('born',e.target.value)} style={{display:'block',marginTop:4,padding:'8px 10px',borderRadius:8,border:'1px solid var(--line)',width:'100%'}}/></label>
    <p className="mut" style={{fontSize:12}}>{ready?t('ওয়ালেটের স্বাক্ষর-চাবি এই ব্রাউজারেই তৈরি (ECDSA P-256)।','The wallet signing key was created in this browser (ECDSA P-256).'):t('ক্রিপ্টো প্রস্তুত হচ্ছে… (HTTPS বা localhost লাগে)','Preparing crypto… (needs HTTPS or localhost)')}</p>
   </div>

   <div className="card">
    <p style={{color:'var(--mut)',fontSize:11,letterSpacing:'.14em',fontWeight:700,margin:0}}>{t('অনুমতির অনুরোধ','CONSENT REQUEST')}</p>
    <div style={{margin:'8px 0 10px'}}>{REQ.map((r,k)=><span key={r.id} className={'chip'+(k===i?' on':'')} role="button" tabIndex={0} onClick={()=>pick(k)} onKeyDown={e=>e.key==='Enter'&&pick(k)}>{t(r.bn,r.en)}</span>)}</div>
    <h3 style={{margin:'4px 0'}}>{t(q.wb,q.we)} {t('জানতে চায়:','wants to know:')}</h3>
    <p style={{fontSize:17,margin:'6px 0'}}>“{t(q.cb,q.ce)}”</p>
    <div style={{background:'var(--bg)',borderRadius:10,padding:'10px 12px',fontSize:14}}>
     <div><b>{t('কেন চায়:','Why:')}</b> {t(q.why_b,q.why_e)}</div>
     <div className="ok"><b>✓ {t('শেয়ার হবে:','Will be shared:')}</b> {t('শুধু স্বাক্ষরিত হ্যাঁ/না','only a signed yes/no')}</div>
     <div className="no"><b>✕ {t('শেয়ার হবে না:','Will not be shared:')}</b> {(t.lang==='bn'?q.hb:q.he).join(', ')}</div>
     <div><b>{t('মেয়াদ:','Valid for:')}</b> {t('৫ মিনিট','5 minutes')}</div>
     <div><b>{t('আপনার উত্তর হবে:','Your answer would be:')}</b> <b className={answer?'ok':'no'}>{answer?t('হ্যাঁ','Yes'):t('না','No')}</b></div>
    </div>
    {!res&&<div className="row" style={{marginTop:12}}><button className="btn" disabled={!ready} onClick={allow}>{t('অনুমতি দিন','Allow')}</button><button className="btn alt" onClick={decline}>{t('প্রত্যাখ্যান','Decline')}</button></div>}
    {declined&&!res&&<p className="mut" style={{marginTop:10}}>{t('আপনি প্রত্যাখ্যান করেছেন, তাই কিছুই শেয়ার হয়নি। সেবা কেন্দ্র আপনার তথ্য পায়নি।','You declined, so nothing was shared. The service received none of your data.')}</p>}
   </div>
  </div>

  {res&&<div className="card" style={{marginTop:14}}>
   <p style={{color:'var(--mut)',fontSize:11,letterSpacing:'.14em',fontWeight:700,margin:0}}>{t('সেবা কেন্দ্রের পর্দা','SERVICE PROVIDER SCREEN')}</p>
   <h3 className={res.valid?'ok':'no'} style={{margin:'6px 0'}}>{res.valid?'✓ '+t('স্বাক্ষর বৈধ: এই উত্তর অপরিবর্তিত','Signature valid: this answer is unaltered'):'✕ '+t('স্বাক্ষর অবৈধ: তথ্য বদলানো হয়েছে','Signature invalid: data was altered')}</h3>
   <p className="mut">{t('সেবা কেন্দ্র যা পেল (আসল আয় বা জন্মসাল নেই):','What the service received (no real income or birth year):')}</p>
   <pre style={{background:'var(--bg)',padding:12,borderRadius:10,overflow:'auto',fontSize:12}}>{JSON.stringify({attestation:res.att,signature:res.sig.slice(0,28)+'…'},null,1)}</pre>
   {!res.tampered&&<button className="btn alt sm" onClick={tamper}>{t('জালিয়াতি চেষ্টা করুন: উত্তর উল্টে দিন','Try fraud: flip the answer')}</button>}
   {res.tampered&&<p className="mut" style={{marginTop:8}}>{t('উত্তর বদলানোর সঙ্গে সঙ্গে স্বাক্ষর মেলেনি। এ কারণেই ভুয়া "হ্যাঁ" বানানো যায় না।','The signature stopped matching the moment the answer was changed. That is why a fake "yes" cannot be made.')}</p>}
  </div>}

  {log.length>0&&<div className="card" style={{marginTop:14}}>
   <h3 style={{marginTop:0}}>{t('আপনার অনুমতির তালিকা','Your consent log')}</h3>
   {log.map((l,k)=><div key={k} style={{display:'flex',gap:10,flexWrap:'wrap',fontSize:14,padding:'6px 0',borderTop:k?'1px solid var(--line)':'none'}}><span className="mut">{l.at}</span><span>{l.who}</span><span className="mut">{l.claim}</span><b>{l.decision}</b></div>)}
  </div>}

  <div className="card" style={{marginTop:14}}>
   <h3 style={{marginTop:0}}>{t('সৎভাবে: এখন কী আছে, কী নেই','Honestly: what exists and what does not')}</h3>
   <p style={{margin:'6px 0'}}><b>✓ {t('আছে:','Built:')}</b> {t('স্বাক্ষরিত হ্যাঁ/না প্রমাণ, অনুমতির পর্দা, জালিয়াতি ধরা, অনুমতির তালিকা।','signed yes/no proofs, a consent screen, tamper detection and a consent log.')}</p>
   <p style={{margin:'6px 0'}}><b>◐ {t('ডেমো:','Demo only:')}</b> {t('ইস্যুকারী, ওয়ালেট ও সেবা কেন্দ্র একই ব্রাউজারে। তথ্য নমুনা। চাবি প্রতিবার নতুন তৈরি হয়।','issuer, wallet and service are all in one browser. The data is a sample. The key is regenerated on each load.')}</p>
   <p style={{margin:'6px 0'}}><b>○ {t('পরিকল্পিত:','Planned:')}</b> {t('সত্যিকারের সরকারি ইস্যুকারী, W3C Verifiable Credentials ফরম্যাট, শূন্য-জ্ঞান প্রমাণ (সংখ্যা না জানিয়েই প্রমাণ), এবং প্রতারণা ও ডিপফেক শনাক্তকরণ। এটি এখনো শূন্য-জ্ঞান প্রমাণ নয়।','a real government issuer, the W3C Verifiable Credentials format, zero-knowledge proofs (proving without revealing the number), and fraud and deepfake detection. This is not yet a zero-knowledge proof.')}</p>
  </div>
 </div>}
