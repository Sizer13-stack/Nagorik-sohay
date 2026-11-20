'use client';
import Link from 'next/link';
import {useL} from '../../lib/i18n';

// status: ok = built in code, demo = works on sample data / single browser, plan = roadmap (not built)
const TRACKS=[
 {h:'Citizen First',href:'/ask',lk:['সেবা সহায়ক','Service Assistant'],rows:[
  ['ok','বাংলা, ইংরেজি ও বাংলিশে সেবা সহায়ক: উৎস, আস্থা ও "কেন এই উত্তর?" সহ','Bangla, English and Banglish assistant with sources, confidence and "Why this answer?"'],
  ['ok','ভয়েসে প্রশ্ন, উত্তর পড়ে শোনানো, "আরও সহজ করে বলুন"','Ask by voice, read answers aloud, "Explain simply"'],
  ['ok','ভয়েস থেকে রিপোর্ট ফর্ম পূরণ, ছবি থেকে সমস্যার ধরন চেনা, লোকেশন ও রুটিং','Voice-to-form, photo-to-category, location and routing'],
  ['ok','প্রবাসী বাংলাদেশিদের জন্য আলাদা সেবা (পাসপোর্ট, সনদ সত্যায়ন, BMET)','Dedicated services for Bangladeshis abroad (passport, attestation, BMET)'],
  ['demo','আইনভিত্তিক RAG আছে, তবে ছোট যাচাইকৃত তথ্যভাণ্ডারে (হাজার পাতায় নয়)','RAG is built, but over a small verified knowledge base (not thousands of pages)'],
  ['plan','সমাজকর্মীদের জন্য ঝুঁকি-পূর্বাভাস ড্যাশবোর্ড','Risk-prediction dashboard for social workers']]},
 {h:'GovCopilot',href:'/copilot',lk:['কর্মকর্তা টুল','Officer tools'],rows:[
  ['ok','ব্যক্তিগত তথ্য (ফোন, আইডি নম্বর, ইমেইল) মোছা: নিয়মভিত্তিক','PII redaction (phone, ID numbers, email): rule-based'],
  ['ok','নোটিশ ও আইনের সহজ ভাষার সারাংশ, উত্তরের খসড়া। সিদ্ধান্ত কর্মকর্তার','Plain-language summaries of notices and laws, draft replies. Officers decide'],
  ['demo','কাজের চাপের চিত্র: নমুনা তথ্য','Workload view: sample data'],
  ['plan','আইন-সংশোধনী খসড়া ও পৌর বিধির সঙ্গে স্বয়ংক্রিয় মিলিয়ে দেখা','Legislative drafter and automated municipal-code compliance checks']]},
 {h:'TrustID',href:'/trustid',lk:['ট্রাস্টআইডি','TrustID'],rows:[
  ['demo','স্বাক্ষরিত হ্যাঁ/না প্রমাণ, অনুমতির পর্দা, জালিয়াতি ধরা: একটি ব্রাউজারে ডেমো','Signed yes/no proofs, consent screen, tamper detection: single-browser demo'],
  ['plan','সত্যিকারের ইস্যুকারী, W3C Verifiable Credentials, শূন্য-জ্ঞান প্রমাণ, ডিপফেক শনাক্তকরণ','Real issuer, W3C Verifiable Credentials, zero-knowledge proofs, deepfake detection']]},
 {h:'Smart Nation',href:'/dashboard',lk:['এলাকার চিত্র','Area overview'],rows:[
  ['demo','ওয়ার্ডভিত্তিক অগ্রাধিকার ও "কী হলে কী হবে" সিমুলেটর: নমুনা তথ্য','Ward priority and what-if simulator: sample data'],
  ['plan','OpenStreetMap, World Bank ও সেন্সর ডেটা সংযোগ','OpenStreetMap, World Bank and sensor data integration']]},
 {h:'Transparent Government',href:'/transparency',lk:['স্বচ্ছতা','Transparency'],rows:[
  ['ok','বাজেট CSV আপলোড করে অস্বাভাবিক দাম চিহ্নিত করা (মধ্যমানের ১.৫ গুণ বা বেশি): নিয়মভিত্তিক','Upload a budget CSV and flag unusual prices (1.5x the median or more): rule-based'],
  ['plan','বাজেট PDF-এ RAG, নলেজ গ্রাফ, OpenSpending সংযোগ','RAG over budget PDFs, knowledge graph, OpenSpending integration']]}
];
const ICON={ok:['✓','ok'],demo:['◐',''],plan:['○','mut']};

