(function () {
  const REPO_NAME = 'docsify-note';
  const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

  const isLocal = LOCAL_HOSTS.includes(location.hostname);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const isIOSSafari = isIOS && isSafari;
  const BASE_PATH = isLocal ? '' : `/${REPO_NAME}`;

  function createFallbackLink(src) {
    const a = document.createElement('a');
    a.href = src;
    a.textContent = '📄 点击打开 PDF';
    a.target = '_blank';
    a.rel = 'noopener';
    a.style.display = 'inline-block';
    a.style.margin = '16px 0';
    return a;
  }

  function patchIframe() {
    document.querySelectorAll('iframe[src^="/"]').forEach(iframe => {
      if (iframe.dataset.iframePathPatched) return;

      const rawSrc = iframe.getAttribute('src');
      const fullSrc = BASE_PATH + rawSrc;

      // iOS Safari：PDF fallback
      if (isIOSSafari && rawSrc.endsWith('.pdf')) {
        const fallback = createFallbackLink(fullSrc);
        iframe.parentNode.replaceChild(fallback, iframe);
        return;
      }

      iframe.setAttribute('src', fullSrc);
      iframe.dataset.iframePathPatched = '1';
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(patchIframe);
  });

  document.addEventListener('DOMContentLoaded', patchIframe);
})();
