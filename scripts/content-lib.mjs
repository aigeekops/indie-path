import {readFile, readdir, lstat, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import {parseDocument} from 'yaml';

// Markdown 只在构建时解析。正文不执行 HTML、脚本或表达式。
const md = new MarkdownIt({html:false, breaks:true});
md.renderer.rules.link_open=(tokens,index,options,env,renderer)=>{
  if(/^https?:\/\//i.test(tokens[index].attrGet('href')||'')){
    tokens[index].attrSet('target','_blank');
    tokens[index].attrSet('rel','noopener noreferrer');
  }
  return renderer.renderToken(tokens,index,options);
};
const lessonFields = {
  why:'为什么做', prerequisite:'开始条件', learn:'学习要点', practice:'行动步骤',
  template:'成果模板', example:'教学示例', pitfalls:'常见问题', deliverables:'交付成果',
  next:'下一步', pathNote:'路径说明', checks:'完成标准', ai:'AI参与方式', taskReason:'推荐原因'
};
const stageFields = {
  watch:'选读建议', practice:'本轮行动', output:'本轮产出', accept:'完成判断',
  exportPractice:'海外客户实践', domesticPractice:'国内客户实践'
};
const phaseFields = {learn:'学习要点', practice:'实践步骤', artifact:'成果样例', bad:'不合格示例', checks:'完成标准', branches:'下一步分支'};
const fail = (file,message) => {throw new Error(`${file}: ${message}`);};
const plainText=source=>md.parse(source,{}).filter(t=>t.type==='inline'||t.type==='fence'||t.type==='code_block').map(t=>t.children?t.children.map(c=>c.content).join(''):t.content).join(' ').replace(/\s+/g,' ').trim();

export function sections(source, depth=2) {
  const lines=source.split('\n'), tokens=md.parse(source,{}), heads=[];
  for(let i=0;i<tokens.length;i++)if(tokens[i].type==='heading_open'&&tokens[i].tag===`h${depth}`&&tokens[i].level===0){
    heads.push({title:tokens[i+1].content,line:tokens[i].map[0],end:tokens[i].map[1]});
  }
  return heads.map((head,i)=>({...head,body:lines.slice(head.end,heads[i+1]?.line??lines.length).join('\n').trim()}));
}

function mapping(source,file,depth=2){
  const result={};for(const section of sections(source,depth)){
    if(Object.hasOwn(result,section.title))fail(file,`重复章节「${section.title}」`);
    result[section.title]=section.body;
  }return result;
}
function items(source){
  return md.parse(source,{}).filter(t=>t.type==='inline'&&t.level===3).map(t=>t.content);
}
function code(source){
  const token=md.parse(source,{}).find(t=>t.type==='fence'||t.type==='code_block');
  return token?token.content.replace(/\n$/,''):source;
}
function steps(source,file){
  return sections(source,3).map(section=>{
    const outputs=sections(section.body,4);
    if(outputs.length!==1||outputs[0].title!=='这一步留下')fail(file,`步骤「${section.title}」需要「#### 这一步留下」`);
    const action=section.body.split('\n').slice(0,outputs[0].line).join('\n').trim();
    if(!action||!outputs[0].body)fail(file,`步骤「${section.title}」缺少行动或产出`);
    return {title:section.title,action,result:outputs[0].body,actionHtml:md.render(action),resultHtml:md.render(outputs[0].body)};
  });
}
function branches(source,file){
  return sections(source,3).map(section=>{
    const target=sections(section.body,4);
    if(target.length!==1||target[0].title!=='对应任务')fail(file,'分支需要「#### 对应任务」');
    return {when:section.title,action:section.body.split('\n').slice(0,target[0].line).join('\n').trim(),task:target[0].body==='无'?null:target[0].body};
  });
}
function fields(source,file,names,{lists=[],codes=[],stepFields=[],branchFields=[]}={}){
  const entries=mapping(source,file),result={html:{}};
  for(const[key,label]of Object.entries(names))if(Object.hasOwn(entries,label)){
    const value=entries[label];
    result[key]=lists.includes(key)?items(value):codes.includes(key)?code(value):stepFields.includes(key)?steps(value,file):branchFields.includes(key)?branches(value,file):value;
    result.html[key]=lists.includes(key)?result[key].map(v=>md.renderInline(v)):md.render(value);
  }return result;
}

export function parseMarkdown(source,file='Markdown'){
  source=source.replaceAll('\r\n','\n');
  if(!source.startsWith('---\n'))fail(file,'需要 YAML 头部');
  const end=source.indexOf('\n---\n',4);if(end<0)fail(file,'YAML 头部未结束');
  const document=parseDocument(source.slice(4,end),{uniqueKeys:true});
  if(document.errors.length)fail(file,document.errors[0].message);
  const meta=document.toJS({maxAliasCount:0});
  if(!meta||typeof meta!=='object'||Array.isArray(meta))fail(file,'头部须为对象');
  if(!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(meta.id||''))fail(file,'id 只能使用英文、数字和连字符');
  const body=source.slice(end+5).trim(), titles=sections(body,1);
  if(titles.length!==1)fail(file,'正文需要且只能有一个一级标题');
  return {meta,title:titles[0].title,body:titles[0].body,file};
}

async function markdownFiles(dir){
  const files=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const absolute=path.join(dir,entry.name);
    if((await lstat(absolute)).isSymbolicLink())throw new Error(`内容目录不能使用符号链接: ${absolute}`);
    if(entry.isDirectory())files.push(...await markdownFiles(absolute));
    else if(entry.name.endsWith('.md'))files.push(absolute);
  }return files.sort();
}

