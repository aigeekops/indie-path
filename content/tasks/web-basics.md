---
id: web-basics
kind: task
track: core
stage: delivery
order: 8
case_chapter: 3
skill: null
effort: 3–6 小时
subtitle: 为没有独立开发经验的人补上最小系统认知。
readings:
  - html
  - css
  - web
step_readings:
  做一个最小页面:
    - html
  改三处看得见的内容:
    - css
  观察一条请求:
    - web
  区分存在哪里:
    - web
---

# 看懂页面、请求与服务端

## 为什么做

AI 降低了写页面的门槛，但你需要看懂浏览器、请求与服务端，才能知道哪里失败。

## 开始条件

没有独立前后端经验；会写代码者可先对照验收尝试。

## 学习要点

- HTML 元素与属性：能凭标签名说出它渲染成什么（input 可输入、button 可提交、a 可跳转），而不是只看到样子。
- CSS 选择器与盒模型：一个元素的最终宽度由内容、内边距、边框、外边距共同决定；改其中一项能预测另一项的变化。
- 一次请求的四要素：URL、方法（GET/POST）、状态码、响应体。静态页面请求返回的是文件本身，不是计算后的结果。
- 三处边界：发到浏览器的内容用户随时可见（含写在 HTML 里的任何字符串）；本地存储刷新后仍在但清缓存会丢；服务端数据必须再发一次请求才能拿到。

## 成果模板

```text
页面元素→对应文件（列出 3 个元素的标签/属性）：
一条真实请求：URL | 方法 | 状态码 | 响应内容类型 | 由哪个动作触发
请求证据来源（Network 面板截图或复制的请求头）：
浏览器保存什么（内存 / localStorage / sessionStorage，写出键名）：
服务端保存什么（没有服务端就写"无"，并说明为什么）：
失败演练：把哪个地址改错 → 看到什么状态码/报错 → 如何恢复
我仍不确定的一处：
```

## 教学示例

教学示例：本指南用静态文件加浏览器本地存储保存进度——刷新页面进度还在，因为数据在你这台浏览器的本地存储里；但换一台电脑或清掉站点数据，进度就没了，因为它从不在服务端。这是"浏览器内存 / 本地存储 / 服务端"三处边界的真实例子，不是抽象说法。反过来，如果你把一段"密钥"直接写进 HTML，任何人在「查看网页源代码」或 Network 的 Response 里都能看到它——这不是漏洞，是 HTTP 的工作原理。

## 常见问题

- 双击 HTML 打开却是空白或 404：用 `file://` 直接打开时，相对路径和后续请求的行为与 `http://` 不同。应通过本地服务器（如 `python3 -m http.server`）以 http 访问，再读控制台的红色报错和失败的资源路径。
- 以为写在 HTML 里的密钥能隐藏：任何发到浏览器的内容都能在「查看网页源代码」或 Network 的 Response 里看到；密钥只该留在服务端，前端最多持有一个临时的访问令牌。
- 改了样式没变化：先确认选择器命中了目标元素（在 DevTools 里看该元素是否被这条规则覆盖，还是被更具体的规则盖掉），再确认加载的是新文件而不是浏览器缓存的旧版本。

## 交付成果

- 最小页面
- 请求说明
- 系统图

## 下一步

继续编程与调试基础，再写接口与界面。

## 完成标准

- 能凭标签名解释页面中至少三个元素的渲染行为（例如 input 可输入、button 可提交、a 可跳转），并改过其中至少一项的样式后能预测变化。
- 能在 Network 面板指出一条真实请求的 URL、方法、状态码与响应内容类型，并说明它由哪个用户动作触发。
- 能各举一类例子说明"只在浏览器内存 / 在本地存储（清缓存才丢）/ 在服务端（需再请求）"，且能说明哪一类能在他人的浏览器复现。

## AI参与方式

