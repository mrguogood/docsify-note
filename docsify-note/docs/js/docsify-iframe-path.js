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