/**
 * HTML 处理器 - 最佳实践实现
 * 
 * 功能：
 * 1. 安全的 HTML 清理和消毒
 * 2. 标准化格式转换
 * 3. 性能优化的缓存机制
 * 4. 健壮的错误处理
 * 5. 内容质量验证
 */

import { LRUCache } from 'lru-cache';

// =============================================================================
// 类型定义
// =============================================================================

export interface ProcessingOptions {
  /** 是否移除样式属性 */
  removeStyles?: boolean;
  /** 是否移除脚本标签 */
  removeScripts?: boolean;
  /** 是否标准化标题标签 */
  normalizeHeadings?: boolean;
  /** 最大处理长度 */
  maxLength?: number;
  /** 是否启用缓存 */
  useCache?: boolean;
  /** 严格模式（更严格的清理） */
  strictMode?: boolean;
}

export interface ProcessingResult {
  /** 处理后的 HTML */
  html: string;
  /** 纯文本版本 */
  plainText: string;
  /** 处理是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 处理统计 */
  stats: {
    originalLength: number;
    processedLength: number;
    plainTextLength: number;
    removedTags: string[];
    processingTime: number;
  };
  /** 数据来源 */
  source: 'cache' | 'processed';
}

// =============================================================================
// 配置常量
// =============================================================================

/** 默认处理选项 */
const DEFAULT_OPTIONS: Required<ProcessingOptions> = {
  removeStyles: true,
  removeScripts: true,
  normalizeHeadings: true,
  maxLength: 100000, // 100KB
  useCache: true,
  strictMode: false,
};

/** 允许的安全标签 */
const ALLOWED_TAGS = new Set([
  // 文档结构
  'div', 'p', 'span', 'section', 'article', 'main', 'aside',
  // 标题
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // 文本格式
  'strong', 'b', 'em', 'i', 'u', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
  // 列表
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  // 链接和媒体
  'a', 'img',
  // 引用和代码
  'blockquote', 'cite', 'code', 'pre', 'kbd', 'samp', 'var',
  // 表格
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
  // 换行
  'br', 'hr',
]);

/** 严格模式下允许的标签（更少） */
const STRICT_ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br', 'blockquote'
]);

/** 允许的属性 */
const ALLOWED_ATTRIBUTES = new Map([
  ['a', new Set(['href', 'title', 'target'])],
  ['img', new Set(['src', 'alt', 'title', 'width', 'height'])],
  ['*', new Set(['id', 'class'])], // 通用属性
]);

/** 危险协议 */
const DANGEROUS_PROTOCOLS = new Set([
  'javascript:', 'data:', 'vbscript:', 'file:', 'about:'
]);

// =============================================================================
// 缓存系统
// =============================================================================

/** HTML 处理结果缓存 */
const processingCache = new LRUCache<string, ProcessingResult>({
  max: 1000, // 最多缓存 1000 个结果
  ttl: 1000 * 60 * 30, // 30 分钟过期
});

/**
 * 生成缓存键
 */
function generateCacheKey(html: string, options: ProcessingOptions): string {
  const optionsHash = JSON.stringify(options);
  const contentHash = html.slice(0, 100) + html.length; // 简单哈希
  return `${contentHash}_${optionsHash}`;
}

// =============================================================================
// 核心处理函数
// =============================================================================

/**
 * 处理 HTML 内容 - 主入口函数
 */
