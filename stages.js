import {content} from './generated/content.js';
// 全站只使用 Markdown 定义的六阶段；任务顺序与推荐逻辑独立维护。
export const stages=content.stages;
export const stageForTaskId=id=>stages.find(stage=>stage.taskIds.includes(id));
