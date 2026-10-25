// 在样式加载前确定主题，避免首次打开或刷新时闪现相反背景。
(() => {
  const key = 'indie-path-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'dark'].includes(value) ? value : 'system';
  let preference = 'system';
  try { preference = valid(localStorage.getItem(key)); } catch {}

  function apply() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#191a1b' : '#f6f5f1');
    const button = document.getElementById('theme-toggle');
    if (button) {
      const next = theme === 'dark' ? '暖白' : '石墨黑';
      button.setAttribute('aria-label', `切换到${next}`);
      button.title = `当前：${theme === 'dark' ? '石墨黑' : '暖白'}${preference === 'system' ? '（跟随系统）' : ''}；点击切换到${next}`;
    }
  }
  apply();
  system.addEventListener('change', () => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      preference = valid(event.newValue);
      apply();
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(key, preference);
      } catch {}
      apply();
    });
  });
})();
