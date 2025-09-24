/**
 * HTML转译核心工具
 * 将HTML标签转换为Quill编辑器支持的格式
 */

// 支持的Quill格式常量
export const QUILL_FORMATS = {
  // 文字样式
  BOLD: 'bold',
  ITALIC: 'italic', 
  UNDERLINE: 'underline',
  
  // 文字大小
  NORMAL: 'normal', // 非Heading标签的默认格式
  
  // 列表类型
  LIST_ORDERED: 'ordered',
  LIST_BULLET: 'bullet',
  
  // 特殊格式
  LINK: 'link',
  BLOCKQUOTE: 'blockquote',
  
  // 标题类型（Quill只支持header 1和header 2）
  HEADER_1: '1',
  HEADER_2: '2'
} as const;

// HTML标签到Quill格式的映射规则
const HTML_TO_QUILL_MAPPING = {
  // 标题标签 - 所有heading标签都转换为Quill Header2格式
  'h1': QUILL_FORMATS.HEADER_2,
  'h2': QUILL_FORMATS.HEADER_2,
  'h3': QUILL_FORMATS.HEADER_2,
  'h4': QUILL_FORMATS.HEADER_2,
  'h5': QUILL_FORMATS.HEADER_2,
  'h6': QUILL_FORMATS.HEADER_2,
  
  // 非Heading标签 - 转换为normal格式
  'p': QUILL_FORMATS.NORMAL,
  'div': QUILL_FORMATS.NORMAL,
  'span': QUILL_FORMATS.NORMAL,
  'section': QUILL_FORMATS.NORMAL,
  'article': QUILL_FORMATS.NORMAL,
  
  // 文字样式标签
  'b': QUILL_FORMATS.BOLD,
  'strong': QUILL_FORMATS.BOLD,
  'i': QUILL_FORMATS.ITALIC,
  'em': QUILL_FORMATS.ITALIC,
  'u': QUILL_FORMATS.UNDERLINE,
  
  // 列表标签
  'ol': QUILL_FORMATS.LIST_ORDERED,
  'ul': QUILL_FORMATS.LIST_BULLET,
  
  // 特殊标签
  'blockquote': QUILL_FORMATS.BLOCKQUOTE,
  'a': QUILL_FORMATS.LINK
} as const;

// 支持的HTML标签集合
const SUPPORTED_TAGS = new Set(Object.keys(HTML_TO_QUILL_MAPPING));

// 需要保留的块级标签
const BLOCK_TAGS = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li', 'section', 'article']);

// 需要保留的内联标签
const INLINE_TAGS = new Set(['span', 'b', 'strong', 'i', 'em', 'u', 'a']);

// 需要转换为normal格式的标签
const NORMAL_FORMAT_TAGS = new Set(['p', 'div', 'span', 'section', 'article']);

// 列表相关标签
const LIST_TAGS = new Set(['ol', 'ul', 'li']);

/**
 * 输入验证函数
 * @param html - 待验证的HTML字符串
 * @returns 验证结果和错误信息
 */
function validateInput(html: string): { isValid: boolean; error?: string } {
  if (typeof html !== 'string') {
    return { isValid: false, error: 'Input must be a string' };
  }
  
  if (html.length > 100000) { // 100KB限制
    return { isValid: false, error: 'HTML content too large (max 100KB)' };
  }
  
  return { isValid: true };
}

/**
 * 清理和规范化HTML标签
 * @param html - 原始HTML字符串
 * @returns 清理后的HTML字符串
 */
function cleanAndNormalizeHtml(html: string): string {
  // 移除HTML注释
  let cleaned = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // 移除script和style标签及其内容
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // 移除危险的属性（除了href和必要的属性）
  cleaned = cleaned.replace(/\s(on\w+|javascript:|data:|style)="[^"]*"/gi, '');
  
  // 规范化常见的格式变体
  cleaned = cleaned.replace(/<\/?\s*br\s*\/?>/gi, '<br>');
  cleaned = cleaned.replace(/&nbsp;/gi, ' ');
  cleaned = cleaned.replace(/&amp;/gi, '&');
  cleaned = cleaned.replace(/&lt;/gi, '<');
  cleaned = cleaned.replace(/&gt;/gi, '>');
  cleaned = cleaned.replace(/&quot;/gi, '"');
  
  return cleaned.trim();
}

