'use strict';
const $ = id => document.getElementById(id);
let programs = window.NOTION_PROGRAMS;
let demo = false;
const api = window.ComparisonGuide;
const initialDate = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
$('month').value = initialDate.slice(0,7);
for(const department of [...window.COMPLETION_EVIDENCE.departments].sort((a,b)=>a.localeCompare(b,'ko'))){const option=document.createElement('option');option.value=department;option.textContent=department;$('department').append(option);}
for(const [value,label] of [['__other__','목록에 없는 학과·계열'],['__undecided__','소속 미정 / 잘 모르겠어요']]){const option=document.createElement('option');option.value=value;option.textContent=label;$('department').append(option);}
$('demo-notice').textContent='공개 시연용입니다. 프로그램 정보는 학교 공지 기반 저장본이고, 이수 빈도는 가상 예시입니다. 실제 학생 이수 자료와 구독 저장·이메일 발송 기능은 포함하지 않았습니다.';
api.fields.forEach((field,i)=>{
 const label=document.createElement('label');label.className='check';
 const input=document.createElement('input');input.type='checkbox';input.name='interest';input.value=field;
 input.addEventListener('change',()=>{const checked=[...document.querySelectorAll('input[name=interest]:checked')];$('interest-status').textContent=`${checked.length} / 3개 선택`;for(const label of $('interests').children){const checkbox=label.children[0];checkbox.disabled=checked.length>=3&&!checkbox.checked;}});
 label.append(input,document.createTextNode(field));$('interests').append(label);
});
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function profile(){return {grade:1,firstYearMode:true,department:$('department').value,career:$('career').value.trim(),scope:$('scope').value,campus:$('campus').value,interests:[...document.querySelectorAll('input[name=interest]:checked')].map(x=>x.value),keywords:$('keywords').value.trim(),style:$('style').value,duration:$('duration').value,channel:$('channel').value,explore:$('explore').checked};}
function download(object){const url=URL.createObjectURL(new Blob([JSON.stringify(object,null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='monthly-recommendation.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('survey').addEventListener('submit',event=>{
 event.preventDefault();const p=profile();$('error').textContent='';
 if(!p.department){$('error').textContent='현재 소속 학과·계열을 선택해 주세요.';return;}
 if(!p.interests.length||p.interests.length>3){$('error').textContent='관심 주제를 1~3개 선택해 주세요.';return;}
 const peerContext=window.PeerEvidence.createContext(window.COMPLETION_EVIDENCE,p);
 const now=new Date();
 const starters=api.recommend(p,programs,now,peerContext,{tier:'starter'});
 const challenges=api.recommend(p,programs,now,peerContext,{tier:'challenge'});
 const matches=[...starters,...challenges];const host=$('results');host.replaceChildren();
 const intro=el('div',undefined,'intro');intro.append(el('h2','02. 나에게 맞는 비교과 추천'),el('p',`${$('student').value.trim() || '학생'}님, 설문 결과에 따라 ${matches.length}개의 비교과 프로그램을 추천드립니다.`),el('p',`관심 분야: ${p.interests.join(' · ') || '키워드 중심'} | 조회일: ${initialDate}`,'muted'));host.append(intro);
 intro.append(el('p',`이수기록 참고 집단: ${peerContext.label} · ${peerContext.total.toLocaleString()}건`,'muted'));
 intro.append(el('p','집계 학년은 모두 이수 당시 학년이며, 이수 통계는 2026년도 자료만 사용했습니다.','muted'));
 if(peerContext.fallbackReason)host.append(el('p',peerContext.fallbackReason+' 30건은 집단을 넓히기 위한 운영 기준이며, 통계적 신뢰도를 뜻하지 않습니다.','notice'));
 host.append(el('p','입문·체험 중심 활동을 먼저 찾고, 각 구분 안에서 관심 주제·키워드와 이수 빈도를 비교합니다. 공모·경쟁형 활동은 초보자 지원이 확인되지 않으면 추천에서 제외합니다.','muted'));
 if(!matches.length)host.append(el('p','조건에 맞는 추천이 없습니다. 관심 분야를 넓히거나 ‘종료·기간 미확인 프로그램도 탐색’을 선택해 보세요.','empty'));
 if(p.explore)host.append(el('p','탐색 모드입니다. 종료되었거나 모집 기간이 확인되지 않은 프로그램도 표시하며, 해당 항목은 발송용 안내에서 제외합니다.','notice'));
 for(const group of [{title:'부담 없이 시작하기',items:starters,empty:'현재 관심 조건에 맞는 입문·체험 중심 활동이 없습니다. 난이도가 확인되지 않은 프로그램을 대신 넣지 않았습니다.'},{title:'조금 더 도전하기',items:challenges,empty:'현재 초보자 참여 지원이 확인된 도전 활동 중 관심 조건에 맞는 항목이 없습니다.'}]){
 host.append(el('h2',group.title));
 if(!group.items.length)host.append(el('p',group.empty,'empty'));
 if(group.title==='조금 더 도전하기')host.append(el('p','초보자 지원을 본문에서 확인한 활동입니다. 결과물·팀 활동·활동 기간을 살펴보고 선택하세요. 기본 이메일·Push 안내에는 포함하지 않습니다.','muted'));
 group.items.forEach((item,i)=>{
  const card=el('article',undefined,'card');card.append(el('span',item.scope,'tag'));item.categories.forEach(t=>card.append(el('span',t,'tag')));
  card.append(el('p',item.scopeBasis,'muted'));
  card.append(el('h3',`${i+1}. ${item.title}`),el('p',item.description),el('p',`${item.recruitment.label} · 신청 마감 ${api.formatDate(item.deadline)}`,'meta'));
  card.append(el('p',`캠퍼스: ${item.campus||'확인 필요'} · 소요시간: ${item.minutes==null?'확인 필요':item.minutes+'분'} · 참여 방식: ${item.style||'확인 필요'}`,'meta'));
  if(item.eligibilityNote)card.append(el('p',item.eligibilityNote,'muted'));
  if(item.readiness){
   card.append(el('p',(item.readiness.verified?'본문 확인 · ':'제목·유형 기반 · ')+item.readiness.reason,'notice'));
   if(item.readiness.requirements.length){const requirements=el('ul');item.readiness.requirements.forEach(text=>requirements.append(el('li',text)));card.append(requirements);}
   if(item.readiness.sourceUrl){const source=el('a','참여 조건 확인한 본문 ↗');source.href=item.readiness.sourceUrl;source.target='_blank';source.rel='noopener noreferrer';card.append(source);}
  }
  if(item.applicationMethod)card.append(el('p',`노션에 등록된 신청방법: ${item.applicationMethod}`,'meta'));
  if(item.peer)card.append(el('p',item.peer.explanation,'review'));
  card.append(el('strong','이런 점에서 잘 맞아요'));const ul=el('ul');item.reasons.forEach(reason=>ul.append(el('li',reason)));card.append(ul,el('p',item.review || '등록된 후기가 없습니다.','review'));
  if(item.reviewUrl){const reviewLink=el('a','후기 원문 보기 ↗');reviewLink.href=item.reviewUrl;reviewLink.target='_blank';reviewLink.rel='noopener noreferrer';card.append(reviewLink,el('br'));}
  const links=el('div',undefined,'actions');
  const targets=[['신청 바로가기 ↗',item.applicationUrl],['공식 안내 원문 ↗',item.originalUrl],['노션 상세 보기 ↗',item.notionUrl]];
  if(!targets.some(([,url])=>url))targets.push(['프로그램 안내 ↗',item.url]);
  targets.forEach(([label,url])=>{if(!url)return;const link=el('a',label);link.href=url;link.target='_blank';link.rel='noopener noreferrer';links.append(link);});card.append(links);host.append(card);
 });
 }
 const digest=api.makeDigest(p,starters,$('month').value);const section=el('div',undefined,'card');section.append(el('h3','03. 매달 받아보는 안내 미리보기'));
 let message=digest.text;
 if(p.channel==='push'){const deliverable=matches.filter(x=>digest.programIds.includes(x.id));message=deliverable.length?`[학생성공센터] ${digest.month} 관심 기반 비교과 추천 ${deliverable.length}건\n세부 참여 자격은 원문에서 확인해 주세요.\n${deliverable.map(x=>'• ['+x.scope+'] '+x.title+'\n'+x.url).join('\n')}\n\n실운영에서는 개인별 추천 페이지로 연결합니다.`:'현재 발송 가능한 추천이 없습니다. 이번 회차 Push 발송을 생략합니다.';}
 section.append(el('p',digest.subject,'muted'),el('pre',message));
 const actions=el('div',undefined,'actions');const button=el('button','월간 발송용 JSON 내려받기','secondary');button.type='button';button.onclick=()=>download({...digest,pushPreview:p.channel==='push'?message:undefined,demo,source:window.PROGRAM_SOURCE,deliveryStatus:'preview_only',generatedAt:new Date().toISOString()});actions.append(button);section.append(actions,el('p','미리보기입니다. 실제 이메일·Push는 발송하지 않습니다. 학번·별칭은 내려받는 파일에도 포함하지 않습니다.','muted'));host.append(section);
});
$('upload').addEventListener('change',async event=>{
 const file=event.target.files[0];if(!file)return;
 try{
  if(file.size>2000000)throw Error('2MB 이하의 파일을 사용해 주세요.');
  const data=JSON.parse((await file.text()).replace(/^\uFEFF/,''));
  if(!Array.isArray(data)||!data.length)throw Error('비어 있지 않은 JSON 배열이 필요합니다.');
  const ids=new Set();const dateValid=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
  data.forEach((p,i)=>{
   const validUrl=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol);}catch{return false;}};
   const dateOrTimeValid=s=>s==null||dateValid(s)||(typeof s==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(s)&&Number.isFinite(Date.parse(s)));
   if(!p||typeof p!=='object'||['id','title','description'].some(k=>typeof p[k]!=='string'||!p[k].trim())||ids.has(p.id)||!Array.isArray(p.categories)||p.categories.some(x=>!api.fields.includes(x))||!Array.isArray(p.tags)||p.tags.some(x=>typeof x!=='string')||(p.grades!=null&&(!Array.isArray(p.grades)||!p.grades.length||p.grades.some(x=>![1,2,3,4].includes(x))))||(p.audiences!=null&&(!Array.isArray(p.audiences)||p.audiences.some(x=>typeof x!=='string')))||(p.competencies!=null&&(!Array.isArray(p.competencies)||p.competencies.some(x=>typeof x!=='string')))||(p.minutes!=null&&(!Number.isFinite(p.minutes)||p.minutes<=0))||!dateOrTimeValid(p.open)||!dateOrTimeValid(p.deadline)||(p.open&&p.deadline&&Date.parse(p.open)>Date.parse(p.deadline))||!validUrl(p.url)||['reviewUrl','applicationUrl','originalUrl','notionUrl'].some(k=>p[k]!=null&&!validUrl(p[k]))||(p.review!==undefined&&typeof p.review!=='string'))throw Error(`${i+1}번째 프로그램의 필수값·날짜·중복 ID·URL을 확인해 주세요.`);
   ids.add(p.id);
  });
  programs=data;demo=false;$('import-status').textContent=`${data.length}개 프로그램을 불러왔습니다. 추천 버튼을 눌러 결과를 갱신해 주세요.`;$('demo-notice').textContent='사용자가 불러온 프로그램 목록입니다. 최신 모집정보와 후기 공개 범위는 데이터 담당자가 확인해야 합니다.';$('results').replaceChildren(el('p','데이터를 불러왔습니다. 추천 버튼을 눌러 새 목록으로 조회해 주세요.','empty'));
 }catch(error){$('import-status').textContent=`불러오기 실패: ${error.message}`;}
});