- 可交给 AI：生成最小页面的 HTML/CSS 骨架、解释一条报错的可能原因、把 Network 里的一条请求整理成文字。
- 必须自己核验：页面是否真的按预期渲染、状态码与响应内容是否与 AI 说的一致、密钥是否真的没有出现在前端文件里。
- 不能交给 AI：判断"这份数据该放浏览器还是服务端"——它取决于谁能看到、是否需要跨设备，必须你按产品事实决定。

## 可运行起点

```text
一、建一个文件夹，放四个文件（先照抄，不美化）
web-basics/
  index.html
  style.css
  script.js
  data.json

【index.html】
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>我的最小页面</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1 id="title">把记录整理成清单</h1>
  <p id="desc">输入项目名，点按钮筛选记录。</p>
  <input id="filter" placeholder="例如：项目 A">
  <button id="run">筛选</button>
  <ul id="result"></ul>
  <script src="script.js"></script>
</body>
</html>

【style.css】
body { font-family: system-ui; margin: 40px; max-width: 560px; }
#title { font-size: 20px; }
#result { line-height: 1.8; }

【data.json】
[
  {"id":"A-1","project":"项目 A","hours":2},
  {"id":"A-2","project":"项目 B","hours":1},
  {"id":"A-3","project":"项目 A","hours":3}
]

【script.js】
const result = document.querySelector('#result');
document.querySelector('#run').addEventListener('click', async () => {
  const key = document.querySelector('#filter').value.trim();
  const res = await fetch('data.json');          // 这条就是"一次请求"
  const rows = await res.json();
  result.innerHTML = '';
  rows.filter(row => !key || row.project === key)
      .forEach(row => {
        const li = document.createElement('li');
        li.textContent = `${row.id} · ${row.project} · ${row.hours} 小时`;
        result.appendChild(li);
      });
});

二、跑起来（不要双击 HTML）
在 web-basics 文件夹里执行：python3 -m http.server 8000
浏览器打开：http://127.0.0.1:8000/
输入"项目 A"点筛选：应出现 A-1、A-3 两条。

三、照着填（这就是本任务的成果）
页面元素→对应文件：h1/p/input/button → index.html；字号/间距 → style.css；筛选逻辑 → script.js
一条真实请求：GET /data.json | 200 | application/json | 由"筛选"按钮触发
浏览器保存什么：无（刷新后重新请求）
服务端保存什么：无（data.json 是静态文件，不是服务端程序）
失败演练：把 fetch('data.json') 改成 'data2.json' → Network 看到 404 → 改回
```

## AI提示词包

```text
第一轮 · 只补骨架，不写整站
我在学 HTML/CSS 基础，只做一页。请给我最小 HTML：一个 h1、一个 p、一个 input、一个 button、一个 ul，外链 style.css 和 script.js。
硬约束：不用框架，不加样式装饰，不替我写 JS。给完后逐行解释每个标签渲染成什么。

第二轮 · 只改三处样式，并预测影响
这是我现在的 style.css（粘贴）。我想改三处：标题字号、段落间距、列表行高。
请只给这三条规则的修改，并逐条说明：会影响哪些元素、会不会改变布局宽度。不要顺手改别的。

第三轮 · 解释一条真实请求（事实与推测分开）
下面是我在 Network 面板复制的一条请求（粘贴 URL、方法、状态码、Response Headers、Response 前 200 字符）。
请分两栏输出：①能从这些证据直接确认的事实；②你的推测，并标注依据不足。
硬约束：不得编造没出现在数据里的字段，不得把"页面能打开"说成"请求成功"。

第四轮 · 核对数据该放哪里（不替我下结论）
我的页面把筛选结果放在页面里，没有持久化。请列出三种可能：浏览器内存、localStorage、服务端。
对每一种给出判断依据：谁能看到、刷新后是否还在、换设备是否还在。
硬约束：不要替我决定我的产品该用哪种，只给判断依据。
```

