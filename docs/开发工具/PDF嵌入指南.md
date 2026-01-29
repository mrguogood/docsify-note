
本文档介绍如何在 Docsify 文档中高效地嵌入和展示 PDF 文件。

## 快速开始

### 基础用法

在 Markdown 文件中添加以下代码来嵌入 PDF：

```markdown
<div class="responsive-pdf aspect-portrait">
    <iframe
    class="pdf-frame"
    src="/document/your-pdf-file.pdf"
    type="application/pdf"
    aria-label="PDF 文档标题"
    loading="lazy">
    </iframe>
</div>
```

### 关键属性说明

| 属性 | 说明 | 示例 |
|------|------|------|
| `class="responsive-pdf"` | 响应式容器 | 必需 |
| `aspect-portrait` | 纵向页面（推荐长文档） | 高 > 宽 |
| `aspect-landscape` | 横向页面（16:9 比例） | 宽 > 高 |
| `src` | PDF 文件路径（相对于 docs）| `/document/file.pdf` |
| `aria-label` | 无障碍标签（推荐） | 文档描述 |
| `loading="lazy"` | 懒加载（性能优化） | 可选 |

## 布局选项

### 纵向长页面（推荐用于PDF书籍）

```html
<div class="responsive-pdf aspect-portrait">
    <iframe
    class="pdf-frame"
    src="/document/极简JVM教程-周瑜.pdf"
    type="application/pdf"
    aria-label="极简JVM教程"
    loading="lazy">
    </iframe>
</div>
```

**特点：**
- 更高的宽高比（140%）
- 适合长篇幅的 PDF 文档
- 移动端滚动体验好

### 横向页面（推荐用于PPT/幻灯片）

```html
<div class="responsive-pdf aspect-landscape">
    <iframe
    class="pdf-frame"
    src="/document/presentation.pdf"
    type="application/pdf"
    aria-label="演讲幻灯片"
    loading="lazy">
    </iframe>
</div>
```

**特点：**
- 标准 16:9 宽高比
- 适合演讲稿或宽幅内容
- 桌面展示效果好

## 兼容性处理

### 自动 Fallback 机制

系统会自动为以下情况提供友好的备选方案：

- **iOS Safari**：无法直接嵌入 PDF，提供下载按钮
- **Android**：性能优化，提供下载按钮
- **加载失败**：自动转换为下载链接

### 用户看到的效果

**无法加载时的显示：**

```
📄
PDF 文档 - 点击下方按钮打开或下载

📖 在新窗口中打开
```

## 性能优化

### 1. 使用懒加载

```html
<div class="responsive-pdf aspect-portrait">
    <iframe
    class="pdf-frame"
    src="/document/large-file.pdf"
    type="application/pdf"
    loading="lazy">  <!-- 关键属性 -->
    </iframe>
</div>
```

**优势：**
- 只在 PDF 进入视口时加载
- 降低初始页面加载时间
- 节省带宽

### 2. 压缩 PDF 文件

在上传前压缩 PDF：

```bash
# 使用 GhostScript（Linux/Mac）
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=output.pdf input.pdf

# 或在线工具：https://www.ilovepdf.com/compress_pdf
```

### 3. 文件放置位置

**推荐结构：**

```
docs/
├── document/
│   ├── 极简JVM教程-周瑜.pdf      (大文件，<5MB)
│   ├── presentation.pdf           (演讲稿)
│   └── guide.pdf
└── images/
    └── (存放图片资源)
```

## 最佳实践

### ✅ 推荐做法

1. **总是添加 `aria-label`**

```html
<iframe
  src="/document/file.pdf"
  aria-label="JVM 学习指南"
  loading="lazy">
</iframe>
```

2. **在大文件上添加标题说明**

```markdown
### Java 虚拟机

<div class="responsive-pdf aspect-portrait">
    <iframe
    src="/document/JVM.pdf"
    aria-label="JVM 详解">
    </iframe>
</div>

**说明：** 本文档共 150 页，包含 JVM 的完整学习指南。
```

3. **为移动端提供备选方案**

```markdown
<div class="responsive-pdf aspect-portrait">
    <iframe src="/document/file.pdf" loading="lazy"></iframe>
</div>

> 📱 在移动设备上，推荐 [直接下载](../document/file.pdf) 使用 PDF 阅读器查看。
```

### ❌ 避免做法

1. **不要省略 `src` 属性** ❌
```html
<!-- 错误：会导致加载失败 -->
<iframe class="pdf-frame"></iframe>
```

2. **不要使用过大的文件** ❌
```html
<!-- 尽量将文件控制在 5MB 以内 -->
<iframe src="/document/100mb-file.pdf"></iframe>
```

3. **不要在容器中添加其他内容** ❌
```html
<!-- 错误：会破坏响应式布局 -->
<div class="responsive-pdf">
  <p>某些文本</p>
  <iframe src="..."></iframe>
</div>
```

## 常见问题

### Q: PDF 在移动设备上无法显示？

A: 这是预期行为。系统会自动显示下载按钮，用户可以用本地 PDF 阅读器打开。

### Q: 如何改变 PDF 的宽高比？

A: 修改 CSS 类名：
- `aspect-portrait`: 纵向（140%）
- `aspect-landscape`: 横向（56.25%）

若需自定义，编辑 [custom.css](../assets/css/custom.css)：

```css
.responsive-pdf.aspect-custom {
  padding-top: 100%; /* 自定义比例 */
}
```

### Q: PDF 加载很慢怎么办？

A: 
1. 压缩 PDF 文件大小
2. 使用 `loading="lazy"` 实现懒加载
3. 检查网络连接

### Q: 如何在特定位置添加下载链接？

A: 
```markdown
[📥 下载 PDF](../document/file.pdf)

<div class="responsive-pdf aspect-portrait">
    <iframe src="/document/file.pdf"></iframe>
</div>
```

## 支持的格式

目前优化支持：

| 格式 | 支持度 | 备注 |
|------|--------|------|
| PDF | ✅ 完全支持 | 推荐格式 |
| 图像 PDF | ✅ 支持 | 扫描件可用 |
| 加密 PDF | ⚠️ 部分支持 | 可能需要密码 |

## 调试技巧

### 在浏览器控制台检查

```javascript
// 查看所有 iframe 元素
document.querySelectorAll('iframe[src*=".pdf"]')

// 检查是否成功加载
document.querySelectorAll('iframe[src*=".pdf"]').forEach(i => {
  console.log(i.src, i.offsetHeight > 0 ? '已加载' : '未加载');
});
```

### 常见错误信息

| 错误 | 原因 | 解决方案 |
|------|------|--------|
| `404 Not Found` | PDF 路径错误 | 检查文件是否存在于 `/document` 文件夹 |
| `CORS 错误` | 跨域问题 | 使用相对路径而非绝对 URL |
| `显示空白` | 格式不支持 | 使用在线工具转换为标准 PDF |

## 更新日志

**v2.0** (2026-01-29)
- ✨ 增强 PDF fallback 提示
- 🚀 添加懒加载支持
- 📱 改进移动端体验
- 🎨 优化样式和动画

**v1.0** (初始版本)
- 基础 PDF 嵌入功能
- 响应式容器

## 获取帮助

有问题？尝试：

1. 查看本指南的 FAQ 部分
2. 检查 [custom.css](../assets/css/custom.css) 中的 CSS 注释
3. 查看 [JavaScript 脚本](../js/docsify-iframe-path.js) 的实现细节
