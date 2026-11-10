(function(root){
 'use strict';
 const fields=['탐색·진로','AI·디지털','마음·건강','교류·봉사','창작·표현','글로벌·언어','창업·도전'];
 const day=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d);
 function recruitment(p,now=new Date()){
  const date=typeof now==='string'&&day(now)?new Date(now+'T12:00:00+09:00'):new Date(now);
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(date);
  if(p.status==='완료')return {eligible:false,label:'모집 종료 (노션 상태)'};
  if(!p.open||!p.deadline)return {eligible:false,label:'모집 기간 확인 필요'};
  if(!Number.isFinite(Date.parse(p.open))||!Number.isFinite(Date.parse(p.deadline)))return {eligible:false,label:'모집 기간 확인 필요'};
  if(day(p.open)?p.open>today:Date.parse(p.open)>date.getTime())return {eligible:false,label:'모집 시작 전'};
  if(day(p.deadline)?p.deadline<today:Date.parse(p.deadline)<date.getTime())return {eligible:false,label:'모집 마감'};
  return {eligible:true,label:'모집 기간 내 · 세부 자격 확인 필요'};
 }
 function recommend(profile,programs,now=new Date(),peerContext=null,options={}){
  const keywords=[...new Set((profile.keywords||'').split(/[,，\s]+/).map(x=>x.trim().toLowerCase()).filter(Boolean))];
  return programs.filter(p=>{
   const scope=root.ProgramScope?root.ProgramScope.resolve(p).label:(p.scope||'구분 확인 필요');
   if(profile.scope&&profile.scope!=='전체'&&scope!==profile.scope)return false;
   if(profile.firstYearMode&&root.FirstYearSuitability){const readiness=root.FirstYearSuitability.assess(p);if(readiness.tier!==(options.tier||'starter'))return false;}
   const name=(p.title||'').replace(/\s+/g,'');
   if(['EXTRA13449','EXTRA0404','EXTRA0412'].includes(p.program_code||p.programCode)||name.includes('학생건강검진')||name.includes('금연상담교실')||(name.includes('교내')&&name.includes('성적우수')))return false;
   if(p.audiences&&!p.audiences.includes('학부')&&(!profile.explore||p.audiences.length))return false;
   if(p.grades&&!p.grades.includes(Number(profile.grade)))return false;
   if(profile.campus!=='전체'&&p.campus&&p.campus!=='전체'&&p.campus!==profile.campus)return false;
   if(profile.duration&&p.minutes!=null&&p.minutes>Number(profile.duration))return false;
   return profile.explore||recruitment(p,now).eligible;
  }).map(p=>{
   const categories=p.categories.filter(c=>profile.interests.includes(c));
   const haystack=[p.title,p.description,...p.tags,...(p.competencies||[])].join(' ').toLowerCase();
   const matched=keywords.filter(k=>haystack.includes(k)),styleMatch=!!profile.style&&p.style===profile.style;
   const careerMatched=[...new Set((profile.career||'').split(/[,，\s]+/).map(x=>x.trim().toLowerCase()).filter(Boolean))].filter(k=>haystack.includes(k)&&!matched.includes(k));
   const peer=root.PeerEvidence?root.PeerEvidence.forProgram(peerContext,p):null;
   const scope=root.ProgramScope?root.ProgramScope.resolve(p):{label:p.scope||'구분 확인 필요',basis:p.scopeBasis||'교내·교외 구분 정보 없음'};
   const score=categories.length*4+(matched.length+careerMatched.length)*3+(styleMatch?2:0);
   return {...p,scope:scope.label,scopeBasis:scope.basis,score,peer,readiness:profile.firstYearMode&&root.FirstYearSuitability?root.FirstYearSuitability.assess(p):null,recruitment:recruitment(p,now),reasons:[...categories.map(c=>`프로그램 제목·분류 정보가 관심 분야 ‘${c}’와 연결됩니다.`),...matched.map(k=>`입력한 키워드 ‘${k}’가 프로그램 정보에 포함되어 있습니다.`),...careerMatched.map(k=>`관심 전공·진로 키워드 ‘${k}’가 프로그램 정보에 포함되어 있습니다.`),...(styleMatch?[`선호한 ‘${p.style}’ 방식입니다.`]:[])]};
  }).filter(p=>p.score>0).sort((a,b)=>b.score-a.score||Number(b.recruitment.eligible)-Number(a.recruitment.eligible)||(b.peer?.records||0)-(a.peer?.records||0)||(a.deadline||'9999').localeCompare(b.deadline||'9999')||a.id.localeCompare(b.id)).slice(0,5);
 }
 function formatDate(value){if(!value)return '미기재';if(day(value))return value;return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}
 function makeDigest(profile,results,month){
  const eligible=results.filter(p=>(!profile.firstYearMode||!root.FirstYearSuitability||root.FirstYearSuitability.assess(p).tier==='starter')&&(!p.audiences||p.audiences.includes('학부'))&&(p.recruitment?p.recruitment.eligible:recruitment(p).eligible));
  return {version:2,month,channel:profile.channel,subject:`[학생성공센터] ${month} 관심 기반 비교과 추천`,programIds:eligible.map(p=>p.id),text:eligible.length?`설문 결과에 따라 다음 비교과 프로그램을 추천드립니다.\n세부 참여 자격은 원문에서 확인해 주세요.\n\n${eligible.map((p,i)=>`${i+1}. [${p.scope||'구분 확인 필요'}] ${p.title}\n${p.reasons.join(' ')}\n${p.readiness ? '참여 안내: '+p.readiness.reason+'\n'+(p.readiness.requirements.length ? p.readiness.requirements.join(' ')+'\n' : '') : ''}신청 마감: ${formatDate(p.deadline)}\n후기: ${p.review||'연결된 후기 없음'}\n신청방법: ${p.applicationMethod||'원문 확인'}\n바로가기: ${p.url}\n${p.eligibilityNote||''}`).join('\n\n')}\n\n모집정보는 신청 전 공식 페이지에서 확인하세요.`:'현재 발송할 수 있는 모집 기간 내 추천 항목이 없습니다. 이번 회차 발송을 생략합니다.'};
 }
 const api={fields,recommend,recruitment,formatDate,makeDigest};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.ComparisonGuide=api;
})(typeof globalThis!=='undefined'?globalThis:this);
