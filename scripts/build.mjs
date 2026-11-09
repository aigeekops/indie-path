import {rm,mkdir,copyFile,lstat,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {root,siteFiles} from './site-files.mjs';
import {writeContent} from './content-lib.mjs';
import {analyticsTag,injectAnalytics} from './analytics.mjs';
await writeContent(root);
const output=path.join(root,'dist');
const files=await siteFiles();
await rm(output,{recursive:true,force:true});
for(const rel of files){if((await lstat(path.join(root,rel))).isSymbolicLink())throw new Error(`拒绝发布符号链接: ${rel}`);const target=path.join(output,rel);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(root,rel),target);}
const tag=analyticsTag();
if(tag){
  const entry=path.join(output,'index.html');
  await writeFile(entry,injectAnalytics(await readFile(entry,'utf8')));
}
console.log(`静态产物: dist/ (${files.length} files)；访问统计: ${tag?'部署构建已注入（仅 dist/index.html）':'未配置，零第三方脚本'}`);
