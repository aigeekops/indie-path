import {fileURLToPath} from 'node:url';
import {writeContent} from './content-lib.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const content=await writeContent(root);
console.log(`Markdown 内容编译通过: ${JSON.stringify(content.stats)}`);
