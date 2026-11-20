'use client';
import {useState,useEffect} from 'react';
import Link from 'next/link';
import {useL} from '../../lib/i18n';
import {getKB} from '../../lib/store';
import {SEED_KB} from '../../lib/kb';

const COUNTRIES=[['Saudi Arabia','সৌদি আরব'],['United Arab Emirates','সংযুক্ত আরব আমিরাত'],['Qatar','কাতার'],['Kuwait','কুয়েত'],['Oman','ওমান'],['Malaysia','মালয়েশিয়া'],['Singapore','সিঙ্গাপুর'],['United Kingdom','যুক্তরাজ্য'],['United States','যুক্তরাষ্ট্র'],['Canada','কানাডা'],['Australia','অস্ট্রেলিয়া'],['Japan','জাপান'],['South Korea','দক্ষিণ কোরিয়া'],['Germany','জার্মানি'],['Italy','ইতালি'],['Other','অন্য দেশ']];
// which abroad services matter most for each kind of traveller
const SEG={all:null,student:['ab-attest','ab-passport','ab-lost','ab-mission'],worker:['ab-bmet','ab-passport','ab-lost','ab-mission'],traveller:['ab-passport','ab-lost','ab-mission']};
export default function Abroad(){
 const t=useL();
 const [kb,setKb]=useState(SEED_KB);const [cc,setCc]=useState('');const [seg,setSeg]=useState('all');
 useEffect(()=>{setKb(getKB())},[]);
 const all=kb.filter(x=>x.abroad);
 const list=SEG[seg]?SEG[seg].map(id=>all.find(x=>x.id===id)).filter(Boolean):all;
 const cn=COUNTRIES.find(c=>c[0]===cc);const cname=cn&&cc!=='Other'?t(cn[1],cn[0]):'';
 const href=s=>{const ti=t.p(s,'title');const q=cname?t(`আমি ${cname}-এ আছি বা যাচ্ছি। ${ti}: কী কাগজ লাগবে এবং কীভাবে করব?`,`I am in or going to ${cname}. ${ti}: what documents do I need and how do I do it?`):t(`${ti}: কী কাগজ লাগবে এবং কীভাবে করব?`,`${ti}: what documents do I need and how do I do it?`);return `/ask?svc=${s.id}&q=${encodeURIComponent(q)}`};
 const SG=[['all',t('সব','All')],['student',t('শিক্ষার্থী','Student')],['worker',t('কর্মী','Worker')],['traveller',t('ভ্রমণকারী','Traveller')]];
 return<div className="page wide">
  <h1>{t('প্রবাসী সেবা','Services for Bangladeshis abroad')}</h1>
  <p className="mut">{t('পড়াশোনা, কাজ বা ভ্রমণে দেশের বাইরে থাকলে পাসপোর্ট, সনদ সত্যায়ন ও জরুরি সহায়তার তথ্য উৎসসহ পান। একই সহায়ক, নতুন তথ্যভাণ্ডার।','Studying, working or travelling abroad? Get source-linked help on passports, document attestation and emergencies. Same assistant, new knowledge base.')}</p>
  <div className="card" style={{margin:'14px 0'}}>
   <p className="kick" style={{color:'var(--mut)',fontSize:11,letterSpacing:'.14em',fontWeight:700,margin:0}}>{t('আপনার অবস্থা','YOUR SITUATION')}</p>
   <div style={{display:'flex',flexWrap:'wrap',gap:12,margin:'10px 0'}}>
    <label style={{display:'flex',flexDirection:'column',gap:4,fontSize:13}}>{t('গন্তব্য দেশ','Destination country')}
     <select value={cc} onChange={e=>setCc(e.target.value)} style={{padding:'8px 10px',borderRadius:8}}><option value="">{t('বেছে নিন (ঐচ্ছিক)','Choose (optional)')}</option>{COUNTRIES.map(c=><option key={c[0]} value={c[0]}>{t(c[1],c[0])}</option>)}</select></label>
   </div>
   <div>{SG.map(([k,l])=><span key={k} className={'chip'+(seg===k?' on':'')} role="button" tabIndex={0} onClick={()=>setSeg(k)} onKeyDown={e=>e.key==='Enter'&&setSeg(k)}>{l}</span>)}</div>
  </div>
  <div className="g2">{list.map(s=><div key={s.id} className="card">
   <h3 style={{marginTop:0}}>{t.p(s,'title')}</h3>
   <p className="mut" style={{fontSize:13}}>{t.p(s,'office')}</p>
   {s.checklist&&<ul style={{paddingLeft:18,fontSize:14,margin:'8px 0'}}>{s.checklist.slice(0,3).map(([b,e],i)=><li key={i}>{t(b,e)}</li>)}</ul>}
   <p className="mut" style={{fontSize:12}}>{t('সংবাদ/মিশনের সূত্র, অফিসিয়াল সাইটে যাচাই করুন। সংগ্রহ:','From news/mission sources, verify on the official site. Retrieved:')} {s.retrieved}</p>
   <Link className="btn sm" href={href(s)}>{t('সহায়ককে জিজ্ঞাসা করুন','Ask the assistant')} →</Link>
  </div>)}</div>
  <div className="card" style={{marginTop:16}}>
   <h3 style={{marginTop:0}}>{t('কীভাবে কাজ করে','How it works')}</h3>
   <p style={{margin:'6px 0'}}>{t('প্রশ্ন → তথ্যভাণ্ডারে উৎস খোঁজা → উৎস না থাকলে শুধু সরকারি (gov.bd) ওয়েবসাইটে লাইভ খোঁজা → আস্থা যাচাই → না জানলে স্পষ্ট বলা।','Question → search the knowledge base → if sources are not enough, live search of official (gov.bd) websites only → confidence check → say so clearly when unsure.')}</p>
   <p className="mut" style={{fontSize:13,margin:'6px 0'}}>{t('এই প্রোটোটাইপে ফি, সময় ও নির্দিষ্ট মিশনের ফোন নম্বর জেনেশুনে দেওয়া হয়নি, কারণ সেগুলো মিশনভেদে বদলায় ও যাচাই দরকার। দেশভিত্তিক সম্প্রসারণের পরিকল্পনা: প্রতিটি দেশের জন্য আলাদা "কান্ট্রি প্যাক" (ভাষা, অফিসিয়াল ডোমেইন, তথ্যভাণ্ডার)।','This prototype deliberately omits fees, timings and mission phone numbers because they vary by mission and need verification. Expansion plan: a separate "country pack" per country (language, official domains, knowledge base).')}</p>
  </div>
 </div>}
