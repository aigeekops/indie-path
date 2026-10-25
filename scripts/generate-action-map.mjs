import {readFile,writeFile} from 'node:fs/promises';
import {actionStages} from '../action-map.js';

// 与网站共用阶段摘要、品牌色和图标；导出 SVG 可独立打开。
const tokens=await readFile(new URL('../assets/brand/tokens.css',import.meta.url),'utf8');
const sprite=await readFile(new URL('../assets/brand/icons.svg',import.meta.url),'utf8');
const color=name=>tokens.match(new RegExp(`--ip-color-${name}:\\s*([^;]+)`))[1].trim();
const night=color('night'),paper=color('paper'),ink=color('ink'),mint=color('accent'),muted=color('muted-on-light');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=24,fill=ink,weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}">${esc(s)}</text>`;
const icon=(name,x,y,size,fill)=>{const symbol=sprite.match(new RegExp(`<symbol id="${name}"[^>]*>([\\s\\S]*?)</symbol>`));if(!symbol)throw new Error(`缺失图标 ${name}`);return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 ${name==='brand'?32:24} ${name==='brand'?32:24}" color="${fill}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${symbol[1]}</svg>`;};
const qr=(await readFile(new URL('../assets/wechat-qr.jpg',import.meta.url))).toString('base64');
const names=['search','layers','check','people','file','sliders'];
let body=`<rect width="1200" height="2440" fill="${paper}"/><rect width="1200" height="430" fill="${night}"/>${icon('brand',64,53,48,paper)}${text(132,80,'独立之路',29,paper,600)}${text(133,108,'I N D I E   P A T H',13,color('muted-on-dark'))}${text(64,209,'从一个想法，',64,paper,600)}${text(64,293,'到独立经营产品。',64,paper,600)}${text(66,366,'六阶段行动地图  /  每一步，留下可以检查的结果。',25,color('muted-on-dark'))}${text(1050,100,'01—06',18,color('muted-on-dark'))}`;
for(const [i,s] of actionStages.entries()){
 const y=474+i*260;
 body+=`<rect x="64" y="${y}" width="1072" height="236" rx="8" fill="${i===3?color('panel'):'#fdfcf8'}" stroke="${i===3?color('panel'):color('border-on-light')}"/>`;
 const fg=i===3?paper:ink,secondary=i===3?color('muted-on-dark'):muted,accent=i===3?mint:color('panel');
 body+=text(89,y+49,`0${i+1}`,26,accent,500)+text(156,y+49,s.title,29,fg,600)+icon(names[i],1059,y+24,34,accent);
 body+=text(156,y+91,s.question,25,accent,500);
 for(const [j,[label,value]] of [['行动',s.action],['产出',s.output],['检查',s.check]].entries())body+=text(90,y+132+j*36,label,20,secondary,500)+text(156,y+132+j*36,value,23,secondary);
}
body+=`<path d="M64 2070H1136" stroke="${color('border-on-light')}"/>${text(64,2122,'根据反馈，回到需要调整的阶段。实践检查点不代表经营成功。',23,muted)}<rect x="64" y="2160" width="1072" height="240" rx="8" fill="#ffffff"/>${text(96,2240,'GitHub 开源项目',27,ink,600)}${text(96,2284,'github.com/aigeekops/indie-path',22,ink)}${text(96,2323,'查看源码 · 反馈问题 · 参与共建',21,muted)}<path d="M554 2200V2360" stroke="${color('border-on-light')}"/>${text(594,2240,'微信公众号：极客行动',26,ink,600)}${text(594,2284,'扫码关注，交流产品实践。',21,muted)}<image x="956" y="2202" width="156" height="156" href="data:image/jpeg;base64,${qr}"/>`;
await writeFile(new URL('../assets/action-map.svg',import.meta.url),`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="2440" viewBox="0 0 1200 2440" role="img"><title>独立之路六阶段行动地图</title><g font-family="PingFang SC,Microsoft YaHei,sans-serif">${body}</g></svg>`);
console.log('已从共用品牌资产和阶段摘要生成 assets/action-map.svg');
