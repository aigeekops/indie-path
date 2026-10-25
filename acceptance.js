// 成果只对应保存时逐项确认过的验收条件；正文和既有说明仍可保留。
export const resultMatches=(record,task)=>Boolean(record&&task&&['done','skipped'].includes(record.status)&&record.criteria===JSON.stringify(task.checks));
