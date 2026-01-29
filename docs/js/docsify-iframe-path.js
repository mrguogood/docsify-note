(function () {
  const REPO_NAME = 'docsify-note';
  const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

  const isLocal = LOCAL_HOSTS.includes(location.hostname);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  
  // 检测是否为移动设备
  const isMobileDevice = /mobile|android|iphone|ipad|ipod|windows phone|webos|blackberry|tablet|opera mini/i.test(navigator.userAgent);
  // 或者通过视口宽度检测
  const isMobileViewport = window.innerWidth <= 768;

  const isIOSSafari = isIOS && isSafari;
  const BASE_PATH = isLocal ? '' : `/${REPO_NAME}`;

  /**
   * 创建 PDF 下载/打开链接
   * @param {string} src - PDF 源地址
   * @param {string} title - PDF 标题
   * @returns {HTMLElement} 链接元素
   */
  function createPdfFallbackLink(src, title = 'PDF 文档') {
    const container = document.createElement('div');
    container.className = 'pdf-fallback-container';
    
    // 为移动端设备添加额外的CSS样式
    if (isMobileDevice || isMobileViewport) {
      container.style.cssText = `
        padding: 18px;
        margin: 12px 0;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border: 2px dashed #42b983;
        border-radius: 8px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        animation: fadeIn 0.3s ease;
        min-width: 300px;
      `;
    } else {
      container.style.cssText = `
        padding: 20px;
        margin: 16px 0;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border: 2px dashed #42b983;
        border-radius: 8px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        animation: fadeIn 0.3s ease;
      `;
    }

    const icon = document.createElement('span');
    icon.textContent = '📄';
    icon.style.fontSize = isMobileDevice || isMobileViewport ? '28px' : '32px';

    const text = document.createElement('p');
    text.textContent = `${title} - 点击下方按钮打开或下载`;
    text.style.cssText = 'margin: 0; color: #2c3e50; font-weight: 500; font-size: 15px; line-height: 1.5;';

    const link = document.createElement('a');
    link.href = src;
    link.textContent = '📖 在新窗口中打开';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (isMobileDevice || isMobileViewport) {
      link.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 12px 24px;
        background: #42b983;
        color: white;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 300px;
        text-align: center;
      `;
    } else {
      link.style.cssText = `
        display: inline-block;
        padding: 10px 20px;
        background: #42b983;
        color: white;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      `;
    }
    link.onmouseover = function() {
      this.style.background = '#2c8460';
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    };
    link.onmouseout = function() {
      this.style.background = isMobileDevice || isMobileViewport ? '#42b983' : '#42b983';
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    };

    container.appendChild(icon);
    container.appendChild(text);
    container.appendChild(link);

    return container;
  }

  /**
   * 获取 iframe 所在容器的标题
   * @param {HTMLElement} iframe - iframe 元素
   * @returns {string} 标题文本
   */
  function getPdfTitle(iframe) {
    const container = iframe.closest('.responsive-pdf');
    const ariaLabel = iframe.getAttribute('aria-label');
    const title = container?.querySelector('h3, h2')?.textContent;
    return ariaLabel || title || 'PDF 文档';
  }

  /**
   * 修补 iframe 路径并处理兼容性
   */
  function patchIframeAndPdf() {
    document.querySelectorAll('iframe[src^="/"]').forEach(iframe => {
      if (iframe.dataset.iframePathPatched) return;

      const rawSrc = iframe.getAttribute('src');
      const fullSrc = BASE_PATH + rawSrc;
      const isPdf = rawSrc.endsWith('.pdf');
      const pdfTitle = isPdf ? getPdfTitle(iframe) : '';

      // 移动设备：PDF 使用 fallback 链接（包括所有移动设备）
      if (isPdf && (isMobileDevice || isMobileViewport)) {
        const fallback = createPdfFallbackLink(fullSrc, pdfTitle);
        iframe.parentNode.replaceChild(fallback, iframe);
        return;
      }

      iframe.setAttribute('src', fullSrc);
      iframe.dataset.iframePathPatched = '1';

      // 为 PDF 添加错误处理
      if (isPdf) {
        iframe.addEventListener('error', function() {
          console.warn(`PDF 加载失败: ${fullSrc}`);
          const fallback = createPdfFallbackLink(fullSrc, pdfTitle);
          this.parentNode.replaceChild(fallback, this);
        });
      }
    });
  }

  // Docsify 插件钩子
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(patchIframeAndPdf);
  });

  // DOM 加载完成后处理
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchIframeAndPdf);
  } else {
    patchIframeAndPdf();
  }
})();