/**
 * 转换标题标签为Quill格式
 * @param content - 标题内容
 * @returns Quill格式的标题HTML
 */
function convertHeadingToQuill(content: string): string {
  // 所有标题都转换为h2（Quill的header 2格式）
  return `<h2>${content}</h2>`;
}

/**
 * 转换非Heading标签为normal格式
 * @param tagName - HTML标签名
 * @param content - 标签内容
 * @returns 转换后的normal格式HTML
 */
function convertNormalFormatTag(tagName: string, content: string): string {
  const tag = tagName.toLowerCase();
  
  // 对于块级标签，保持原始标签
  if (['p', 'div', 'section', 'article'].includes(tag)) {
    return `<${tag}>${content}</${tag}>`;
  }
  
  // 对于内联标签如span，保持原始标签
  if (tag === 'span') {
    return `<span>${content}</span>`;
  }
  
  // 默认返回段落格式
  return `<p>${content}</p>`;
}

/**
 * 转换文字样式标签
 * @param tagName - HTML标签名
 * @param content - 标签内容
 * @param attributes - 标签属性
 * @returns 转换后的HTML
 */
function convertTextStyleTag(tagName: string, content: string, attributes: string = ''): string {
  switch (tagName.toLowerCase()) {
    case 'b':
    case 'strong':
      return `<strong>${content}</strong>`;
    case 'i':
    case 'em':
      return `<em>${content}</em>`;
    case 'u':
      return `<u>${content}</u>`;
    case 'a':
      // 保留链接的href属性
      const hrefMatch = attributes.match(/href="([^"]*)"/i);
      const href = hrefMatch ? hrefMatch[1] : '#';
      return `<a href="${href}">${content}</a>`;
    default:
      return content;
  }
}

/**
 * 转换列表标签
 * @param tagName - 列表标签名（ol/ul）
 * @param content - 列表内容
 * @returns 转换后的列表HTML
 */
function convertListTag(tagName: string, content: string): string {
  const listType = tagName.toLowerCase() === 'ol' ? 'ol' : 'ul';
  return `<${listType}>${content}</${listType}>`;
}

/**
 * 处理列表项
 * @param content - 列表项内容
 * @returns 处理后的列表项HTML
 */
function convertListItem(content: string): string {
  return `<li>${content}</li>`;
}

/**
 * 转换blockquote标签
 * @param content - 引用内容
 * @returns Quill格式的blockquote
 */
function convertBlockquote(content: string): string {
  return `<blockquote>${content}</blockquote>`;
}

/**
 * 递归处理HTML节点
 * @param html - HTML字符串
 * @returns 转换后的HTML字符串
 */
function processHtmlNodes(html: string): string {
  // 简单的标签匹配正则（处理嵌套标签）
  const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/gi;
  const selfClosingRegex = /<(\w+)([^>]*)\/?>/gi;
  
  let result = html;
  
  // 处理成对标签
  result = result.replace(tagRegex, (match, tagName, attributes, content) => {
    const tag = tagName.toLowerCase();
    
    // 递归处理嵌套内容
    const processedContent = processHtmlNodes(content);
    
    // 根据标签类型进行转换
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      return convertHeadingToQuill(processedContent);
    }
    
    // 处理非Heading标签 - 转换为normal格式
    if (NORMAL_FORMAT_TAGS.has(tag)) {
      return convertNormalFormatTag(tag, processedContent);
    }
    
    if (['b', 'strong', 'i', 'em', 'u', 'a'].includes(tag)) {
      return convertTextStyleTag(tag, processedContent, attributes);
    }
    
    if (['ol', 'ul'].includes(tag)) {
      return convertListTag(tag, processedContent);
    }
    
    if (tag === 'li') {
      return convertListItem(processedContent);
    }
    
    if (tag === 'blockquote') {
      return convertBlockquote(processedContent);
    }
    
    // 保留的块级和内联标签
    if (BLOCK_TAGS.has(tag) || INLINE_TAGS.has(tag)) {
      return `<${tag}>${processedContent}</${tag}>`;
    }
    
    // 不支持的标签，只保留内容
    return processedContent;
  });
  
  // 处理自闭合标签（如<br>）
  result = result.replace(selfClosingRegex, (match, tagName, attributes) => {
    const tag = tagName.toLowerCase();
    
    if (tag === 'br') {
      return '<br>';
    }
    
    // 移除其他自闭合标签
    return '';
  });
  
  return result;
}

