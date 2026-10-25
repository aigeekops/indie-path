import {rm,mkdir,copyFile,lstat} from 'node:fs/promises';
import path from 'node:path';
import {root,siteFiles} from './site-files.mjs';
import {writeContent} from './content-lib.mjs';
await writeContent(root);
const output=path.join(root,'dist');
const files=await siteFiles();
await rm(output,{recursive:true,force:true});
for(const rel of files){if((await lstat(path.join(root,rel))).isSymbolicLink())throw new Error(`拒绝发布符号链接: ${rel}`);const target=path.join(output,rel);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(root,rel),target);}
console.log(`静态产物: dist/ (${files.length} files)`);
