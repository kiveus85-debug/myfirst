(function(root){
 'use strict';
 const internal=new Set(['학생성공센터행정실','학생성공센터','학생인재개발팀','학생지원팀','인공지능혁신융합대학사업단','창업지원단 캠퍼스타운사업단','인문사회융합인재양성사업단','공학교육혁신센터','대학혁신과공유센터','성균인성교육센터','교수학습혁신센터','국제교류팀','카운슬링센터','교무팀','앵커사업단','의료인공지능융합인재양성사업단','양자정보연구지원센터','현장실습지원센터','대학일자리플러스센터','동아시아학술원','대학원팀','장애학생지원센터','유학/문과대학행정실','학부대학/사범대학행정실','운용재','스포츠과학대학','스마트팩토리융합학과행정실','창업지원단','외국인유학생지원팀','학술정보관','데이터사이언스교육센터','중앙학술정보관','국제처','문화예술미디어융합원','영어영문학과','연구기획팀','인권센터','성균어학원','성균어학원행정실','학부대학','사회과학대학','유학대학','학군단','기숙사','기숙사 행정실','홍보팀','건강센터','입학처','교원인사팀','교육혁신팀','정보통신팀','전략기획팀','경제/경영대학/중국대학원행정실','법학전문대학원행정실','정보통신/소프트웨어융합/공과대학행정실','산학협력단','산학사업팀','삼성학술정보관','성대신문','성대방송국','성균타임즈']);
 function resolve(program){
  const explicit=program.scope||program['교내외 구분']||program['교내외'];
  if(['교내','교외'].includes(explicit))return {label:explicit,basis:program.scopeBasis||'프로그램에 명시된 교내·교외 구분'};
  const department=(program.department||program['주관부서']||'').trim();
  if(['교외','외부'].includes(department))return {label:'교외',basis:`노션 주관부서 ‘${department}’ 표기`};
  if(internal.has(department)||/^성균관대(?:학교)?\s/.test(department))return {label:'교내',basis:`노션 주관부서 ‘${department}’의 교내 조직 분류`};
  return {label:'구분 확인 필요',basis:department?`주관기관 ‘${department}’의 교내·교외 구분 미확인`:'주관기관 또는 교내·교외 구분 미기재'};
 }
 const api={resolve};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.ProgramScope=api;
})(typeof globalThis!=='undefined'?globalThis:this);
