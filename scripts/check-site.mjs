import {readFile,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {root,siteFiles} from './site-files.mjs';
const files=await siteFiles(),set=new Set(files);
for(const rel of files){
 if(rel.endsWith('.js')){
  const check=spawnSync(process.execPath,['--check',path.join(root,rel)],{encoding:'utf8'});
  if(check.status!==0)throw new Error(check.stderr||`语法检查失败: ${rel}`);
  const js=await readFile(path.join(root,rel),'utf8');
  for(const m of js.matchAll(/(?:import|export)\s+[^;]*?from\s*['"]([^'"]+)['"]/g)){
   if(!m[1].startsWith('./'))throw new Error(`浏览器模块必须使用本地相对路径: ${rel} -> ${m[1]}`);
   const target=path.posix.normalize(path.posix.join(path.posix.dirname(rel),m[1]));
   if(!set.has(target))throw new Error(`模块未进入发布包: ${rel} -> ${target}`);
  }
 }
}
const html=await readFile(path.join(root,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))if(!set.has(m[1].slice(2)))throw new Error(`HTML引用未进入发布包: ${m[1]}`);
if(!html.includes('https://github.com/aigeekops/indie-path'))throw new Error('缺少项目入口');
if(!html.includes('极客行动'))throw new Error('缺少公众号名称');
const qr=await readFile(path.join(root,'assets/wechat-qr.jpg'));
if(qr[0]!==0xff||qr[1]!==0xd8||(await stat(path.join(root,'assets/wechat-qr.jpg'))).size<100)throw new Error('二维码不是有效JPEG文件');
console.log(`入口/模块/发布引用检查通过 (${files.length} files)`);
