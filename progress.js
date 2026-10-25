import {resultMatches} from './acceptance.js';

export const decisions = {
 continue:'继续推进', adjust:'调整后再验证', observe:'等待真实反馈', stop:'停止本轮投入'
};

// 学习验收与产品判断独立：验收完成仍可决定重做、等待或停止。
export function nextAction(list, records = {}) {
 const pending = list.find(t => !resultMatches(records[t.id], t));
 const latest = list.map(task => ({task, record:records[task.id]}))
  // 保存自检本身也是新的实践事件；空决定仅表示尚未选择下一步。
  .filter(({task,record}) => record && (record.status === 'stuck' || resultMatches(record,task)))
  .sort((a,b) => String(b.record.date).localeCompare(String(a.record.date)))[0];
 if (!latest) return {task:pending, kind:'continue', reason:pending?.reason || '本轮学习成果已记录；继续用真实交付复核。'};
 const {task,record} = latest;
 if (record.status === 'stuck') return {task,kind:'adjust',reason:`先处理已记录的卡点：${record.blocker}。`};
 if (record.decision === 'stop' || record.decision === 'observe') return {task,kind:record.decision,reason:record.observation};
 if (record.blockerActive) return {task,kind:'adjust',reason:`先处理已记录的卡点：${record.blocker}。`};
 if (record.decision === 'adjust') return {task:list.find(t=>t.id===record.nextTask)||task,kind:'adjust',reason:record.observation};
 return {task:pending,kind:'continue',reason:pending?.reason || '本轮学习成果已记录；继续记录经营结果，决定下一次实验。'};
}

export function previousMonth(now = new Date()) {
 const date = new Date(now.getFullYear(),now.getMonth()-1,1);
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
}
function monthBefore(month) {
 const [year,value] = month.split('-').map(Number);
 return value===1 ? `${year-1}-12` : `${year}-${String(value-1).padStart(2,'0')}`;
}
const amount = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value)>=0;
export function validMonth(entry, now = new Date()) {
 return Boolean(entry && /^\d{4}-(0[1-9]|1[0-2])$/.test(entry.month) && entry.month<=previousMonth(now)
  && ['CNY','USD'].includes(entry.currency) && amount(entry.income) && amount(entry.cost)
  && amount(entry.hours) && typeof entry.evidence==='string' && entry.evidence.trim());
}
export const cashBalance=entry=>(Math.round(Number(entry.income)*100)-Math.round(Number(entry.cost)*100))/100;
export function profitProgress(profile, months = {}, now = new Date()) {
 const target=Number(profile?.incomeGoal), required=Number(profile?.goalMonths);
 const configured=Number.isFinite(target)&&target>0&&Number.isInteger(required)&&required>0&&required<=24;
 const entries=Object.values(months).filter(m=>validMonth(m,now)&&m.currency===(profile?.currency||'CNY')).sort((a,b)=>b.month.localeCompare(a.month));
 const latest=entries[0];
 let streak=0, cursor=previousMonth(now);
 if(configured) while(streak<required){
  const entry=entries.find(m=>m.month===cursor);
  if(!entry||cashBalance(entry)<target)break;
  streak++;cursor=monthBefore(cursor);
 }
 return {configured,target,required,latest,streak,met:configured&&streak>=required,expected:previousMonth(now)};
}
