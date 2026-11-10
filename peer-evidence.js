(function(root){
 'use strict';
 const MINIMUM_RECORDS=30; // Operational fallback threshold, not a statistical confidence claim.
 function createContext(data,profile){
  if(!data)return null;
  const t=data.tables,grade=String(profile.grade||1),department=profile.department;
  const cohort=t.cohorts.find(r=>r.grade===grade&&r.department===department);
  const enough=cohort&&cohort.completion_records>=MINIMUM_RECORDS;
  const rows=enough?t.program_cohort.filter(r=>r.grade===grade&&r.department===department):t.program_grade.filter(r=>r.grade===grade);
  const total=enough?cohort.completion_records:(t.grades.find(r=>r.grade===grade)?.completion_records||0);
  const counts=new Map(rows.map(r=>[r.program_id,r.completion_records]));
  const links=new Map();
  for(const r of t.notion_matches){if(!r.usable)continue;if(!links.has(r.notion_id))links.set(r.notion_id,new Map());links.get(r.notion_id).set(r.program_id,r);}
  return {grade,department,label:enough?`${department} ${grade}학년`:`${grade}학년 전체`,level:enough?'department_grade':'grade',total,counts,links,threshold:MINIMUM_RECORDS,departmentRecords:cohort?.completion_records||0,fallbackReason:enough?'':cohort?`같은 학과·학년의 기록이 ${cohort.completion_records}건으로 운영 기준 ${MINIMUM_RECORDS}건보다 적어 ${grade}학년 전체를 참고합니다.`:`같은 학과·학년의 이수 기록을 확인할 수 없어 ${grade}학년 전체를 참고합니다.`};
 }
 function forProgram(context,program){
  if(!context)return {available:false,records:0,share:0,explanation:'연결된 이수 집계가 없습니다.'};
  const id=program.notionUrl?program.notionUrl.split('/').pop().replaceAll('-',''):program.id;
  const links=[...(context.links.get(id)?.values()||[])];
  const records=links.reduce((n,r)=>n+(context.counts.get(r.program_id)||0),0);
  if(!links.length)return {available:false,records:0,share:0,explanation:`${context.label}의 이수 기록과 연결되지 않아 빈도 근거를 제시하지 않습니다.`};
  if(!records)return {available:false,records:0,share:0,explanation:`연결된 프로그램은 있으나 ${context.label}의 이수 기록은 확인되지 않습니다.`};
  const family=links.some(r=>r.relation!=='same_title');
  return {available:true,records,share:context.total?records/context.total:0,groupTotal:context.total,label:context.label,level:context.level,historicalProgramIds:links.filter(r=>context.counts.get(r.program_id)).map(r=>r.program_id),explanation:`${context.label}의 ${family?'연결 프로그램·계열':'해당 프로그램'} 이수기록 ${records.toLocaleString()}건 / 전체 ${context.total.toLocaleString()}건 (${(100*records/context.total).toFixed(1)}%). ${family?'이름 포함으로 연결한 다른 연도·회차의 계열 기록이 포함될 수 있습니다. ':''}학생 수·선호도 비율이 아닙니다.`};
 }
 const api={MINIMUM_RECORDS,createContext,forProgram};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.PeerEvidence=api;
})(typeof globalThis!=='undefined'?globalThis:this);
