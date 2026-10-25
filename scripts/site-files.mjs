import {readdir,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const root=fileURLToPath(new URL('../',import.meta.url));
// 仅这些类型的入口可发布；文档、测试、工作流和本地截图不进入站点。
export async function siteFiles(){
 const files=['index.html','styles.css','.nojekyll'];
 for(const name of await readdir(root))if(name.endsWith('.js'))files.push(name);
 async function assets(dir){for(const name of await readdir(path.join(root,dir))){const rel=path.posix.join(dir,name),s=await lstat(path.join(root,rel));if(s.isSymbolicLink())throw new Error(`拒绝发布符号链接: ${rel}`);if(s.isDirectory())await assets(rel);else if(s.isFile())files.push(rel);}}
 await assets('assets');
 // 浏览器只读取已编译的数据模块，不加载 Markdown 解析器或 Node 依赖。
 await assets('generated');return files.sort();
}
