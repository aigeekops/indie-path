import test from 'node:test';
import assert from 'node:assert/strict';
import {tasks,personas,generateRoute} from '../data.js';
import {resolveLesson} from '../lesson-materials.js';
import {learningContent,safe} from '../learning-view.js';

test('五类用户的步骤资料与当前技术路径一致，桥接练习有直接教材',()=>{
 for(const profile of [...personas.map(p=>p.profile),{...personas[4].profile,paid:true}])for(const task of generateRoute(profile)){
  const lesson=resolveLesson(task,profile),html=learningContent(task,profile,{},tasks);
  for(const [title,readings] of Object.entries(lesson.stepReadings||{})){
   assert.ok(lesson.practice.some(s=>s.title===title));
   for(const r of readings){assert.ok(html.includes(safe(r.url)));assert.ok(html.includes(safe(r.chapterText||r.chapter)));}
  }
 }
 const get=(id,role)=>resolveLesson(tasks.find(t=>t.id===id),personas.find(p=>p.role===role).profile);
 assert.ok(get('code-basics','产品').stepReadings['处理三条样例记录'].some(r=>r.url.includes('Array/filter')));
 assert.ok(get('code-basics','产品').practice[0].actionHtml.includes('href="https://nodejs.org/en/download" target="_blank" rel="noopener noreferrer"'));
 assert.ok(get('api','前端').stepReadings['接真实存储'].every(r=>r.url.includes('fullstackopen')));
 assert.ok(get('api','后端').stepReadings['接真实存储'].every(r=>r.url.includes('fastapi')));
 assert.ok(get('ui','后端').stepReadings['复用熟悉的界面技术'].some(r=>r.url.includes('part1/java_script')));
 assert.ok(get('ui','后端').stepReadings['连接真实接口'].some(r=>r.url.includes('Window/print')));
 assert.ok(get('verify','测试').stepReadings['隔离数据并执行'].some(r=>r.url.includes('sqlmodel')));
});

test('关键成果能写进模板，收费先检查实际渠道资格',()=>{
 const p=personas[0].profile,get=id=>resolveLesson(tasks.find(t=>t.id===id),p);
 for(const [id,fields] of Object.entries({
  evidence:['观察事实/用户表述/行为承诺/我的推断','原始出处','回访对象'],
  service:['输入/输出样例','客户试做','报价'],
  find:['流程记录位置','购买','问题假设'],
  review:['访问/开始/完成/付款','未回应','推断单列'],
  ui:['正常/加载/空结果/失败','导出','再次观察'],
  verify:['运行命令','注入前后','审查发现']
 }))for(const field of fields)assert.ok(get(id).template.includes(field),id+':'+field);
 for(const market of ['尚未确定','国内客户','海外市场（产品出海）']){
  const l=resolveLesson(tasks.find(t=>t.id==='charge'),{...p,market});
  assert.ok(/接入准备|availability/.test(l.readings[0].name));
  assert.ok(!l.readings[0].name.includes('Pricing'));
  for(const r of Object.values(l.stepReadings).flat()){
   if(market==='国内客户')assert.ok(!r.url.includes('docs.stripe.com'));
   if(market==='海外市场（产品出海）')assert.ok(!r.url.includes('pay.wechatpay.cn'));
  }
 }
});
