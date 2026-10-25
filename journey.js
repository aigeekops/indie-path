import {stages} from './stages.js';
import {tasks,blankProfile,generateRoute,taskForProfile} from './data.js';
import {resultMatches} from './acceptance.js';
import {nextAction,decisions} from './progress.js';

export function taskStatus(task,records={},added=[]){
 const record=records[task.id],done=resultMatches(record,task);
 if(record&&['done','skipped'].includes(record.status)&&!done)return '成果待复核';
 if(done)return `${record.status==='skipped'?'已确认跳过':'能力已自检'}${decisions[record.decision]?' · '+decisions[record.decision]:''}`;
 if(record?.status==='stuck')return '正在处理卡点';
 return added.includes(task.id)?'主动加入':task.mode==='confirm'?'验证后可跳过':'建议完成';
}

// 地图、个人路线、任务详情都消费同一份派生状态；不单独存地图进度。
export function buildJourney({profile=null,records={},added=[]}={}){
 const list=profile?generateRoute(profile,added):tasks.map(task=>taskForProfile(task,blankProfile()));
 const action=nextAction(list,records);
 const groups=stages.map(stage=>{
  const group=list.filter(task=>task.stageId===stage.id);
  const pending=group.filter(task=>!resultMatches(records[task.id],task));
  const completed=group.length-pending.length;
  const current=group.some(task=>task.id===action.task?.id);
  const latest=[...group].filter(t=>records[t.id]).sort((a,b)=>String(records[b.id].date).localeCompare(String(records[a.id].date)))[0];
  const entry=current?action.task:pending[0]||latest||group.find(t=>t.id===stage.task)||group[0];
  const review=entry&&resultMatches(records[entry.id],entry)&&!(current&&action.kind==='adjust');
  const status=current?(action.kind==='continue'?(taskStatus(entry,records)==='成果待复核'?'成果待复核':'当前推荐'):decisions[action.kind]):completed===group.length?'已自检':completed?'已有部分成果':'待实践';
  return {...stage,tasks:group,completed,current,status,entry,href:entry?`#/task/${entry.id}${review?'/acceptance':''}`:'#/profile'};
 });
 return {personalized:Boolean(profile),profile,added,list,action,stages:groups,completed:list.filter(t=>resultMatches(records[t.id],t)).length};
}
