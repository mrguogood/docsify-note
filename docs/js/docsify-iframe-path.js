(function () {
  /* =========================
   * 基础配置
   * ========================= */
  const REPO_NAME = 'docsify-note';
  const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

  /* =========================
   * 环境判断
   * ========================= */
  const hostname = location.hostname;
  const ua = navigator.userAgent.toLowerCase();

  const isLocal = LOCAL_HOSTS.includes(hostname);
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isSafari = isIOS && /safari/.test(ua) && !/crios|fxios/.test(ua);

  // 是否需要 PDF fallback（核心判断）
  const needPdfFallback = isSafari || (isAndroid && /mobile/.test(ua));

  const BASE_PATH = isLocal ? '' : `/${REPO_NAME}`;

  /* =========================
   * 创建 PDF fallback 结构
   * ========================= */
  function createPdfFallback(src, title) {
    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-fallback';

    const icon = document.createElement('div');
    icon.className = 'pdf-fallback-icon';
    icon.textContent = '📄';

    const text = document.createElement('div');
    text.className = 'pdf-fallback-text';
    text.textContent = title || 'PDF 文档';

    const link = document.createElement('a');
    link.className = 'pdf-fallback-link';
    link.href = src;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '在新窗口中打开';

    wrapper.appendChild(icon);
    wrapper.appendChild(text);
    wrapper.appendChild(link);

    return wrapper;
  }

  /* =========================
   * 获取 PDF 标题
   * ========================= */
  function getPdfTitle(iframe) {
    return (
      iframe.getAttribute('aria-label') ||
      iframe.getAttribute('title') ||
      'PDF 文档'
    );
  }

  /* =========================
   * 核心处理逻辑
   * ========================= */
  function patchPdfIframe() {
    document
      .querySelectorAll('iframe[src^="/"][src$=".pdf"]')
      .forEach(iframe => {
        if (iframe.dataset.iframePathPatched) return;

        const rawSrc = iframe.getAttribute('src');
        const fullSrc = BASE_PATH + rawSrc;
        const title = getPdfTitle(iframe);

        // 标记已处理（必须最先）
        iframe.dataset.iframePathPatched = '1';

        // 需要 fallback 的环境
        if (needPdfFallback) {
          const fallback = createPdfFallback(fullSrc, title);
          iframe.parentNode.replaceChild(fallback, iframe);
          return;
        }

        // 桌面端：正常 iframe
        iframe.setAttribute('src', fullSrc);

        // 加载失败兜底
        iframe.addEventListener('error', () => {
          const fallback = createPdfFallback(fullSrc, title);
          iframe.parentNode.replaceChild(fallback, iframe);
        });
      });
  }

  /* =========================
   * 注册 Docsify 插件
   * ========================= */
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(hook => {
    hook.doneEach(patchPdfIframe);
  });

  // 首次加载兜底
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchPdfIframe);
  } else {
    patchPdfIframe();
  }
})();