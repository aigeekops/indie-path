import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../theme.js',import.meta.url),'utf8');
function boot({saved=null,dark=false,denied=false}={}){
 const events={},docEvents={},buttonEvents={},store=new Map(saved?[['indie-path-theme',saved]]:[]);
 const root={dataset:{}},button={attributes:{},setAttribute(name,value){this.attributes[name]=value;},addEventListener:(name,fn)=>buttonEvents[name]=fn};
 let ready=false,systemChange;
 const system={matches:dark,addEventListener:(_,fn)=>systemChange=fn};
 const localStorage={getItem:k=>{if(denied)throw Error();return store.get(k)??null;},setItem:(k,v)=>{if(denied)throw Error();store.set(k,v);}};
 runInNewContext(source,{localStorage,window:{matchMedia:()=>system,addEventListener:(n,f)=>events[n]=f},document:{documentElement:root,querySelector:()=>({setAttribute(){}}),getElementById:()=>ready?button:null,addEventListener:(n,f)=>docEvents[n]=f}});
 const initial=root.dataset.theme;ready=true;docEvents.DOMContentLoaded();
 return {root,button,store,initial,click:()=>buttonEvents.click(),system:value=>{system.matches=value;systemChange();},storage:value=>events.storage({key:'indie-path-theme',newValue:value})};
}
test('默认跟随系统，点击图标切换当前明暗并记住选择',()=>{
 const t=boot({dark:true});assert.equal(t.initial,'dark');t.system(false);assert.equal(t.root.dataset.theme,'light');
 assert.equal(t.button.attributes['aria-label'],'切换到石墨黑');
 t.click();assert.equal(t.store.get('indie-path-theme'),'dark');t.system(false);assert.equal(t.root.dataset.theme,'dark');
 assert.equal(t.button.attributes['aria-label'],'切换到暖白');
 t.click();assert.equal(t.root.dataset.theme,'light');assert.equal(t.store.get('indie-path-theme'),'light');
});
test('刷新读取保存偏好，跨标签切换同步主题与按钮提示',()=>{
 const t=boot({saved:'light',dark:true});assert.equal(t.initial,'light');
 t.storage('dark');assert.equal(t.root.dataset.theme,'dark');assert.equal(t.button.attributes['aria-label'],'切换到暖白');
 t.storage(null);assert.match(t.button.title,/跟随系统/);
});
test('存储不可用不阻断页面，当前会话仍可点击切换',()=>{
 const t=boot({denied:true});assert.equal(t.initial,'light');t.click();assert.equal(t.root.dataset.theme,'dark');
});
