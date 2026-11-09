// 访问统计只在部署构建时按需注入；仓库源码与本地运行始终不含第三方脚本。
const WEBSITE_ID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const DEFAULT_SCRIPT = 'https://cloud.umami.is/script.js';

export function analyticsTag(env = process.env) {
  const id = (env.UMAMI_WEBSITE_ID || '').trim();
  if (!id) return '';
  if (!WEBSITE_ID.test(id)) throw new Error('UMAMI_WEBSITE_ID 必须是 UUID 格式');
  const url = (env.UMAMI_SCRIPT_URL || '').trim() || DEFAULT_SCRIPT;
  if (!url.startsWith('https://') || /["'<>\s]/.test(url)) {
    throw new Error('UMAMI_SCRIPT_URL 必须是不含引号与空白的 https URL');
  }
  return `<script defer src="${url}" data-website-id="${id}"></script>`;
}

export function injectAnalytics(html, env = process.env) {
  const tag = analyticsTag(env);
  if (!tag) return html;
  if ((html.match(/<\/head>/g) || []).length !== 1) {
    throw new Error('index.html 缺少唯一的 </head>，无法注入统计脚本');
  }
  return html.replace('</head>', `  ${tag}\n</head>`);
}
