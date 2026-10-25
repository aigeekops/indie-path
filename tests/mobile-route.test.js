import test from 'node:test';
import assert from 'node:assert/strict';
import {tasks,blankProfile,generateRoute} from '../data.js';
import {stages} from '../stages.js';
import {buildJourney,taskStatus} from '../journey.js';
import {resultMatches} from '../acceptance.js';
import {resolveLesson} from '../lesson-materials.js';
import {learningContent} from '../learning-view.js';
import {profilePreview} from '../profile-preview.js';

const mobile=(extra={})=>({...blankProfile(),form:'移动端',mobilePlatform:'尚未确定',mobileData:'仅本地数据',...extra});
const byId=(list,id)=>list.find(task=>task.id===id);
const appIds=['app-plan','app-build','app-cloud','app-test','app-release','app-store-growth','app-monetize','app-operations'];
const saved=task=>({status:'done',criteria:JSON.stringify(task.checks),decision:'continue',date:'2026-10-25T12:00:00Z'});

test('手机应用贯通六阶段，本地应用不安排网页部署或自建账户支付',()=>{
 const profile=mobile(),route=generateRoute(profile),ids=route.map(task=>task.id),journey=buildJourney({profile});
 assert.equal(tasks.length,57);
 assert.equal(stages.length,6);
 assert.equal(stages.find(stage=>stage.id==='monetization').title,'变现与收费');
 for(const id of appIds.filter(id=>id!=='app-cloud'))assert.ok(ids.includes(id),id);
 for(const id of ['web-basics','code-basics','contract','api','ui','auth','verify','usability','ship','reach','charge','operate','app-cloud'])assert.ok(!ids.includes(id),id);
 assert.equal(ids[0],'find');
 assert.ok(ids.indexOf('app-plan')<ids.indexOf('app-build'));
 assert.ok(ids.indexOf('app-test')<ids.indexOf('app-release'));
 assert.equal(new Set(ids).size,ids.length);
 assert.deepEqual(journey.stages.map(stage=>stage.id),stages.map(stage=>stage.id));
 assert.equal(journey.stages.flatMap(stage=>stage.tasks).length,route.length);
 assert.ok(journey.stages.every(stage=>stage.tasks.length>0));
 for(const task of route.filter(task=>task.id.startsWith('app-'))){
  assert.ok(stages.find(stage=>stage.id===task.stageId).taskIds.includes(task.id));
  const html=learningContent(task,profile,{},route);
  assert.ok(html.includes('id="practice"'),task.id);
  assert.ok(html.includes('id="template"'),task.id);
 }
});

test('明确需要云服务才增加云端实践，网页能力不自动证明手机开发能力',()=>{
 const local=generateRoute(mobile()),unknown=generateRoute(mobile({mobileData:'尚未确定'}));
 const cloud=generateRoute(mobile({mobileData:'需要云端服务'}));
 assert.ok(!byId(local,'app-cloud'));assert.ok(!byId(unknown,'app-cloud'));assert.ok(byId(cloud,'app-cloud'));
 assert.ok(cloud.findIndex(task=>task.id==='app-cloud')<cloud.findIndex(task=>task.id==='app-test'));
 const webExpert=mobile();webExpert.skills={...webExpert.skills,frontend:2,backend:2};
 assert.equal(byId(generateRoute(webExpert),'app-build').mode,'required');
 const html=profilePreview(mobile({mobileData:'需要云端服务'}),{before:local,field:'mobileData'});
 assert.ok(html.includes(byId(cloud,'app-cloud').title));
});

test('三个平台独立于国内外市场选择，平台变化要求重新核对发布成果',()=>{
 const profiles=['App Store','国内安卓商店','Google Play'].map(mobilePlatform=>mobile({mobilePlatform,market:'国内客户'}));
 const releases=profiles.map(profile=>byId(generateRoute(profile),'app-release'));
 assert.equal(new Set(releases.map(task=>JSON.stringify(task.checks))).size,3);
 for(let index=0;index<profiles.length;index++){
  assert.ok(releases[index].checks.some(check=>check.includes(profiles[index].mobilePlatform)));
  const lesson=resolveLesson(releases[index],profiles[index]);
  assert.ok(lesson.readings.length>0);
  assert.ok(lesson.readings.every(reading=>new URL(reading.url).protocol==='https:'));
 }
 const record=saved(releases[0]);
 assert.equal(resultMatches(record,releases[0]),true);
 assert.equal(resultMatches(record,releases[1]),false);
 assert.equal(taskStatus(releases[1],{'app-release':record}),'成果待复核');
 const unknown=byId(generateRoute(mobile()),'app-release');
 assert.ok(unknown.checks.some(check=>/尚未确定|未选择|待选择|未确定/.test(check)));
 assert.ok(!resultMatches(record,unknown));
 // Changing the target market must not silently choose another app store.
 const overseas=byId(generateRoute(mobile({mobilePlatform:'App Store',market:'海外市场（产品出海）'})),'app-release');
 assert.ok(overseas.checks.some(check=>check.includes('App Store')));
});

