import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {compileContent} from '../scripts/content-lib.mjs';
import {content} from '../generated/content.js';
import {topicsPage,topicPage,searchTopics} from '../content-view.js';
import {generateRoute,blankProfile} from '../data.js';
const root=fileURLToPath(new URL('../',import.meta.url));

test('Markdown 修改进入构建数据和正文，保留任务 ID 与完成标准，并拒绝失效引用',async()=>{
 const temp=await mkdtemp(path.join(tmpdir(),'indie-content-'));
 try{
  await cp(path.join(root,'content'),path.join(temp,'content'),{recursive:true});
  const file=path.join(temp,'content/tasks/find.md'),source=await readFile(file,'utf8');
  await writeFile(file,source.replace('## 为什么做\n\n','## 为什么做\n\n**本次维护标记**\n\n<script>window.injected=1</script>\n\n'));
  const compiled=await compileContent(temp);
  assert.ok(compiled.curriculum.find.html.why.includes('<strong>本次维护标记</strong>'));
  assert.ok(!compiled.curriculum.find.html.why.includes('<script>'));
  assert.deepEqual(compiled.tasks.find(t=>t.id==='find').checks,content.tasks.find(t=>t.id==='find').checks);
  await writeFile(file,(await readFile(file,'utf8')).replace('  - interview','  - missing-reference'));
  await assert.rejects(()=>compileContent(temp),/引用不存在的资料/);
  await writeFile(file,source.replace('先询问经历，不推销想法:', '不存在的步骤:'));
  await assert.rejects(()=>compileContent(temp),/资料关联的步骤不存在/);
 }finally{await rm(temp,{recursive:true,force:true});}
});

test('经营专题可以搜索、填写独立草稿和查阅来源，不自动增加主线任务',()=>{
 assert.equal(content.stages.length,6);assert.equal(content.tasks.length,56);assert.equal(content.topics.length,9);
 assert.ok(topicsPage().includes('#/topic/hk-registration'));
 assert.ok(searchTopics('香港 注册').some(x=>x.topic.id==='hk-registration'));
 assert.ok(searchTopics('报税').some(x=>x.topic.id==='cn-tax'));
 const html=topicPage('hk-registration',{'topic:hk-registration':'我的办理草稿 <script>'});
 assert.ok(html.includes('我的办理草稿 &lt;script&gt;'));assert.ok(html.includes('data-worksheet-id="topic:hk-registration"'));assert.ok(!html.includes('data-task-id='));assert.ok(html.includes('官方资料与核验范围'));
 assert.ok(html.includes('/edit/main/content/topics/hk-registration.md'));
 assert.ok(html.includes('class="source-scope"'));
 assert.ok(html.includes('href="https://www.cr.gov.hk/sc/forms/specified.htm"'));
 assert.ok(!html.includes('[正式表格目录]('));
 assert.ok(generateRoute(blankProfile()).every(t=>!content.topics.some(x=>x.id===t.id)));
});
