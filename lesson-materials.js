import {mobileLesson} from './product-paths.js';
import {content} from './generated/content.js';
import {businessMaterials} from './business-learning.js';
import {adaptLesson} from './curriculum.js';
import {marketSources} from './market-content.js';
export function resolveLesson(task,profile){
 let l=adaptLesson(task,profile);
 if(['content-plan','content-review'].includes(task.id)){
  const domestic=profile?.market==='国内客户',overseas=profile?.market==='海外市场（产品出海）';
  const preferred=domestic?['social-wechat','social-xiaohongshu']:overseas?['social-x',task.id==='content-review'?'social-youtube-review':'social-youtube']:[task.id==='content-review'?'retention-analysis':'content-marketing-course'];
  const priority=r=>{const i=preferred.findIndex(id=>r.contentPath==='content/sources/'+id+'.md');return i<0?preferred.length:i;};
  const sort=items=>[...items].sort((a,b)=>priority(a)-priority(b));
  l={...l,readings:sort(l.readings),stepReadings:Object.fromEntries(Object.entries(l.stepReadings||{}).map(([title,items])=>[title,sort(items)])),
   pathNote:domestic?'国内客户：优先查微信、小红书的受众与发布条件，也可按证据选择X或YouTube。每轮只选一个主渠道。':overseas?'产品出海：优先查目标语言的X讨论与YouTube演示，也可按受众证据选择微信或小红书。市场选择不会替你确认账号资格或网络条件。':'市场尚未确定或同时覆盖多地：先用实际用户证据选一个主渠道，记录读者语言与地区，不默认英文内容或四平台同时发布。'};
 }
 const context=content.contexts.market;
 if(task.id==='charge'&&(!profile?.market||['尚未确定','国内和海外'].includes(profile.market)))l={...l,readings:[marketSources.wechatPrepare,marketSources.stripeGlobal],pathNote:context.chargeUnknown};
 if(task.id==='charge'&&profile?.market==='国内客户')l={...l,readings:[marketSources.wechatPrepare,marketSources.wechatOrder,marketSources.wechatNotify,marketSources.wechatQuery,marketSources.wechatRefund],pathNote:'国内客户路径：先核自己的主体、商户权限与客户付款要求；微信Native仅为可用资格下的教学示例，不默认普通个人能接入。'};
 if(task.id==='charge'&&profile?.market==='海外市场（产品出海）')l={...l,readings:[marketSources.stripeGlobal,marketSources.checkout,marketSources.stripeEvents,marketSources.stripeRefund],pathNote:context.chargeOverseas};
 if(task.id==='charge'&&profile?.market==='国内客户')l={...l,practice:l.practice.map((s,i)=>i===0?{...s,action:context.chargeDomesticPrepare,actionHtml:content.contextHtml.market.chargeDomesticPrepare}:i===2?{...s,title:context.chargeDomesticTestTitle,action:context.chargeDomesticTest,actionHtml:content.contextHtml.market.chargeDomesticTest}:s)};
 if(task.id==='charge'){
  const qualification=l.readings.filter(r=>[marketSources.wechatPrepare.url,marketSources.stripeGlobal.url].includes(r.url));
  const selected=['国内客户','海外市场（产品出海）'].includes(profile?.market);
  const refund=profile?.market==='国内客户'?marketSources.wechatRefund:marketSources.stripeRefund;
  const integration=l.readings.filter(r=>!qualification.includes(r)&&r.url!==refund.url);
  l={...l,stepReadings:{...l.stepReadings,
   [l.practice[0].title]:qualification,
   ...(selected?{[l.practice[2].title]:integration,[l.practice[3].title]:[refund]}:{})
  }};
 }

 return mobileLesson(task,profile,businessMaterials(task,profile,l));
}
