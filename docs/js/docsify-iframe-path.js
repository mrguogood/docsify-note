(function () {
  const REPO_NAME = 'docsify-note';
  const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

  const isLocal = LOCAL_HOSTS.includes(location.hostname);
  const isMobileDevice = /mobile|android|iphone|ipad|ipod|windows phone|webos|blackberry|tablet|opera mini/i.test(navigator.userAgent);
  const isMobileViewport = window.innerWidth <= 768;
  const BASE_PATH = isLocal ? '' : `/${REPO_NAME}`;

  const DOC_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.odt', '.rtf', '.txt'];

  function getFileExtension(path) {
    try {
      return path.split('?')[0].split('.').pop().toLowerCase();
    } catch (e) {
      return '';
    }
  }

  function isDocumentByExt(path) {
    const ext = '.' + getFileExtension(path);
    return DOC_EXTENSIONS.indexOf(ext) !== -1;
  }

  function createDocFallbackLink(src, title = '文档', ext = '') {
    const container = document.createElement('div');
    container.className = 'pdf-fallback-container doc-fallback-container';

    const icon = document.createElement('span');
    const extLower = ext.toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      ppt: '📽️',
      pptx: '📽️',
      xls: '📊',
      xlsx: '📊',
      txt: '📄',
    };
    icon.textContent = iconMap[extLower] || '📄';
    icon.style.fontSize = (isMobileDevice || isMobileViewport) ? '28px' : '32px';

    const text = document.createElement('p');
    text.textContent = `${title} — 点击下面按钮在新窗口打开或下载`;
    text.style.cssText = 'margin:0;color:#2c3e50;font-weight:500;font-size:15px;line-height:1.5;';

    const linkOpen = document.createElement('a');
    linkOpen.href = src;
    linkOpen.textContent = '在新窗口中打开';
    linkOpen.target = '_blank';
    linkOpen.rel = 'noopener noreferrer';
    linkOpen.style.cssText = 'display:inline-block;padding:10px 18px;background:#42b983;color:white;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px;';

    const linkDownload = document.createElement('a');
    linkDownload.href = src;
    linkDownload.download = '';
    linkDownload.textContent = '下载文件';
    linkDownload.style.cssText = 'display:inline-block;padding:10px 18px;background:#6c757d;color:white;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px;margin-left:8px;';

    // 在移动端把按钮纵向排列并占满宽度
    if (isMobileDevice || isMobileViewport) {
      linkOpen.style.cssText += 'width:100%;max-width:600px;box-sizing:border-box;';
      linkDownload.style.cssText += 'width:100%;max-width:600px;box-sizing:border-box;';
      container.style.cssText = 'padding:18px;margin:12px 0;background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%);border:2px dashed #42b983;border-radius:8px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;animation:fadeIn 0.3s ease;';
    } else {
      container.style.cssText = 'padding:20px;margin:16px 0;background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%);border:2px dashed #42b983;border-radius:8px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;animation:fadeIn 0.3s ease;';
    }

    container.appendChild(icon);
    container.appendChild(text);

    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '8px';
    buttons.style.flexWrap = 'wrap';
    buttons.style.justifyContent = 'center';
    buttons.appendChild(linkOpen);
    buttons.appendChild(linkDownload);

    container.appendChild(buttons);
    return container;
  }

  function getTitleFromContainer(iframe) {
    const container = iframe.closest('.responsive-pdf, .responsive-doc');
    const ariaLabel = iframe.getAttribute('aria-label');
    const title = container?.querySelector('h3, h2')?.textContent;
    return ariaLabel || title || '文档';
  }

  function patchIframes() {
    document.querySelectorAll('iframe[src]').forEach(iframe => {
      if (iframe.dataset.iframePathPatched) return;

      const rawSrc = iframe.getAttribute('src') || '';
      const isAbsolute = /^https?:\/\//i.test(rawSrc) || /^\/\//.test(rawSrc);
      const fullSrc = isAbsolute ? rawSrc : (BASE_PATH + rawSrc);
      const ext = getFileExtension(rawSrc);

      if (isDocumentByExt(rawSrc) || isDocumentByExt(fullSrc)) {
        const title = getTitleFromContainer(iframe);
        const fallback = createDocFallbackLink(fullSrc, title, ext);
        const wrapper = iframe.closest('.responsive-pdf, .responsive-doc');
        if (wrapper && wrapper.parentNode) {
          wrapper.parentNode.replaceChild(fallback, wrapper);
        } else if (iframe.parentNode) {
          iframe.parentNode.replaceChild(fallback, iframe);
        }
        return;
      }

      // 非文档类 iframe 仍修正路径
      if (!isAbsolute && rawSrc.startsWith('/')) {
        iframe.setAttribute('src', fullSrc);
      }
      iframe.dataset.iframePathPatched = '1';
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(patchIframes);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchIframes);
  } else {
    patchIframes();
  }
})();