/**
 * 将HTML转换为Quill编辑器支持的格式
 * @param html - 原始HTML字符串
 * @returns 转换后的Quill格式HTML字符串
 * @throws Error - 当输入无效时抛出错误
 */
export function translateHtmlToQuill(html: string): string {
  try {
    // 输入验证
    const validation = validateInput(html);
    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.error}`);
    }
    
    // 空输入处理
    if (!html || html.trim() === '') {
      return '';
    }
    
    // 清理和规范化HTML
    const cleanedHtml = cleanAndNormalizeHtml(html);
    
    // 处理HTML节点转换
    let result = processHtmlNodes(cleanedHtml);
    
    // 清理多余的空白字符和换行
    result = result.replace(/\s+/g, ' ').trim();
    
    // 确保结果不为空时至少包含基本内容
    if (result === '' && cleanedHtml !== '') {
      // 如果转换结果为空但原内容不为空，返回纯文本
      return htmlToPlainText(cleanedHtml);
    }
    
    return result;
    
  } catch (error) {
    console.error('HTML translation error:', error);
    
    // 错误恢复：返回纯文本版本
    try {
      return htmlToPlainText(html);
    } catch (fallbackError) {
      console.error('Fallback text extraction failed:', fallbackError);
      return '内容转换失败';
    }
  }
}

/**
 * 将HTML转换为纯文本
 * @param html - HTML字符串
 * @returns 纯文本字符串
 */
export function htmlToPlainText(html: string): string {
  try {
    // 输入验证
    if (typeof html !== 'string') {
      return '';
    }
    
    if (html.trim() === '') {
      return '';
    }
    
    // 在浏览器环境中使用DOM API
    if (typeof window !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    }
    
    // 在服务器环境中使用正则表达式
    let text = html;
    
    // 移除script和style标签及其内容
    text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
    
    // 移除HTML注释
    text = text.replace(/<!--[\s\S]*?-->/g, '');
    
    // 将块级标签转换为换行
    text = text.replace(/<\/?(div|p|br|h[1-6]|li|blockquote)[^>]*>/gi, '\n');
    
    // 移除所有HTML标签
    text = text.replace(/<[^>]*>/g, '');
    
    // 解码HTML实体
    text = text.replace(/&nbsp;/gi, ' ');
    text = text.replace(/&amp;/gi, '&');
    text = text.replace(/&lt;/gi, '<');
    text = text.replace(/&gt;/gi, '>');
    text = text.replace(/&quot;/gi, '"');
    text = text.replace(/&#39;/gi, "'");
    
    // 清理多余的空白字符
    text = text.replace(/\n\s*\n/g, '\n').trim();
    
    return text;
    
  } catch (error) {
    console.error('HTML to text conversion error:', error);
    return '文本提取失败';
  }
}

/**
 * 获取支持的Quill格式列表
 * @returns 支持的格式数组
 */
export function getSupportedQuillFormats(): string[] {
  return Object.values(QUILL_FORMATS);
}

/**
 * 检查HTML标签是否被支持
 * @param tagName - HTML标签名
 * @returns 是否支持该标签
 */
export function isSupportedHtmlTag(tagName: string): boolean {
  return SUPPORTED_TAGS.has(tagName.toLowerCase());
}

/**
 * 获取HTML标签的Quill格式映射
 * @param tagName - HTML标签名
 * @returns 对应的Quill格式，如果不支持则返回null
 */
export function getQuillFormatForHtmlTag(tagName: string): string | null {
  const format = HTML_TO_QUILL_MAPPING[tagName.toLowerCase() as keyof typeof HTML_TO_QUILL_MAPPING];
  return format || null;
}

// 默认导出主要转换函数
export default translateHtmlToQuill;
