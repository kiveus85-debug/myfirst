(function(root){
 'use strict';
 const verified={
  '4109105674bf81e2a15fcf22717c7dc1':{tier:'starter',beginnerSupportConfirmed:true,sourceUrl:'https://www.skku.edu/skku/campus/skk_comm/notice01.do?mode=view&articleNo=141578',reason:'노션 본문에서 처음 사용하는 학생도 따라올 수 있도록 강의를 구성한다고 안내합니다.',requirements:['전문가 특강과 PL 선배 특강의 신청 마감은 각각 11/18 오전 9시, 11/23 오전 9시로 다릅니다. 회차별 신청을 확인하세요.']},
  '40e9105674bf8136b18acb1f259088e2':{tier:'challenge',beginnerSupportConfirmed:true,sourceUrl:'https://www.skku.edu/skku/campus/skk_comm/notice01.do?mode=view&articleNo=141542',reason:'노션 본문에 AI·영상 편집 경험이 없어도 참여 가능하며, 전문 멘토가 팀별로 지원한다고 명시되어 있습니다.',requirements:['2박 3일 전 일정 참여와 팀별 영상 제작·발표가 필요합니다.','개인 노트북·스마트폰 지참, 사전 편집 툴 설치, 지원 동기 심사가 있습니다.','HUSS 참여학과 우대이며, 일부 개인 비용과 중도 포기 시 지원금 환수 조건을 확인하세요.']},
  '4009105674bf8070af71f13284f140c0':{tier:'excluded',sourceUrl:'https://www.skku.edu/skku/campus/skk_comm/notice01.do?mode=view&articleNo=140690&article.offset=10&articleLimit=10',reason:'10페이지 이내 제안서 제출이 필요하며 초보자 지원은 본문에서 확인되지 않아 기본 추천에서 제외합니다.',requirements:['개인 또는 3인 이하 팀, 제안서 작성 필요']},
  '4059105674bf803ea7f8c6b1feaabb81':{tier:'excluded',sourceUrl:'https://www.skku.edu/skku/campus/skk_comm/notice01.do?mode=view&articleNo=140777&article.offset=0&articleLimit=10',reason:'아이디어 경진대회이며 초보자 지원·사전교육이 본문에 확인되지 않아 기본 추천에서 제외합니다.',requirements:[]},
  '40d9105674bf81378315c52637a1399b':{tier:'excluded',sourceUrl:'https://www.skku.edu/skku/campus/skk_comm/notice01.do?mode=view&articleNo=141478',reason:'데이터·AI 기반 서비스 개발 해커톤으로, 초보자 지원이 확인되지 않아 기본 추천에서 제외합니다.',requirements:['서비스 개발 결과물 필요']},
  '40d9105674bf81ae930bd7613f0ea704':{tier:'excluded',sourceUrl:'https://www.skku.edu/skku/campus/skk_comm/notice01.do?mode=view&articleNo=141425',reason:'3분 내외 영상 또는 50컷 이상 웹툰 제출이 필요하고, 초보자 지원이 확인되지 않아 기본 추천에서 제외합니다.',requirements:['기숙사 거주 이력이 있는 참가자 대상','최신 본문 변경 여부는 노션에서도 확인 필요로 표시됨']}
 };
 function assess(p,records=verified){
  const id=(p.id||'').replaceAll('-',''),known=records[id];
  if(known)return {...known,verified:true};
  const title=(p.title||'').replace(/\[[^\]]*\]/g,'');
  const info=[title,...(p.tags||[])].join(' ');
  if(/공모전|경진대회|해커톤|발표대회|competition|contest|콘테스트/i.test(info))return {tier:'excluded',verified:false,reason:'공모·경쟁형 활동이며 초보자 참여 지원을 확인하지 못해 기본 추천에서 제외합니다.',requirements:[]};
  if(/연구논문|논문공모|연구생|인턴십|인턴모집|채용|전문자격|실무인력양성|심화|고급과정|대학원|석사|박사/.test(title))return {tier:'excluded',verified:false,reason:'전문 지식·경험 또는 별도 자격이 필요할 수 있어 기본 추천에서 제외합니다.',requirements:[]};
  if(/캠프|팀프로젝트|팀 프로젝트|아카데미|제작 프로젝트/.test(info))return {tier:'unconfirmed',verified:false,reason:'활동 기간·팀 과제·선수 지식을 확인하지 못해 기본 추천에서 보류합니다.',requirements:[]};
  if(/특강|체험|전공.?탐색|선배|멘토링|입문|기초|대학생활|마음|웰니스|상담/.test(info))return {tier:'starter',verified:false,reason:'제목·유형상 특강·체험·탐색 중심 활동을 우선 배치했습니다. 실제 난이도·선수 지식은 원문 확인이 필요합니다.',requirements:[]};
  return {tier:'unconfirmed',verified:false,reason:'1학년의 첫 참여에 적합한지 확인할 정보가 부족해 기본 추천에서 보류합니다.',requirements:[]};
 }
 const api={assess,verified};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.FirstYearSuitability=api;
})(typeof globalThis!=='undefined'?globalThis:this);
