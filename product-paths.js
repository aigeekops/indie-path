import {content} from './generated/content.js';

export const mobilePlatforms=['尚未确定','App Store','国内安卓商店','Google Play'];
export const mobileDataOptions=['尚未确定','仅本地数据','需要云端服务'];
export const mobileStores=['尚未确定','小米应用商店','华为应用市场（Android）','其他国内安卓商店'];
export const productForms=['网页产品','移动端','微信小程序','微信小游戏','手机游戏','插件或桌面工具','暂不确定'];
export const isMobile=profile=>['移动端','手机游戏'].includes(profile?.form);
export const isWechat=profile=>['微信小程序','微信小游戏'].includes(profile?.form);
export const isGame=profile=>['微信小游戏','手机游戏'].includes(profile?.form);
export const isPlatformProduct=profile=>isMobile(profile)||isWechat(profile);
export const isMobileTask=task=>/^(app|wx|game)-/.test(task?.id||'');
export const mobilePlatform=profile=>mobilePlatforms.includes(profile?.mobilePlatform)?profile.mobilePlatform:'尚未确定';
export const mobileData=profile=>mobileDataOptions.includes(profile?.mobileData)?profile.mobileData:'尚未确定';
export const mobileStore=profile=>mobileStores.includes(profile?.mobileStore)?profile.mobileStore:'尚未确定';
const platformKey=profile=>isWechat(profile)?(profile.form==='微信小游戏'?'minigame':'miniprogram'):({'App Store':'apple','国内安卓商店':'domestic','Google Play':'google'}[mobilePlatform(profile)]||'unknown');
const taskPlatformKey=(task,profile)=>task.id.startsWith('wx-')?(isWechat(profile)?platformKey(profile):'wechatUnknown'):task.id.startsWith('game-')?(isGame(profile)?platformKey(profile):'gameUnknown'):platformKey(isMobile(profile)?profile:null);
export function mobileTask(task,profile){
 if(!isMobileTask(task))return task;
 const key=taskPlatformKey(task,profile),platform=['miniprogram','minigame'].includes(key)?profile.form:key==='wechatUnknown'?'微信小程序或微信小游戏（尚未确定）':key==='gameUnknown'?'手机游戏或微信小游戏（尚未确定）':key==='unknown'?'尚未确定':mobilePlatform(profile),store=platform==='国内安卓商店'?`；具体商店：${mobileStore(profile)}`:'';
 const checks=[...task.checks,`本轮发布平台：${platform}${store}；按本轮平台条件核对成果，未明确的条件单列`];
 if(['app-plan','app-build','app-cloud','app-test','wx-plan','wx-build','wx-cloud','game-loop','game-build','game-test'].includes(task.id))checks.push(`数据方式：${mobileData(profile)}；云端需求未确定时先完成边界判断，不把本地原型当云端验证`);
 if(/-(plan|release|store-growth|growth|monetize|operations)$/.test(task.id))checks.push(`本轮客户市场：${profile?.market||'尚未确定'}；国家或地区：${profile?.country?.trim()||'待明确'}；销售范围与平台分发资格分别核对`);
 if(task.id.startsWith('game-')||isGame(profile))checks.push(`产品形态：${isGame(profile)?profile.form:'手机游戏或微信小游戏（尚未确定）'}；游戏玩法、素材授权与游戏类目要求另行核对，普通应用审核不替代游戏发行条件`);
 return {...task,checks,mobilePlatform:platform};
}
// 平台资源映射在核验后的来源清单中维护；正文仍来自 Markdown。
const platformReadings={
 "apple": {
  "app-plan": [
   "mobile-apple-account"
  ],
  "app-build": [
   "mobile-swiftui",
   "mobile-flutter"
  ],
  "app-cloud": [
   "mobile-apple-privacy",
   "mobile-network"
  ],
  "app-test": [
   "mobile-apple-test",
   "mobile-apple-privacy"
  ],
  "app-release": [
   "mobile-apple-release",
   "mobile-apple-privacy"
  ],
  "app-store-growth": [
   "mobile-apple-store"
  ],
  "app-monetize": [
   "mobile-apple-iap",
   "mobile-apple-finance",
   "mobile-admob-test"
  ],
  "app-operations": [
   "mobile-apple-finance",
   "mobile-apple-release"
  ],
  "game-loop": [
   "user-needs",
   "game-godot-2d"
  ],
  "game-build": [
   "game-godot-2d",
   "game-godot-ios"
  ],
  "game-test": [
   "evaluation-methods",
   "game-godot-ios",
   "mobile-apple-test"
  ]
 },
 "domestic": {
  "app-plan": [
   "mobile-huawei-release",
   "mobile-xiaomi-release",
   "mobile-cn-filing"
  ],
  "app-build": [
   "mobile-compose",
   "mobile-flutter"
  ],
  "app-cloud": [
   "mobile-huawei-release",
   "mobile-cn-filing",
   "mobile-network"
  ],
  "app-test": [
   "mobile-huawei-release",
   "mobile-xiaomi-release"
  ],
  "app-release": [
   "mobile-huawei-release",
   "mobile-xiaomi-release",
   "mobile-cn-filing"
  ],
  "app-store-growth": [
   "mobile-huawei-release",
   "mobile-xiaomi-release"
  ],
  "app-monetize": [
   "mobile-huawei-iap",
   "mobile-huawei-release",
   "mobile-xiaomi-ads"
  ],
  "app-operations": [
   "mobile-xiaomi-release",
   "mobile-xiaomi-ads",
   "mobile-huawei-release",
   "mobile-huawei-iap"
  ],
  "game-loop": [
   "user-needs",
   "game-godot-2d"
  ],
  "game-build": [
   "game-godot-2d",
   "game-godot-android"
  ],
  "game-test": [
   "evaluation-methods",
   "game-godot-android",
   "mobile-huawei-release",
   "mobile-xiaomi-release"
  ]
 },
 "google": {
  "app-plan": [
   "mobile-google-account",
   "mobile-google-test"
  ],
  "app-build": [
   "mobile-compose",
   "mobile-flutter"
  ],
  "app-cloud": [
   "mobile-google-privacy",
   "mobile-network"
  ],
  "app-test": [
   "mobile-google-test",
   "mobile-google-privacy"
  ],
  "app-release": [
   "mobile-google-release",
   "mobile-google-privacy"
  ],
  "app-store-growth": [
   "mobile-google-store"
  ],
  "app-monetize": [
   "mobile-google-billing",
   "mobile-admob-test"
  ],
  "app-operations": [
   "mobile-google-finance",
   "mobile-google-release"
  ],
  "game-loop": [
   "user-needs",
   "game-godot-2d"
  ],
  "game-build": [
   "game-godot-2d",
   "game-godot-android"
  ],
  "game-test": [
   "evaluation-methods",
   "game-godot-android",
   "mobile-google-test"
  ]
 },
 "unknown": {
  "app-plan": [],
  "app-build": [
   "mobile-flutter"
  ],
  "app-cloud": [
   "mobile-network"
  ],
  "app-test": [],
  "app-release": [],
  "app-store-growth": [],
  "app-monetize": [],
  "app-operations": [],
  "game-loop": [
   "user-needs",
   "game-godot-2d"
  ],
  "game-build": [
   "game-godot-2d"
  ],
  "game-test": [
   "evaluation-methods"
  ]
 },
 "xiaomi": {
  "app-plan": [
   "mobile-xiaomi-release",
   "mobile-cn-filing"
  ],
  "app-build": [
   "mobile-compose",
   "mobile-flutter"
  ],
  "app-cloud": [
   "mobile-huawei-release",
   "mobile-cn-filing",
   "mobile-network"
  ],
  "app-test": [
   "mobile-xiaomi-release"
  ],
  "app-release": [
   "mobile-xiaomi-release",
   "mobile-cn-filing"
  ],
  "app-store-growth": [
   "mobile-xiaomi-release"
  ],
  "app-monetize": [
   "mobile-xiaomi-release",
   "mobile-xiaomi-ads"
  ],
  "app-operations": [
   "mobile-xiaomi-release",
   "mobile-xiaomi-ads"
  ],
  "game-loop": [
   "user-needs",
   "game-godot-2d"
  ],
  "game-build": [
   "game-godot-2d",
   "game-godot-android"
  ],
  "game-test": [
   "evaluation-methods",
   "game-godot-android",
   "mobile-huawei-release",
   "mobile-xiaomi-release"
  ]
 },
 "huawei": {
  "app-plan": [
   "mobile-huawei-release",
   "mobile-cn-filing"
  ],
  "app-build": [
   "mobile-compose",
   "mobile-flutter"
  ],
  "app-cloud": [
   "mobile-huawei-release",
   "mobile-cn-filing",
   "mobile-network"
  ],
  "app-test": [
   "mobile-huawei-release"
  ],
  "app-release": [
   "mobile-huawei-release",
   "mobile-cn-filing"
  ],
  "app-store-growth": [
   "mobile-huawei-release"
  ],
  "app-monetize": [
   "mobile-huawei-iap",
   "mobile-huawei-release"
  ],
  "app-operations": [
   "mobile-huawei-release",
   "mobile-huawei-iap"
  ],
  "game-loop": [
   "user-needs",
   "game-godot-2d"
  ],
  "game-build": [
   "game-godot-2d",
   "game-godot-android"
  ],
  "game-test": [
   "evaluation-methods",
   "game-godot-android",
   "mobile-huawei-release",
   "mobile-xiaomi-release"
  ]
 },
 "gameUnknown": {
  "game-loop": [
   "user-needs"
  ],
  "game-build": [
   "game-godot-2d",
   "game-cocos-2d"
  ],
  "game-test": [
   "evaluation-methods"
  ]
 },
 "miniprogram": {
  "wx-plan": [
   "wx-filing",
   "wx-upload",
   "wx-payment",
   "wx-virtual-payment",
   "wx-ads"
  ],
  "wx-cloud": [
   "wx-cloud",
   "wx-cloud-rules"
  ],
  "wx-release": [
   "wx-upload",
   "wx-filing",
   "wx-privacy"
  ],
  "wx-growth": [
   "business-recruit",
   "wx-upload",
   "wx-runtime"
  ],
  "wx-operations": [
   "retention-analysis",
   "wx-upload",
   "wx-ads",
   "wx-payment",
   "wx-virtual-payment"
  ],
  "wx-build": [
   "wx-demo",
   "wx-runtime",
   "wx-privacy"
  ],
  "wx-monetize": [
   "wx-payment",
   "wx-virtual-payment",
   "wx-ads"
  ]
 },
 "minigame": {
  "wx-plan": [
   "wx-filing",
   "wx-upload",
   "wx-game-qualification",
   "wx-game-payment",
   "wx-ads"
  ],
  "wx-cloud": [
   "wx-cloud",
   "wx-cloud-rules"
  ],
  "wx-release": [
   "wx-upload",
   "wx-filing",
   "wx-game-qualification",
   "game-cocos-wechat"
  ],
  "wx-growth": [
   "business-recruit",
   "wx-upload"
  ],
  "wx-operations": [
   "retention-analysis",
   "wx-upload",
   "wx-ads",
   "wx-game-payment"
  ],
  "wx-monetize": [
   "wx-game-payment",
   "wx-ads"
  ],
  "game-loop": [
   "user-needs",
   "game-cocos-2d",
   "wx-game-qualification"
  ],
  "game-build": [
   "game-cocos-2d",
   "game-cocos-wechat"
  ],
  "game-test": [
   "evaluation-methods",
   "game-cocos-wechat",
   "wx-game-payment"
  ]
 },
 "wechatUnknown": {
  "wx-plan": [
   "wx-filing",
   "wx-upload"
  ],
  "wx-cloud": [
   "wx-cloud",
   "wx-cloud-rules"
  ],
  "wx-release": [
   "wx-upload",
   "wx-filing"
  ],
  "wx-growth": [
   "business-recruit",
   "wx-upload"
  ],
  "wx-operations": [
   "retention-analysis",
   "wx-upload",
   "wx-ads"
  ],
  "wx-build": [
   "wx-demo",
   "wx-runtime"
  ],
  "wx-monetize": []
 }
};
export function mobileLesson(task,profile,base){
 if(!isMobileTask(task))return base;
 const platform=taskPlatformKey(task,profile);
 const key=platform==='domestic'?({'小米应用商店':'xiaomi','华为应用市场（Android）':'huawei'}[mobileStore(profile)]||platform):platform;
 let ids=platformReadings[key]?.[task.id]||[];
 if(isGame(profile)&&['app-plan','app-release','app-monetize','game-loop'].includes(task.id))ids=[...new Set([...ids,'wx-game-qualification'])];
 const sources=ids.map(id=>content.readings[id]);
 if(sources.some(r=>!r))throw new Error('手机平台资料映射引用不存在');
 const readings=sources;
 const allowed=new Set(readings.map(r=>r.url));
 const stepReadings=Object.fromEntries(Object.entries(base.stepReadings||{}).map(([title,items])=>[title,items.filter(r=>allowed.has(r.url))]).filter(([,items])=>items.length));
 return {...base,readings,stepReadings};
}
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mobilePlatformPanel(task,profile){
 if(!isMobileTask(task))return '';
 const key=taskPlatformKey(task,profile),phone=content.contextHtml['mobile-platforms']||{},wechat=content.contextHtml['wechat-platforms']||{},context={...phone,...wechat};
 const known=['apple','domestic','google','miniprogram','minigame'].includes(key);
 const label={apple:'App Store',domestic:'国内安卓商店 · '+mobileStore(profile),google:'Google Play',miniprogram:'微信小程序',minigame:'微信小游戏'};
 const candidates=task.id.startsWith('wx-')?['miniprogram','minigame']:task.id.startsWith('game-')?['apple','domestic','google','minigame']:['apple','domestic','google'];
 const body=known?`<div class="markdown-body">${context[key]||''}</div>`:`<p>先选择本轮产品形态与首发平台；以下资料供比较，不要求同时发布多个平台。</p>${candidates.map(id=>`<details class="mobile-platform-option"><summary>${esc(label[id])}</summary><div class="markdown-body">${context[id]||''}</div></details>`).join('')}`;
 return `<details class="lesson-platform"><summary>发布平台：${esc(known?label[key]:'尚未确定')}</summary>${body}${isMobile(profile)&&isGame(profile)&&phone.game?`<div class="markdown-body">${phone.game}</div>`:''}<a class="text-link" id="edit-product-path" href="#/profile">在路线起点选择或修改发布平台 →</a></details>`;
}