test('手机任务可手动加入和搜索目录，网页路线加入共用内容实践',()=>{
 const web=blankProfile();
 const webIds=generateRoute(web).map(task=>task.id);
 assert.deepEqual(webIds,['find','segment','evidence','validation-experiment','cn-gates','scope','positioning','landing-page','price','web-basics','code-basics','ui','ai-cost','ai-evaluation','verify','usability','ship','reach','content-plan','charge','support','review','operate','content-review','prioritization']);
 assert.deepEqual(generateRoute({...web,mobilePlatform:'Google Play',mobileData:'需要云端服务'}).map(task=>task.id),webIds);
 const withAdded=generateRoute(mobile(),['app-release','retention','retention','not-a-task']).map(task=>task.id);
 assert.equal(withAdded.filter(id=>id==='app-release').length,1);
 assert.equal(withAdded.filter(id=>id==='retention').length,1);
 assert.ok(!withAdded.includes('not-a-task'));
 const publicJourney=buildJourney();
 for(const id of appIds)assert.ok(publicJourney.list.some(task=>task.id===id),id);
});

test('切换产品形态保留共用需求成果，不把网页交付当成应用上架',()=>{
 const web=generateRoute(blankProfile()),records={find:saved(byId(web,'find')),ship:saved(byId(web,'ship'))};
 const journey=buildJourney({profile:mobile(),records});
 assert.ok(resultMatches(records.find,byId(journey.list,'find')));
 assert.equal(journey.completed,1);
 assert.ok(!byId(journey.list,'ship'));
 assert.ok(!resultMatches(records.ship,byId(journey.list,'app-release')));
 const before=generateRoute(blankProfile()),html=profilePreview(mobile(),{before,field:'form'});
 assert.ok(html.includes(byId(journey.list,'app-release').title));
 assert.ok(html.includes(byId(web,'ship').title));
});

test('微信与游戏按产品形态改流程，变现测试早于提审，云服务按需加入',()=>{
 for(const form of ['移动端','手机游戏','微信小程序','微信小游戏']){
  const profile=mobile({form,mobilePlatform:'App Store'}),route=generateRoute(profile),ids=route.map(t=>t.id),wx=form.startsWith('微信'),game=form.includes('游戏'),prefix=wx?'wx':'app';
  assert.ok(ids.includes(prefix+'-plan'));
  assert.ok(ids.indexOf(prefix+'-monetize')<ids.indexOf(prefix+'-release'));
  assert.ok(!ids.includes(prefix+'-cloud'));
  assert.equal(ids.includes('game-loop'),game);assert.equal(ids.includes('game-build'),game);assert.equal(ids.includes('game-test'),game);
  for(const id of ['ship','charge','auth','api'])assert.ok(!ids.includes(id),form+id);
  if(wx)assert.ok(ids.every(id=>!id.startsWith('app-')));
  assert.ok(generateRoute({...profile,mobileData:'需要云端服务'}).some(t=>t.id===prefix+'-cloud'));
  const records=Object.fromEntries(route.map(t=>[t.id,saved(t)]));
  assert.equal(buildJourney({profile,records}).completed,route.length);
 }
});

test('应用来源跟随具体平台，未知平台不默认引向海外支付',()=>{
 const lesson=(mobilePlatform,mobileStore)=>{const p=mobile({mobilePlatform,mobileStore});return resolveLesson(byId(generateRoute(p),'app-monetize'),p);};
 const names=l=>l.readings.map(r=>r.name).join(' ');
 assert.match(names(lesson('App Store')),/Apple/);
 assert.match(names(lesson('Google Play')),/Google/);
 const xiaomi=names(lesson('国内安卓商店','小米应用商店'));
 assert.match(xiaomi,/小米|米盟/);assert.doesNotMatch(xiaomi,/华为|AdMob|Google|Apple/);
 assert.match(names(lesson('国内安卓商店','华为应用市场（Android）')),/华为/);
 assert.equal(lesson('尚未确定').readings.length,0);
});

test('微信小游戏不把小程序实物支付当虚拟道具链路，游戏工程有独立选读',()=>{
 const p=mobile({form:'微信小游戏'}),r=generateRoute(p);
 const l=resolveLesson(byId(r,'wx-monetize'),p);
 assert.ok(l.readings.some(x=>x.contentPath.endsWith('/wx-game-payment.md')));
 assert.ok(!l.readings.some(x=>x.contentPath.endsWith('/wx-payment.md')||x.contentPath.endsWith('/wx-virtual-payment.md')));
 const build=resolveLesson(byId(r,'game-build'),p);
 assert.ok(build.readings.some(x=>x.contentPath.endsWith('/game-cocos-wechat.md')));
 assert.ok(!build.readings.some(x=>x.contentPath.endsWith('/game-godot-ios.md')));
 const changed=mobile({form:'微信小程序'}),old=byId(r,'wx-release'),current=byId(generateRoute(changed),'wx-release');
 assert.ok(!resultMatches(saved(old),current));
});

test('专项任务的本轮前置依赖都排在任务之前，完成后继续对应运营',async()=>{
 const {prerequisiteIds}=await import('../curriculum.js'),{focusCard}=await import('../growth-view.js');
 for(const form of ['移动端','手机游戏','微信小程序','微信小游戏']){
  const p=mobile({form,mobileData:'需要云端服务'}),r=generateRoute(p),ids=r.map(t=>t.id);
  for(const t of r.filter(t=>/^(app|wx|game)-/.test(t.id))){
   for(const before of prerequisiteIds(t.id,p)){
    assert.ok(ids.includes(before),`${form}/${t.id} 缺少 ${before}`);
    assert.ok(ids.indexOf(before)<ids.indexOf(t.id),`${form}/${t.id} 前置 ${before} 顺序错误`);
   }
  }
  const html=focusCard({task:null},p);
  assert.ok(html.includes(form.startsWith('微信')?'wx-operations':'app-operations'));
  assert.ok(!html.includes('task/operate"'));
 }
});
