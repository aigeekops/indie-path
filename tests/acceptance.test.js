import test from 'node:test';
import assert from 'node:assert/strict';
import {resultMatches} from '../acceptance.js';
import {generateRoute,personas} from '../data.js';
test('验收结果只适用于保存时确认过的条件；付费改变后须复核',()=>{
 const unpaid=generateRoute(personas[4].profile)[0];
 const paid=generateRoute({...personas[4].profile,paid:true})[0];
 const record={status:'done',criteria:JSON.stringify(unpaid.checks),note:'交互测试'};
 assert.ok(resultMatches(record,unpaid));assert.equal(resultMatches(record,paid),false);
 assert.equal(resultMatches({status:'done',note:'保留旧成果'},unpaid),false);
 assert.equal(resultMatches({...record,status:'stuck'},unpaid),false);
 assert.ok(resultMatches({...record,status:'skipped'},unpaid));
});