export async function compileContent(root){
  const documents=[];
  for(const file of await markdownFiles(path.join(root,'content'))){
    const relative=path.relative(root,file).split(path.sep).join('/');
    documents.push(parseMarkdown(await readFile(file,'utf8'),relative));
  }
  const result={readings:{},marketSources:{},businessReadings:{},tasks:[],curriculum:{},variants:{},stages:[],cases:{},roleAdvice:{},freeCourses:[],personas:[],contexts:{},contextHtml:{},guides:{},topics:[],starts:[]};
  const seen=new Set();
  for(const doc of documents){const key=doc.meta.kind+':'+doc.meta.id;if(seen.has(key))fail(doc.file,`重复标识 ${key}`);seen.add(key);}
  for(const doc of documents.filter(d=>d.meta.kind==='source')){
    const {meta,file}=doc;
    if(typeof meta.url!=='string'||!/^https:\/\/[^\s"'<>]+$/.test(meta.url))fail(file,'原始来源必须是有效 HTTPS 链接');
    try{new URL(meta.url);}catch{fail(file,'原始来源 URL 无效');}
    if(!/^\d{4}-\d{2}-\d{2}$/.test(meta.checked_at||''))fail(file,'资料需要真实核验日期 checked_at');
    const value=fields(doc.body,file,{chapter:'选读范围',goal:'阅读终点',access:'访问说明',note:'核验范围'});
    value.chapterHtml=value.html.chapter||'';
    value.chapterText=plainText(value.chapter||'');
    value.noteHtml=value.html.note||'';
    value.chapterHtml=md.renderInline(value.chapter||'');
    value.chapterText=plainText(value.chapter||'');
    delete value.html;
    for(const key of ['chapter','goal'])if(!value[key])fail(file,`资料缺少 ${key}`);
    const source={name:doc.title,url:meta.url,checkedAt:meta.checked_at,...value,contentPath:file};
    result.readings[meta.id]=source;
    if(meta.set==='market')result.marketSources[meta.key]=source;
    if(meta.set==='business')result.businessReadings[meta.key]=source;
  }
  const readings=(ids=[],file)=>ids.map(id=>{if(!result.readings[id])fail(file,`引用不存在的资料 ${id}`);return result.readings[id];});
  const shared={};
  const parsePhase=doc=>{
    const value=fields(doc.body,doc.file,phaseFields,{lists:['learn','practice','checks'],codes:['artifact'],branchFields:['branches']});
    return {title:doc.title,...value,resources:readings(doc.meta.readings,doc.file),contentPath:doc.file};
  };
  for(const doc of documents.filter(d=>d.meta.kind==='shared-case'))shared[doc.meta.id]=parsePhase(doc);
  for(const doc of documents){
    const {meta,file,title,body}=doc;
    if(['task','variant'].includes(meta.kind)){
      const allowed=new Set([...Object.values(lessonFields),'快速入口']);
      for(const title of Object.keys(mapping(body,file)))if(!allowed.has(title))fail(file,`未知任务章节「${title}」；请使用内容规范中的章节标题`);
      const lesson=fields(body,file,lessonFields,{lists:['learn','pitfalls','deliverables','checks'],codes:['template'],stepFields:['practice']});
      if(meta.readings)lesson.readings=readings(meta.readings,file);
      if(meta.step_readings){
        if(typeof meta.step_readings!=='object'||Array.isArray(meta.step_readings))fail(file,'step_readings 须按步骤标题指定资料列表');
        lesson.stepReadings=Object.fromEntries(Object.entries(meta.step_readings).map(([title,ids])=>{
          if(!Array.isArray(ids))fail(file,`步骤「${title}」的资料须为列表`);
          return [title,readings(ids,file)];
        }));
      }
      lesson.contentPath=file;
      if(meta.kind==='variant'){
        result.variants[meta.id]={task:meta.task,...lesson,...(meta.task_override?{taskTitle:title,taskSubtitle:meta.subtitle}:{})};
      }else{
        for(const key of ['why','prerequisite','learn','practice','template','example','pitfalls','deliverables','next','checks','ai'])if(!lesson[key]?.length)fail(file,`任务缺少「${lessonFields[key]}」`);
        if(!lesson.readings?.length)fail(file,'任务需要参考资料');
        if(!Number.isInteger(meta.order)||!meta.stage)fail(file,'任务需要 order 和 stage');
        const {checks,ai,...curriculum}=lesson;
        const task={id:meta.id,title,subtitle:meta.subtitle,caseChapter:meta.case_chapter,skill:meta.skill??null,effort:meta.effort,stageId:meta.stage,order:meta.order,checks,ai,aiHtml:lesson.html.ai,contentPath:file};
        result.tasks.push(task);result.curriculum[meta.id]=curriculum;
        const quick=mapping(body,file)['快速入口'];
        if(quick){const v=mapping(quick,file,3);result.starts.push({id:meta.id,title:v['入口标题'],name:v['模板名称'],description:v['说明'],first:v['开始提示']});}
      }
    }else if(meta.kind==='stage'){
      const stage=fields(body,file,stageFields),all=mapping(body,file);
      const nested=(name,keys)=>{const values=mapping(all[name]||'',file,3);return Object.fromEntries(Object.entries(keys).map(([key,label])=>[key,values[label]||'']));};
      result.stages.push({id:meta.id,title,number:meta.order,task:meta.task,...stage,primary:readings([meta.primary],file)[0],secondary:readings(meta.secondary,file),card:nested('入口卡片',{title:'标题',description:'说明',template:'模板',output:'产出'}),map:nested('地图摘要',{question:'问题',action:'行动',output:'产出',check:'完成标准'}),contentPath:file});
    }else if(meta.kind==='case'){
      const value=fields(body,file,{scope:'产品范围',price:'教学报价'});delete value.html;
      result.cases[meta.id]={id:meta.id,title,market:meta.market,audience:meta.audience,...value,phases:{},contentPath:file};
    }else if(meta.kind==='role'){
      const value=fields(body,file,{advantage:'已有优势',gap:'需要补齐',practice:'本轮实践'});delete value.html;result.roleAdvice[meta.role]=value;
    }else if(meta.kind==='course'){
      const value=fields(body,file,{audience:'适合谁',format:'资料形式',practice:'实践',reason:'入选依据',limits:'适用边界'});
      if(!['core','reference'].includes(meta.tier))fail(file,'课程入口需要 core 或 reference 分组');
      for(const key of ['audience','format','practice','reason','limits'])if(!value[key])fail(file,`课程入口缺少 ${key}`);
      result.freeCourses.push({name:title,...value,tier:meta.tier,task:meta.task,resource:readings([meta.reading],file)[0],order:meta.order});
    }else if(meta.kind==='persona')result.personas.push({name:title,role:meta.role,caption:body.trim(),profile:meta.profile,order:meta.order});
    else if(meta.kind==='context'){
      result.contexts[meta.id]=mapping(body,file);
      result.contextHtml[meta.id]=Object.fromEntries(Object.entries(result.contexts[meta.id]).map(([key,value])=>[key,md.render(value)]));
    }else if(meta.kind==='guide'){
      const guide={title,html:md.render(body),body,contentPath:file};
      if(meta.walkthrough){
        const panels=sections(body);
        if(!Array.isArray(meta.walkthrough)||meta.walkthrough.length!==4||panels.length!==4)fail(file,'首页演示需要四个步骤与四段正文');
        guide.intro=body.split('\n').slice(0,panels[0].line).join('\n').trim();
        guide.walkthrough=meta.walkthrough.map((step,i)=>{
          for(const field of ['task','caption','action','output','check'])if(typeof step[field]!=='string'||!step[field].trim())fail(file,`演示步骤缺少 ${field}`);
          return {...step,title:panels[i].title,html:md.render(panels[i].body)};
        });
      }
      result.guides[meta.id]=guide;
    }
    else if(meta.kind==='topic'){
      if(!meta.summary||!meta.jurisdiction||!/^\d{4}-\d{2}-\d{2}$/.test(meta.reviewed_at||''))fail(file,'专题需要 summary、jurisdiction 与 reviewed_at');
      const entries=mapping(body,file);if(!entries['行动步骤']||!entries['成果模板']||!entries['完成标准'])fail(file,'专题需要行动步骤、成果模板与完成标准');
      result.topics.push({id:meta.id,title,summary:meta.summary,jurisdiction:meta.jurisdiction,reviewedAt:meta.reviewed_at,relatedTasks:meta.related_tasks||[],relatedTopics:meta.related_topics||[],order:meta.order||0,body,searchText:plainText(body),html:md.render(body),sections:sections(body).map((s,i)=>({title:s.title,id:'topic-section-'+(i+1),html:md.render(s.body)})),template:code(entries['成果模板']),sources:readings(meta.readings,file),contentPath:file});
    }else if(!['source','shared-case','case-phase'].includes(meta.kind))fail(file,`未知内容类型 ${meta.kind}`);
  }
  for(const doc of documents.filter(d=>d.meta.kind==='case-phase')){
    const parent=result.cases[doc.meta.case];if(!parent)fail(doc.file,'案例总览不存在');
    let value;
    if(doc.meta.shared){const base=shared[doc.meta.shared];if(!base)fail(doc.file,'共用案例章节不存在');const local=fields(doc.body,doc.file,{artifact:'成果样例'},{codes:['artifact']});value={...base,...local,html:{...base.html,...local.html},shared:true,contentPath:doc.file};}
    else value=parsePhase(doc);
    if(parent.phases[doc.meta.chapter])fail(doc.file,'案例章节编号重复');parent.phases[doc.meta.chapter]=value;
  }
  result.tasks.sort((a,b)=>a.order-b.order);result.stages.sort((a,b)=>a.number-b.number);
  result.topics.sort((a,b)=>a.order-b.order);result.freeCourses.sort((a,b)=>a.order-b.order);result.personas.sort((a,b)=>a.order-b.order);
  const taskIds=new Set(result.tasks.map(t=>t.id)),topicIds=new Set(result.topics.map(t=>t.id));
  for(const course of result.freeCourses)if(!taskIds.has(course.task))throw new Error(`课程练习不存在 ${course.task}`);
  for(const guide of Object.values(result.guides))for(const step of guide.walkthrough||[])if(!taskIds.has(step.task))fail(guide.contentPath,`演示任务不存在 ${step.task}`);
  for(const id of topicIds)if(taskIds.has(id))throw new Error(`专题与任务 id 不得重复: ${id}`);
  if(result.stages.length!==6)throw new Error('主线需要且只能有六个经营阶段');
  for(const stage of result.stages){stage.taskIds=result.tasks.filter(t=>t.stageId===stage.id).map(t=>t.id);if(!stage.taskIds.includes(stage.task))fail(stage.contentPath,'阶段入口不在本阶段');}
  for(const task of result.tasks)if(!result.stages.some(s=>s.id===task.stageId))fail(task.contentPath,'任务所属阶段不存在');
  for(const [id,variant]of Object.entries(result.variants))if(!taskIds.has(variant.task))throw new Error(`变体 ${id} 对应任务不存在`);
  for(const lesson of [...Object.values(result.curriculum),...Object.values(result.variants)]){
    const practice=lesson.practice||result.curriculum[lesson.task]?.practice||[];
    for(const title of Object.keys(lesson.stepReadings||{}))if(!practice.some(step=>step.title===title))fail(lesson.contentPath,`资料关联的步骤不存在「${title}」`);
  }
  for(const c of Object.values(result.cases)){
    if(Object.keys(c.phases).length!==7)fail(c.contentPath,'案例需要七个教学章节');
    for(const phase of Object.values(c.phases))for(const b of phase.branches||[])if(b.task&&!taskIds.has(b.task))fail(phase.contentPath,`分支任务不存在 ${b.task}`);
  }
  for(const topic of result.topics){for(const id of topic.relatedTasks)if(!taskIds.has(id))fail(topic.contentPath,`关联任务不存在 ${id}`);for(const id of topic.relatedTopics)if(!topicIds.has(id))fail(topic.contentPath,`关联专题不存在 ${id}`);}
  // 所有页面和搜索引用同一组构建产物；同时检查正文中的站内任务/专题/案例链接。
  for(const doc of documents){
    for(const token of md.parse(doc.body,{}))for(const child of token.children||[]){
      if(child.type!=='link_open'&&child.type!=='image')continue;
      const href=child.attrGet(child.type==='image'?'src':'href')||'';
      const route=href.match(/^#\/(task|topic|case)\/([^/#]+)/);
      if(route){const ids=route[1]==='task'?taskIds:route[1]==='topic'?topicIds:new Set(Object.keys(result.cases));if(!ids.has(route[2]))fail(doc.file,`站内链接不存在 ${href}`);}
      if(href.startsWith('./')||href.startsWith('../')){
        const target=path.resolve(root,path.dirname(doc.file),decodeURIComponent(href.split('#')[0]));
        if(!target.startsWith(root+path.sep))fail(doc.file,'相对链接越出项目');
        try{await lstat(target);}catch{fail(doc.file,`相对链接不存在 ${href}`);}
      }
    }
  }
  result.checkedAt=Object.values(result.readings).map(s=>s.checkedAt).sort().at(-1);
  result.sharedImplementation=shared.implementation;
  result.implementationSamples=Object.fromEntries(Object.values(result.cases).map(c=>[c.id,c.phases[3].artifact]));
  result.stats={documents:documents.length,tasks:result.tasks.length,stages:result.stages.length,cases:Object.keys(result.cases).length,topics:result.topics.length,sources:Object.keys(result.readings).length};
  return result;
}

export async function writeContent(root){
  const content=await compileContent(root);
  await mkdir(path.join(root,'generated'),{recursive:true});
  await writeFile(path.join(root,'generated/content.js'),'// 自动生成自 content/**/*.md；请修改 Markdown 原文。\nexport const content = '+JSON.stringify(content)+';\n');
  return content;
}
