import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {watch} from 'node:fs';
import path from 'node:path';
import {root,siteFiles} from './site-files.mjs';
import {writeContent} from './content-lib.mjs';

const port=Number(process.env.PORT||4173);
await writeContent(root);
const files=new Set(await siteFiles());
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
let timer,contentError=null;
const watcher=watch(path.join(root,'content'),{recursive:true},()=>{
 clearTimeout(timer);timer=setTimeout(async()=>{try{await writeContent(root);contentError=null;console.log('Markdown 已重新编译，请刷新浏览器。');}catch(error){contentError=error.message;console.error(contentError);}},120);
});
const server=createServer(async(req,res)=>{
 try{
  if(contentError){res.writeHead(503,{'Content-Type':'text/plain; charset=utf-8'});res.end('Markdown 编译失败：'+contentError);return;}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=pathname==='/'?'index.html':pathname.slice(1);
  if(!files.has(file)){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(await readFile(path.join(root,file)));
 }catch{res.writeHead(500);res.end('Unable to read file');}
});
server.listen(port,'127.0.0.1',()=>console.log(`本地预览 http://127.0.0.1:${port} · Markdown 保存后自动编译`));
server.on('error',error=>{console.error(`本地预览未启动：${error.message}`);watcher.close();process.exitCode=1;});
const close=()=>{watcher.close();server.close();};process.on('SIGINT',close);process.on('SIGTERM',close);
