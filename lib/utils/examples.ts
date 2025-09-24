/**
 * HTML转译器使用示例
 */

import { translateHtmlToQuill, htmlToPlainText } from './htmlTranslator';

// 使用示例函数
export function demonstrateHtmlTranslator() {
  console.log('=== HTML转译器使用示例 ===\n');

  // 示例1: 标题转换
  const headingHtml = '<h1>主标题</h1><h3>子标题</h3>';
  console.log('示例1 - 标题转换:');
  console.log('输入:', headingHtml);
  console.log('输出:', translateHtmlToQuill(headingHtml));
  console.log('纯文本:', htmlToPlainText(headingHtml));
  console.log('');

  // 示例1.1: 非Heading标签normal格式转换
  const normalHtml = '<p>段落文本</p><div>div容器内容</div><span>内联文本</span>';
  console.log('示例1.1 - Normal格式转换:');
  console.log('输入:', normalHtml);
  console.log('输出:', translateHtmlToQuill(normalHtml));
  console.log('纯文本:', htmlToPlainText(normalHtml));
  console.log('');

  // 示例2: 富文本格式
  const richTextHtml = '<p>这是<b>粗体</b>和<i>斜体</i>文本，还有<a href="https://example.com">链接</a></p>';
  console.log('示例2 - 富文本格式:');
  console.log('输入:', richTextHtml);
  console.log('输出:', translateHtmlToQuill(richTextHtml));
  console.log('纯文本:', htmlToPlainText(richTextHtml));
  console.log('');

  // 示例3: 列表内容
  const listHtml = '<ul><li>项目一</li><li>项目二</li></ul><ol><li>步骤1</li><li>步骤2</li></ol>';
  console.log('示例3 - 列表内容:');
  console.log('输入:', listHtml);
  console.log('输出:', translateHtmlToQuill(listHtml));
  console.log('纯文本:', htmlToPlainText(listHtml));
  console.log('');

  // 示例4: 复杂混合内容（测试新的Quill配置）
  const complexHtml = `
    <h1>主标题</h1>
    <h2>副标题</h2>
    <p>这是正文段落，包含<strong>重要内容</strong>和<em>强调文字</em>。</p>
    <blockquote>这是一段引用内容</blockquote>
    <ul>
      <li>要点一</li>
      <li>要点二，包含<a href="#">内联链接</a></li>
    </ul>
    <ol>
      <li>步骤一</li>
      <li>步骤二</li>
    </ol>
  `;
  console.log('示例4 - 复杂混合内容（测试新的Quill配置）:');
  console.log('输入:', complexHtml);
  console.log('输出:', translateHtmlToQuill(complexHtml));
  console.log('纯文本:', htmlToPlainText(complexHtml));
}

// 在Web应用中的实际使用场景
export function processClipContent(htmlContent: string) {
  try {
    // 转换为Quill格式用于编辑器显示
    const quillContent = translateHtmlToQuill(htmlContent);
    
    // 提取纯文本用于搜索索引
    const searchableText = htmlToPlainText(htmlContent);
    
    return {
      success: true,
      quillContent,
      searchableText,
      originalLength: htmlContent.length,
      processedLength: quillContent.length
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '转换失败',
      fallbackText: htmlToPlainText(htmlContent)
    };
  }
}