export default function Global(){
 const t=useL();
 const eng=[[t('প্রশ্ন-উত্তর (RAG)','Q&A (RAG)')],[t('ভয়েস ও ছবি','Voice and photo')],[t('রিপোর্ট ও রুটিং','Reports and routing')],[t('ট্রাস্টআইডি','TrustID')],[t('স্বচ্ছতা বিশ্লেষণ','Transparency analytics')],[t('ব্যক্তিগত তথ্য সুরক্ষা','PII protection')]];
 const pack=[t('ভাষা','Language'),t('সরকারি ওয়েবসাইটের তালিকা','Official website list'),t('যাচাইকৃত তথ্যভাণ্ডার','Verified knowledge base'),t('প্রশাসনিক স্তর (ওয়ার্ড, ইউনিয়ন…)','Admin levels (ward, union…)'),t('মুদ্রা','Currency')];
 return<div className="page wide">
  <h1>{t('বৈশ্বিক পরিসর','Global scope')}</h1>
  <p className="mut" style={{fontSize:16}}>{t('বাংলাদেশে প্রমাণ করা, যেকোনো দেশে নেওয়ার উপযোগী: একটি ইঞ্জিন, প্রতি দেশের জন্য একটি "কান্ট্রি প্যাক"।','Proven in Bangladesh, built to move anywhere: one engine, one "country pack" per country.')}</p>

  <div className="card" style={{margin:'14px 0'}}>
   <h3 style={{marginTop:0}}>{t('কেন আলাদা, শুধু Google নয়?','Why not just Google?')}</h3>
   <p style={{margin:'6px 0'}}>{t('Google লিংক দেয়, আর লিংকের মধ্যে সত্য-মিথ্যা মিশে থাকে। আমরা শুধু যাচাইকৃত বা সরকারি উৎস থেকে উত্তর দিই, কারণ দেখাই, না জানলে স্পষ্ট বলি, আর সমাধান না হলে কর্মকর্তার কাছে পাঠিয়ে ট্র্যাক করি।','Google gives links, and the links mix truth with noise. We answer only from verified or official sources, show why, say so when unsure, and when it cannot be solved, route it to an officer and track it.')}</p>
   <p className="mut" style={{margin:'6px 0',fontSize:14}}>{t('গ্রাহক নাগরিক নয়, স্থানীয় সরকার। নাগরিক বিনামূল্যে ব্যবহার করেন।','The customer is local government, not citizens. Citizens use it free.')}</p>
  </div>

  <div className="card" style={{margin:'14px 0'}}>
   <h3 style={{marginTop:0}}>{t('কান্ট্রি প্যাক: একই ইঞ্জিন, নতুন দেশ','Country pack: same engine, new country')}</h3>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14}}>
    <div style={{border:'1px solid var(--line)',borderRadius:12,padding:12}}><b>{t('ইঞ্জিন (সব দেশে এক)','Engine (same everywhere)')}</b><ul style={{paddingLeft:18,margin:'8px 0 0'}}>{eng.map(([x])=><li key={x}>{x}</li>)}</ul></div>
    <div style={{border:'1px solid var(--line)',borderRadius:12,padding:12}}><b>{t('কান্ট্রি প্যাক (দেশভেদে বদলায়)','Country pack (changes per country)')}</b><ul style={{paddingLeft:18,margin:'8px 0 0'}}>{pack.map(x=><li key={x}>{x}</li>)}</ul></div>
   </div>
   <p style={{margin:'12px 0 4px'}}><b>{t('আজ:','Today:')}</b> {t('বাংলাদেশ প্যাক (বাংলা ও ইংরেজি) এবং প্রবাসী সেবা।','the Bangladesh pack (Bangla and English) plus services for Bangladeshis abroad.')}</p>
   <p className="mut" style={{margin:'4px 0',fontSize:14}}><b>{t('পরিকল্পিত:','Planned:')}</b> {t('বর্তমানে প্যাকের এই অংশগুলো কোডে বসানো আছে (যেমন gov.bd তালিকা)। এগুলো একটি কনফিগ ফাইলে এনে নেপাল, কেনিয়ার মতো দেশে নেওয়া হবে।','Today these pack parts are set inside the code (for example the gov.bd list). They will move into one config file so the product can be taken to countries such as Nepal and Kenya.')}</p>
  </div>

  <h2 style={{fontSize:22,margin:'22px 0 8px'}}>{t('পাঁচটি ক্ষেত্রে আমরা কোথায়','Where we stand on the five tracks')}</h2>
  <p className="mut" style={{fontSize:14}}>{t('✓ কোডে চালু (AI অংশে API key লাগে) · ◐ ডেমো বা নমুনা তথ্য · ○ পরিকল্পিত, এখনো তৈরি হয়নি','✓ built in code (AI parts need an API key) · ◐ demo or sample data · ○ planned, not built yet')}</p>
  <div className="g2">{TRACKS.map(tr=><div key={tr.h} className="card">
   <h3 style={{marginTop:0}}>{tr.h}</h3>
   {tr.rows.map(([s,b,e],k)=><p key={k} style={{margin:'6px 0',fontSize:14,display:'flex',gap:8}}><b className={ICON[s][1]} style={{minWidth:16}}>{ICON[s][0]}</b><span>{t(b,e)}</span></p>)}
   <Link className="btn alt sm" href={tr.href}>{t(tr.lk[0],tr.lk[1])} →</Link>
  </div>)}</div>

  <div className="card" style={{marginTop:16}}>
   <h3 style={{marginTop:0}}>{t('দায়িত্বশীল AI: আমরা কী করি, কী করি না','Responsible AI: what we do and do not do')}</h3>
   <p style={{margin:'6px 0'}}><b>✓ {t('করি:','We do:')}</b> {t('শুধু উৎস থেকে উত্তর, উৎস ও আস্থা দেখানো, না জানলে "জানি না" বলা, AI-তে পাঠানোর আগে ব্যক্তিগত তথ্য মোছা, ছবিতে মুখ বা নম্বর প্লেট থাকলে সতর্কতা, সিদ্ধান্ত মানুষের হাতে।','answer only from sources, show sources and confidence, say "I don\'t know", remove personal data before sending to AI, warn when a photo shows faces or number plates, keep decisions with humans.')}</p>
   <p style={{margin:'6px 0'}}><b>✕ {t('করি না:','We do not:')}</b> {t('ফি বা কাগজপত্র আন্দাজে বলা, আইনি পরামর্শ দেওয়া, কর্মকর্তার অনুমোদন ছাড়া কোনো সিদ্ধান্ত নেওয়া, মানুষ শনাক্ত করা।','guess fees or documents, give legal advice, make a decision without officer approval, identify people.')}</p>
   <p className="mut" style={{margin:'6px 0',fontSize:14}}>{t('সীমা: তথ্যভাণ্ডার ছোট, অনেক তথ্য সংবাদ বা মিশনের পাতা থেকে নেওয়া (তাই "অফিসিয়াল সাইটে যাচাই করুন" লেখা থাকে), আর বাংলা বনাম বাংলিশে সঠিকতার তুলনা এখনো করা হয়নি।','Limits: the knowledge base is small, much of it comes from news or mission pages (hence "verify on the official site"), and accuracy of Bangla versus Banglish has not been compared yet.')}</p>
  </div>
 </div>}
