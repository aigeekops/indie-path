import {content} from './generated/content.js';
import {curriculum, adaptedVariant} from './curriculum.js';
import {marketTask} from './market-content.js';
import {isMobile,isWechat,isGame,mobileData,mobileTask} from './product-paths.js';

export const skills = [
 ['discovery','需求调查','观察或访谈用户，并据此调整过方案'],
 ['product','产品取舍','明确最小范围，设计流程并组织试用'],
 ['frontend','界面交互','做出带表单、请求和错误反馈的页面'],
 ['backend','服务端','编写接口，校验输入并保存和读取数据'],
 ['security','数据与权限','限制不同用户的数据访问，处理身份验证'],
 ['quality','验证与排障','复现问题，设计检查并确认修复'],
 ['deploy','部署与维护','发布产品、查看日志并处理运行故障'],
 ['growth','获客','接触目标用户，并追踪到实际使用'],
 ['commerce','收费交付','做过报价、收款及交付后的支持']
];
export const roles=['产品','运营','前端','后端','测试'];
export const stageLabels={none:'还没确定问题',idea:'有想法，未接触用户',validated:'已接触用户，正在验证',building:'正在开发',live:'已上线，探索使用与付费'};
export const levels={0:'尚未做过',1:'在帮助下做过',2:'独立做过',unknown:'不确定'};
export const blankProfile=()=>({roles:[],market:'尚未确定',customer:'尚未确定',language:'中文',country:'',stage:'none',idea:'',skills:Object.fromEntries(skills.map(([id])=>[id,'unknown'])),stack:'',time:'6–8 小时',budget:'先控制在免费额度内',access:'暂时找不到',form:'网页产品',mobilePlatform:'尚未确定',mobileStore:'尚未确定',mobileData:'尚未确定',used:false,paid:false,serviceMode:false,productType:'暂未确定',userContext:'',incomeGoal:'',currency:'CNY',goalMonths:3});
export const personas=content.personas;
// Markdown 是任务正文与验收标准的唯一来源；路线推荐仍是独立的网站逻辑。
export const tasks=content.tasks.map(t=>({...t,steps:curriculum[t.id].practice.map(s=>s.title+'：'+s.action),resources:curriculum[t.id].readings,output:curriculum[t.id].deliverables.join('；')}));
export const taskForProfile=(task,profile)=>mobileTask(marketTask(task,profile),profile);
// 必修主干的顺序：一条从已有经验走到第一笔收入的最小闭环。
export const CORE_TRACK=['find','segment','evidence','validation-experiment','cn-gates','scope','positioning','landing-page','price','web-basics','code-basics','ui','ai-cost','ai-evaluation','verify','usability','ship','reach','content-plan','charge','support','review','operate','content-review','prioritization'];
// 选择了具体产品形态后，由平台专项关卡替代的通用必修项。
const PLATFORM_REPLACE=['web-basics','code-basics','ui','verify','usability','ship','reach','charge','operate'];
const platformBranch=p=>{
 const wx=isWechat(p),game=isGame(p),cloud=mobileData(p)==='需要云端服务';
 const ids=[wx?'wx-plan':'app-plan'];
 if(game)ids.push('game-loop','game-build');else ids.push(wx?'wx-build':'app-build');
 if(cloud)ids.push(wx?'wx-cloud':'app-cloud');
 ids.push(wx?'wx-monetize':'app-monetize');
 if(game)ids.push('game-test');
 if(!wx)ids.push('app-test');
 ids.push(wx?'wx-release':'app-release',wx?'wx-growth':'app-store-growth',wx?'wx-operations':'app-operations');
 return ids;
};
export function generateRoute(profile,added=[]){
 const p={...blankProfile(),...profile,skills:{...blankProfile().skills,...profile.skills}};
 const first=p.stage==='live'?(p.used||p.paid?'review':'find'):p.stage==='none'||p.stage==='idea'?'find':'evidence';
 let ids;
 if(isMobile(p)||isWechat(p)){
  ids=CORE_TRACK.filter(id=>!PLATFORM_REPLACE.includes(id));
  ids.splice(ids.indexOf('ai-evaluation')+1,0,...platformBranch(p));
 }else{
  const needsBridge=['frontend','backend'].every(k=>p.skills[k]===0||p.skills[k]==='unknown');
  ids=CORE_TRACK.filter(id=>needsBridge||!['web-basics','code-basics'].includes(id));
 }
 ids=ids.filter(id=>id!==first);
 ids.unshift(first);
 if(p.serviceMode)ids.splice(ids.indexOf('evidence')+1,0,'service');
 for(const id of added)if(tasks.some(t=>t.id===id)&&!ids.includes(id))ids.push(id);
 return ids.map(id=>{
  const t=tasks.find(x=>x.id===id);let mode='required',reason='这是贯通产品与经营的必要实践。';
  if(t.skill&&p.skills[t.skill]===2){mode='confirm';reason='你表示独立做过：对照验收，用已有成果确认后可跳过。';}
  else if(t.skill&&p.skills[t.skill]==='unknown'){reason='你的掌握情况不确定：先用最小实践确认，再决定补学范围。';}
  else if(t.skill&&p.skills[t.skill]===1){reason='你在帮助下做过：本次重点是独立完成与解释。';}
  else if(t.skill){reason='你尚未独立完成这类工作，建议保留这一项实践。';}
  if(id==='contract'&&!(p.skills.product===2&&p.skills.backend===2)){mode='required';reason='产品取舍或后端经验不能单独证明能写清接口契约，本次练习字段、失败与数据归属。';}
  if(id===first){mode='required';reason=id==='review'?'产品已有实际试用：先检查价值与报价反馈，避免盲目加功能。':id==='find'?'当前还没有足够的用户证据，先确认问题，再扩大开发。':'你已有需求经验：检查本次项目的证据，不重复学习整套基础。';}
  if(p.stage==='live'&&['scope','ui','api','ship'].includes(id)){mode='confirm';reason='你已有上线产品：用现有成果核对验收，有缺口再补。';}
  if(['find','evidence','service','review','scope','price','usability','reach','charge','support','operate','content-plan','content-review'].includes(id)&&id!==first){mode='required';reason='复用已有方法，但要记录当前产品的真实结果；岗位经验不替代这次验证。';}
  if(id==='content-plan')reason='承接已接触的目标用户，选一个主渠道完成发布；微信、小红书、X、YouTube按受众选择，追踪到实际使用与付款。';
  if(id==='content-review')reason='沿用发布台账的内容编号，核对再次使用、付费、退款与内容投入，再决定下一轮。';
  if(id==='web-basics'||id==='code-basics'){reason='你尚未确认独立开发能力：先补最小桥接；能独立通过验收就用成果确认，不必先修完整课程。';}
  if(/^(app|wx|game)-/.test(id)){mode='required';reason=id.endsWith('-cloud')?'你选择了需要云端服务，补齐接口、身份权限与服务部署。':id.endsWith('-plan')?'先核对发布平台、数据方式与变现条件，再投入具体实现。':'按所选产品与平台完成专项实践，用实际运行、审核或经营记录核对；网页经验不直接替代。';}
  if(id==='review'&&p.paid){const v=adaptedVariant('review--paid');return {...t,title:v.taskTitle,subtitle:v.taskSubtitle,reason:v.taskReason,steps:v.practice.map(s=>s.title+'：'+s.action),checks:v.checks,mode};}
  return {...t,mode,reason};
 }).map(t=>taskForProfile(t,p));
}