## 成品样例

一份合格的成果长这样（示例数据，只用于对照格式）：

- 页面元素→对应文件：`h1#title`、`p#desc`、`input#filter`、`button#run`、`ul#result` → `index.html`；`body` 的 margin/max-width、`#title` 的 font-size、`#result` 的 line-height → `style.css`；点击筛选、fetch、渲染列表 → `script.js`
- 一条真实请求：URL `/data.json`；方法 GET；状态码 200；响应内容类型 `application/json`；触发动作是点击"筛选"按钮
- 请求证据来源：DevTools → Network → 选中 `data.json` → 复制 Request URL 与 Response 前 200 字符
- 浏览器保存什么：无。筛选结果只在当前页面内存里，刷新后重新请求 `data.json`
- 服务端保存什么：无。`data.json` 是静态文件，由 `http.server` 原样返回，不是服务端程序
- 失败演练：把 `fetch('data.json')` 改成 `'data2.json'`，Network 出现 404，列表为空；改回后恢复 200
- 我仍不确定的一处：如果以后要让别人提交记录，`data.json` 就不能用了，需要真正的服务端与存储

同样的工作量，但这些**不能用**：

- 只写"页面能打开"——没指出任何一条请求的 URL 与状态码，无法证明请求发生过
- 把"`data.json` 返回了数据"说成"服务端处理了数据"——静态文件不是服务端程序，这是两件事
- 失败演练只写"报错了"——没写状态码、没写怎么恢复，别人无法复现

## AI边界

- 可以让 AI 做：生成 HTML/CSS 骨架、解释一条报错或一条请求的含义、把 Network 里的字段整理成表格
- 不能让 AI 做：替你判断"这条请求算不算成功"（要看状态码与响应内容）、替你决定数据该放浏览器还是服务端、替你编造 Network 里不存在的字段
- 必须你本人判断：页面是否真的按预期渲染；密钥是否真的没出现在前端文件里；失败演练是不是你自己复现过

## 行动步骤

### 做一个最小页面

按 MDN 示例创建标题、说明、输入框和按钮，连接一份样式表。打开后确认每个元素都可见，并在 DevTools 的 Elements 面板里能逐个选中；随手改一处文字，确认改的是 HTML 而不是 CSS。能打开、能定位、能说出每个元素由哪段标签渲染即可。

#### 这一步留下

一页自己的产品说明（含 3 个可定位的元素）。

### 改三处看得见的内容

调整文字、宽度和间距，再恢复一处变化。先在 DevTools 里临时改样式看效果，确认后再落到 CSS 文件；用编辑器或 git diff 核对只动了这三处，然后恢复其中一处并说明为什么这样改。不用重做整站。

#### 这一步留下

可解释的三项修改（含 diff 与恢复的那一处）。

### 观察一条请求

打开浏览器开发者工具（F12）的 Network 面板，先清空列表，再在页面触发一次提交或切换。找到那条请求，记录四项：请求 URL、方法（GET 还是 POST）、状态码（2xx 成功 / 3xx 跳转 / 4xx 客户端错 / 5xx 服务端错各代表什么）、响应内容类型。对比「返回 HTML 文件」与「返回 JSON 数据」两种响应，画出"浏览器发请求 → 服务端返回 → 页面更新"的箭头。

#### 这一步留下

一张请求说明（含上述四项与一个触发动作）。

### 区分存在哪里

回答三个具体问题：页面 HTML/CSS/JS 文件放在哪（你的仓库还是托管平台）？进度条数据存在哪（浏览器本地存储，所以换设备就不在）？如果用户提交的内容要被别人看到，必须存在哪（服务端，并再发一次请求才能读取）？写清为何静态托管（只返回文件）不能运行你自己的服务端程序，也不能靠"藏在前端"保护任何密钥。

#### 这一步留下

最小系统图（标注三处各自的位置与可见性）。
