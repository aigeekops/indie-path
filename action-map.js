import {stages} from './stages.js';
// 网页与可下载地图消费同一份 Markdown 摘要。
export const actionStages=stages.map(stage=>({...stage,...stage.map}));
