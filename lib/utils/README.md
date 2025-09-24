# HTML转译器工具

这个工具提供了将HTML内容转换为Quill编辑器支持格式的核心功能。

## 主要功能

### 1. `translateHtmlToQuill(html: string): string`
将HTML字符串转换为Quill编辑器支持的格式。

**转换规则：**
- **标题**: 所有`h1-h6`标签 → Quill `header 2`格式 (`<h2>`)
- **普通文本**: 非Heading标签(`p`, `div`, `span`, `section`, `article`等) → normal格式（保持原标签）
- **文字样式**: 
  - `<b>`, `<strong>` → `<strong>`
  - `<i>`, `<em>` → `<em>`
  - `<u>` → `<u>`
- **列表**: 
  - `<ol>` → Quill有序列表
  - `<ul>` → Quill无序列表
- **特殊格式**: 
  - `<a href="">` → 保留链接和href属性
  - `<blockquote>` → Quill引用格式
- **清理策略**: 移除不支持的标签，保留文本内容

### 2. `htmlToPlainText(html: string): string`
将HTML内容转换为纯文本，移除所有标签和格式。

### 3. 辅助函数
- `getSupportedQuillFormats()`: 获取所有支持的Quill格式
- `isSupportedHtmlTag(tagName)`: 检查HTML标签是否被支持
- `getQuillFormatForHtmlTag(tagName)`: 获取HTML标签对应的Quill格式

## 使用示例

```typescript
import { translateHtmlToQuill, htmlToPlainText } from '@/lib/utils';

// 基本转换
const html = '<h1>标题</h1><p><b>粗体</b>文本和<a href="#">链接</a></p>';
const quillHtml = translateHtmlToQuill(html);
// 结果: '<h2>标题</h2><p><strong>粗体</strong>文本和<a href="#">链接</a></p>'

// 提取纯文本
const plainText = htmlToPlainText(html);
// 结果: '标题\n粗体文本和链接'
```

## 错误处理

- **输入验证**: 检查输入类型和大小限制（最大100KB）
- **安全清理**: 移除script、style标签和危险属性
- **错误恢复**: 转换失败时自动降级为纯文本提取
- **跨环境兼容**: 支持浏览器和服务器环境

## 支持的格式

### Quill编辑器支持的格式：
- `header` (标题: 支持h2和normal切换)
- `bold` (粗体)
- `italic` (斜体)  
- `underline` (下划线)
- `list` (列表: ordered/bullet)
- `link` (链接)
- `blockquote` (引用)

### 新的工具栏布局：
1. **标题组**: Header下拉选择器 (h2/normal)
2. **文本样式组**: 粗体、斜体、下划线
3. **列表组**: 有序列表、无序列表
4. **特殊格式组**: 链接、引用
5. **清除格式组**: 清除所有格式

### 清理的不支持标签：
- `<table>`, `<tr>`, `<td>` (表格)
- `<script>`, `<style>` (脚本和样式)
- 所有带有`style`属性的标签
- 所有事件处理属性 (`onclick`等)

## 测试

运行测试文件以验证功能：

```typescript
import { runTests } from '@/lib/utils/htmlTranslator.test';
runTests(); // 在控制台查看测试结果
```

## 内容获取策略

### 1. `getDisplayContent(clip, options)` - 显示内容策略
用于Card组件、列表显示等只读场景：
- 优先使用`html_raw`经过转译的内容（最佳显示效果）
- 转译失败时回退到`text_plain`（确保内容可见）
- 自动记录转译错误便于调试

### 2. `getEditContent(clip, options)` - 编辑内容策略  
用于QuillEditor等编辑场景：
- 优先使用`html_raw`（保持原始格式完整性）
- 没有HTML时使用`text_plain`
- 不进行转译处理（编辑器会自动处理格式）

### 3. 其他策略函数
- `getDetailedDisplayContent()` - 返回详细的处理信息
- `getSearchableContent()` - 提取纯文本用于搜索
- `assessContentQuality()` - 内容质量评估
- `getContentPreview()` - 获取内容预览

### 数据模型策略
- **保留** `html_raw`: 作为转译输入源和编辑原始内容
- **保留** `text_plain`: 用于搜索、回退、性能优化
- **不添加** `content`字段: 避免数据冗余，使用动态策略

```typescript
// 使用示例
import { getDisplayContent, getEditContent } from '@/lib/utils';

// Card组件显示
const displayContent = getDisplayContent(clip);

// 编辑器内容
const editContent = getEditContent(clip);
```

## 注意事项

1. **性能**: 大文件（>100KB）会被拒绝处理
2. **安全**: 自动清理危险的HTML内容
3. **兼容性**: 同时支持浏览器和Node.js环境
4. **降级处理**: 转换失败时提供文本备用方案
5. **策略导向**: 根据使用场景选择合适的内容获取策略
