// 仅渲染项目内定义的图标名称；图标本身不替代可见文字。
export function icon(name,extra='') {
 return `<svg class="icon ${extra}" aria-hidden="true" focusable="false"><use href="./assets/brand/icons.svg#${name}"/></svg>`;
}

// 按词换行，避免窄屏标题把“继续”“问题”等词拆开。
const titleSegmenter=new Intl.Segmenter('zh-CN',{granularity:'word'});
export function titleWords(text){
 return [...titleSegmenter.segment(String(text))].map(({segment})=>`<span class="title-word">${segment.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</span>`).join('');
}