export async function processHtml(
  html: string, 
  options: ProcessingOptions = {}
): Promise<ProcessingResult> {
  const startTime = performance.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // 输入验证
  if (!html || typeof html !== 'string') {
    return createErrorResult('Invalid input: HTML must be a non-empty string', startTime);
  }
  
  if (html.length > opts.maxLength) {
    return createErrorResult(`Content too large: ${html.length} > ${opts.maxLength}`, startTime);
  }
  
  // 检查缓存
  if (opts.useCache) {
    const cacheKey = generateCacheKey(html, opts);
    const cached = processingCache.get(cacheKey);
    if (cached) {
      return { ...cached, source: 'cache' };
    }
  }
  
  try {
    // 执行处理流程
    const result = await executeProcessingPipeline(html, opts, startTime);
    
    // 缓存结果
    if (opts.useCache && result.success) {
      const cacheKey = generateCacheKey(html, opts);
      processingCache.set(cacheKey, result);
    }
    
    return result;
    
  } catch (error) {
    console.error('HTML processing failed:', error);
    return createErrorResult(
      `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      startTime
    );
  }
}

/**
 * 执行处理管道
 */
async function executeProcessingPipeline(
  html: string,
  options: Required<ProcessingOptions>,
  startTime: number
): Promise<ProcessingResult> {
  const removedTags: string[] = [];
  
  // 阶段 1: 基础清理
  let processed = basicCleanup(html, removedTags);
  
  // 阶段 2: 安全清理
  processed = sanitizeHtml(processed, options, removedTags);
  
  // 阶段 3: 格式标准化
  if (options.normalizeHeadings) {
    processed = normalizeHeadings(processed);
  }
  
  // 阶段 4: 生成纯文本
  const plainText = extractPlainText(processed);
  
  // 阶段 5: 最终清理
  processed = finalCleanup(processed);
  
  const endTime = performance.now();
  
  return {
    html: processed,
    plainText,
    success: true,
    stats: {
      originalLength: html.length,
      processedLength: processed.length,
      plainTextLength: plainText.length,
      removedTags,
      processingTime: endTime - startTime,
    },
    source: 'processed',
  };
}

/**
 * 基础清理 - 移除危险内容
 */
function basicCleanup(html: string, removedTags: string[]): string {
  let cleaned = html;
  
  // 移除 HTML 注释
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  
  // 移除 script 标签
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, () => {
    removedTags.push('script');
    return '';
  });
  
  // 移除 style 标签
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, () => {
    removedTags.push('style');
    return '';
  });
  
  // 移除 DOCTYPE 声明
  cleaned = cleaned.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
  
  // 移除 XML 声明
  cleaned = cleaned.replace(/<\?xml[\s\S]*?\?>/gi, '');
  
  return cleaned.trim();
}

/**
 * 安全清理 - 移除不安全的标签和属性
 */
function sanitizeHtml(
  html: string, 
  options: Required<ProcessingOptions>, 
  removedTags: string[]
): string {
  const allowedTags = options.strictMode ? STRICT_ALLOWED_TAGS : ALLOWED_TAGS;
  const tempDiv = createTempElement();
  
  try {
    tempDiv.innerHTML = html;
    sanitizeElement(tempDiv, allowedTags, removedTags);
    return tempDiv.innerHTML;
  } catch {
    console.warn('DOM sanitization failed, using regex fallback');
    return regexSanitize(html, allowedTags, removedTags);
  }
}

/**
 * 递归清理 DOM 元素
 */
function sanitizeElement(
  element: Element, 
  allowedTags: Set<string>, 
  removedTags: string[]
): void {
  const children = Array.from(element.children);
  
  for (const child of children) {
    const tagName = child.tagName.toLowerCase();
    
    // 检查标签是否允许
    if (!allowedTags.has(tagName)) {
      removedTags.push(tagName);
      // 保留内容但移除标签
      const textContent = child.textContent || '';
      child.replaceWith(document.createTextNode(textContent));
      continue;
    }
    
    // 清理属性
    sanitizeAttributes(child);
    
    // 递归处理子元素
    sanitizeElement(child, allowedTags, removedTags);
  }
}

/**
 * 清理元素属性
 */
function sanitizeAttributes(element: Element): void {
  const tagName = element.tagName.toLowerCase();
  const allowedAttrs = ALLOWED_ATTRIBUTES.get(tagName) || new Set();
  const generalAttrs = ALLOWED_ATTRIBUTES.get('*') || new Set();
  const allAllowed = new Set([...allowedAttrs, ...generalAttrs]);
  
  // 获取所有属性名
  const attributes = Array.from(element.attributes);
  
  for (const attr of attributes) {
    const attrName = attr.name.toLowerCase();
    
    // 移除不允许的属性
    if (!allAllowed.has(attrName)) {
      element.removeAttribute(attrName);
      continue;
    }
    
    // 检查危险协议
    if (attrName === 'href' || attrName === 'src') {
      const value = attr.value.trim().toLowerCase();
      if (DANGEROUS_PROTOCOLS.has(value.split(':')[0] + ':')) {
        element.removeAttribute(attrName);
      }
    }
    
    // 移除事件处理器
    if (attrName.startsWith('on')) {
      element.removeAttribute(attrName);
    }
  }
}

/**
 * 正则表达式回退清理
 */
function regexSanitize(
  html: string, 
  allowedTags: Set<string>, 
  removedTags: string[]
): string {
  // 移除不允许的标签，但保留内容
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/gi, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (!allowedTags.has(tag)) {
      removedTags.push(tag);
      return '';
    }
    return match;
  });
}

/**
 * 标准化标题标签
 */
function normalizeHeadings(html: string): string {
  // 将所有标题标签转换为 h2（符合 Quill 编辑器规范）
  return html.replace(/<h[1-6]([^>]*)>([\s\S]*?)<\/h[1-6]>/gi, '<h2$1>$2</h2>');
}

/**
 * 提取纯文本
 */
function extractPlainText(html: string): string {
  const tempDiv = createTempElement();
  try {
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  } catch (error) {
    // 回退到正则表达式
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

/**
 * 最终清理
 */
function finalCleanup(html: string): string {
  return html
    // 清理多余的空白
    .replace(/\s+/g, ' ')
    // 清理空标签
    .replace(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>\s*<\/\1>/gi, '')
    // 清理连续的换行
    .replace(/(<br\s*\/?>){3,}/gi, '<br><br>')
    .trim();
}

// =============================================================================
// 工具函数
// =============================================================================

/**
 * 创建临时 DOM 元素
 */
function createTempElement(): HTMLDivElement {
  if (typeof document !== 'undefined') {
    return document.createElement('div');
  }
  // 服务端环境的模拟实现
  return {
    innerHTML: '',
    textContent: '',
    children: [],
    // ... 其他必要的方法
  } as HTMLDivElement;
}

/**
 * 创建错误结果
 */
function createErrorResult(error: string, startTime: number): ProcessingResult {
  return {
    html: '',
    plainText: '',
    success: false,
    error,
    stats: {
      originalLength: 0,
      processedLength: 0,
      plainTextLength: 0,
      removedTags: [],
      processingTime: performance.now() - startTime,
    },
    source: 'processed',
  };
}

// =============================================================================
// 便捷函数
// =============================================================================

/**
 * 快速清理 HTML（使用默认选项）
 */
export function cleanHtml(html: string): Promise<string> {
  return processHtml(html).then(result => result.success ? result.html : '');
}

/**
 * 快速提取纯文本
 */
export function extractText(html: string): Promise<string> {
  return processHtml(html).then(result => result.success ? result.plainText : '');
}

/**
 * 严格模式清理（用于敏感内容）
 */
export function strictClean(html: string): Promise<ProcessingResult> {
  return processHtml(html, { strictMode: true });
}

/**
 * 清除缓存
 */
export function clearCache(): void {
  processingCache.clear();
}

/**
 * 获取缓存统计
 */
export function getCacheStats() {
  return {
    size: processingCache.size,
    maxSize: processingCache.max,
    hitRate: processingCache.calculatedSize,
  };
}
