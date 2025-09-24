/**
 * 内容获取策略模块
 * 为不同使用场景提供合适的内容获取方法
 */

import { htmlToPlainText } from './htmlTranslator';
import { translateHtmlToQuillCached } from './contentCache';
import { processHtml } from './htmlProcessor';
import type { Clip } from '../types/clips';

// =============================================================================
// 内容获取策略接口
// =============================================================================

/**
 * 内容获取结果类型
 */
export interface ContentResult {
  content: string;
  source: 'html_processed' | 'html_translated' | 'html_raw' | 'text_plain';
  hasError: boolean;
  errorMessage?: string;
  processingStats?: {
    originalLength: number;
    processedLength: number;
    processingTime: number;
    removedTags: string[];
  };
}

/**
 * 内容获取选项
 */
export interface ContentOptions {
  fallbackToPlainText?: boolean;     // 是否在转译失败时回退到纯文本
  logErrors?: boolean;               // 是否记录错误日志
  preserveFormatting?: boolean;      // 是否保留原始格式（编辑场景）
}

// =============================================================================
// 核心内容获取策略
// =============================================================================

/**
 * 显示内容获取策略 - 最佳实践版本
 * 用于Card组件、列表显示等只读场景
 * 
 * 新策略：
 * 1. 优先使用html_raw经过新的安全处理（最佳显示效果 + 安全性）
 * 2. 处理失败时尝试传统转译
 * 3. 最终回退到text_plain（确保内容可见）
 * 4. 记录详细的处理统计便于调试
 * 
 * @param clip - Clip对象
 * @param options - 可选配置
 * @returns 处理后的显示内容
 */
export async function getDisplayContent(clip: Clip, options: ContentOptions = {}): Promise<string> {
  const {
    fallbackToPlainText = true,
    logErrors = true
  } = options;

  // 策略 1: 使用新的 HTML 处理器（安全 + 标准化）
  if (clip.html_raw && clip.html_raw.trim() !== '') {
    try {
      const result = await processHtml(clip.html_raw, {
        normalizeHeadings: true,
        removeStyles: true,
        removeScripts: true,
        strictMode: false,
        useCache: true,
      });
      
      if (result.success && result.html.trim() !== '') {
        if (logErrors) {
          console.log(`✅ HTML处理成功 Clip ${clip.id}:`, {
            originalLength: result.stats.originalLength,
            processedLength: result.stats.processedLength,
            processingTime: result.stats.processingTime.toFixed(2) + 'ms',
            removedTags: result.stats.removedTags,
            source: result.source
          });
        }
        return result.html;
      } else {
        if (logErrors) {
          console.warn(`⚠️ HTML处理失败 Clip ${clip.id}:`, result.error);
        }
      }
    } catch (error) {
      if (logErrors) {
        console.error(`❌ HTML处理异常 Clip ${clip.id}:`, error);
      }
    }
    
    // 策略 2: 回退到传统转译方式
    try {
      const translatedContent = translateHtmlToQuillCached(clip.html_raw);
      if (translatedContent && translatedContent.trim() !== '') {
        if (logErrors) {
          console.log(`🔄 回退到传统转译 Clip ${clip.id}`);
        }
        return translatedContent;
      }
    } catch (error) {
      if (logErrors) {
        console.warn(`⚠️ 传统转译也失败 Clip ${clip.id}:`, error);
      }
    }
  }

  // 策略 3: 回退到纯文本内容
  if (fallbackToPlainText && clip.text_plain) {
    if (logErrors) {
      console.log(`📝 使用纯文本内容 Clip ${clip.id}`);
    }
    return clip.text_plain;
  }

  // 最后的保底方案
  if (logErrors) {
    console.warn(`🆘 使用标题作为最后保底 Clip ${clip.id}`);
  }
  return clip.title || '内容获取失败';
}

/**
 * 编辑内容获取策略  
 * 用于QuillEditor等编辑场景
 * 
 * 策略：
 * 1. 优先使用html_raw（保持原始格式完整性）
 * 2. 没有HTML时使用text_plain
 * 3. 不进行转译处理（编辑器会自动处理格式）
 * 
 * @param clip - Clip对象
 * @param options - 可选配置
 * @returns 用于编辑的原始内容
 */
export function getEditContent(clip: Clip, options: ContentOptions = {}): string {
  const { preserveFormatting = true } = options;

  // 编辑场景优先使用原始HTML（保持格式完整性）
  if (clip.html_raw && preserveFormatting) {
    return clip.html_raw;
  }

  // 回退到纯文本
  return clip.text_plain || '';
}

// =============================================================================
// 高级内容获取策略
// =============================================================================

/**
 * 详细的内容获取策略（返回详细信息）- 最佳实践版本
 * 用于需要了解内容来源和处理状态的场景
 * 
 * @param clip - Clip对象
 * @param options - 可选配置
 * @returns 详细的内容获取结果
 */
export async function getDetailedDisplayContent(clip: Clip, options: ContentOptions = {}): Promise<ContentResult> {
  const {
    fallbackToPlainText = true,
    logErrors = false
  } = options;

  // 策略 1: 使用新的 HTML 处理器
  if (clip.html_raw) {
    try {
      const result = await processHtml(clip.html_raw, {
        normalizeHeadings: true,
        removeStyles: true,
        removeScripts: true,
        strictMode: false,
        useCache: true,
      });
      
      if (result.success && result.html.trim() !== '') {
        return {
          content: result.html,
          source: 'html_processed',
          hasError: false,
          processingStats: {
            originalLength: result.stats.originalLength,
            processedLength: result.stats.processedLength,
            processingTime: result.stats.processingTime,
            removedTags: result.stats.removedTags,
          },
        };
      } else {
        if (logErrors) {
          console.warn(`新HTML处理失败 Clip ${clip.id}:`, result.error);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (logErrors) {
        console.error(`新HTML处理异常 Clip ${clip.id}:`, errorMessage);
      }
    }
    
    // 策略 2: 回退到传统转译
    try {
      const translatedContent = translateHtmlToQuillCached(clip.html_raw);
      
      if (translatedContent && translatedContent.trim() !== '') {
        return {
          content: translatedContent,
          source: 'html_translated',
          hasError: false,
        };
      }
      
      // 转译结果为空
      if (fallbackToPlainText && clip.text_plain) {
        return {
          content: clip.text_plain,
          source: 'text_plain',
          hasError: true,
          errorMessage: 'HTML转译结果为空'
        };
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '转译失败';
      
      if (logErrors) {
        console.warn('HTML转译失败', { clipId: clip.id, error: errorMessage });
      }
      
      // 转译失败，回退到纯文本
      if (fallbackToPlainText && clip.text_plain) {
        return {
          content: clip.text_plain,
          source: 'text_plain',
          hasError: true,
          errorMessage
        };
      }
      
      return {
        content: clip.title || '内容获取失败',
        source: 'text_plain',
        hasError: true,
        errorMessage
      };
    }
  }

  // 直接使用纯文本
  if (clip.text_plain) {
    return {
      content: clip.text_plain,
      source: 'text_plain',
      hasError: false
    };
  }

  // 最后的保底方案
  return {
    content: clip.title || '内容获取失败',
    source: 'text_plain',
    hasError: true,
    errorMessage: '没有可用的内容'
  };
}

/**
 * 搜索友好的内容获取策略
 * 提取纯文本用于搜索索引和匹配
 * 
 * @param clip - Clip对象
 * @returns 用于搜索的纯文本内容
 */
export function getSearchableContent(clip: Clip): string {
  // 如果有HTML，提取纯文本
  if (clip.html_raw) {
    try {
      const plainText = htmlToPlainText(clip.html_raw);
      if (plainText && plainText.trim() !== '') {
        return plainText;
      }
    } catch (error) {
      console.warn('搜索文本提取失败', { clipId: clip.id, error });
    }
  }

  // 回退到已有的纯文本
  return clip.text_plain || clip.title || '';
}

// =============================================================================
// 内容质量评估
// =============================================================================

/**
 * 内容质量评估
 * 评估Clip内容的完整性和质量
 * 
 * @param clip - Clip对象
 * @returns 质量评估结果
 */
export function assessContentQuality(clip: Clip) {
  const hasHtml = !!(clip.html_raw && clip.html_raw.trim());
  const hasPlainText = !!(clip.text_plain && clip.text_plain.trim());
  const hasTitle = !!(clip.title && clip.title.trim());
  
  let score = 0;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 内容完整性评分
  if (hasHtml) {
    score += 50;
    
    // 测试HTML转译是否成功（使用缓存版本）
    try {
      const translated = translateHtmlToQuillCached(clip.html_raw!);
      if (translated && translated.trim()) {
        score += 30;
      } else {
        issues.push('HTML转译结果为空');
        recommendations.push('检查HTML格式是否正确');
      }
    } catch (error) {
      issues.push('HTML转译失败');
      recommendations.push('HTML格式可能存在问题');
    }
  }

  if (hasPlainText) {
    score += 15;
  } else {
    issues.push('缺少纯文本内容');
    recommendations.push('添加文本内容作为回退方案');
  }

  if (hasTitle) {
    score += 5;
  } else {
    issues.push('缺少标题');
    recommendations.push('添加描述性标题');
  }

  // 内容长度评估
  const textLength = clip.text_plain?.length || 0;
  if (textLength < 10) {
    issues.push('内容过短');
  } else if (textLength > 10000) {
    issues.push('内容过长，可能影响性能');
    recommendations.push('考虑分割长内容');
  }

  return {
    score: Math.min(score, 100),
    hasHtml,
    hasPlainText,
    hasTitle,
    issues,
    recommendations,
    quality: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'
  };
}

// =============================================================================
// 便捷工具函数
// =============================================================================

/**
 * 检查Clip是否有有效内容
 * 
 * @param clip - Clip对象
 * @returns 是否有有效内容
 */
export function hasValidContent(clip: Clip): boolean {
  return !!(
    (clip.html_raw && clip.html_raw.trim()) ||
    (clip.text_plain && clip.text_plain.trim()) ||
    (clip.title && clip.title.trim())
  );
}

/**
 * 同步版本的显示内容获取（用于向后兼容）
 * 优先使用新的处理器（同步模式），否则回退到传统方式
 * 
 * @param clip - Clip对象
 * @param options - 可选配置
 * @returns 处理后的显示内容
 */
export function getDisplayContentSync(clip: Clip, options: ContentOptions = {}): string {
  const {
    fallbackToPlainText = true,
    logErrors = true
  } = options;

  // 策略 1: 尝试使用新的 HTML 处理器（同步模式）
  if (clip.html_raw && clip.html_raw.trim() !== '') {
    try {
      // 先尝试简化版的标题标准化
      let processedHtml = clip.html_raw;
      
      // 标准化标题标签 (h1-h6 → h2)
      processedHtml = processedHtml.replace(/<h[1-6]([^>]*)>([\s\S]*?)<\/h[1-6]>/gi, '<h2$1>$2</h2>');
      
      // 移除危险的样式和脚本
      processedHtml = processedHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
      processedHtml = processedHtml.replace(/<style[\s\S]*?<\/style>/gi, '');
      processedHtml = processedHtml.replace(/\sstyle="[^"]*"/gi, '');
      
      // 清理多余空白
      processedHtml = processedHtml.replace(/\s+/g, ' ').trim();
      
      if (processedHtml && processedHtml.trim() !== '') {
        if (logErrors) {
          console.log(`✅ 同步HTML处理成功 Clip ${clip.id}: 标题已标准化`);
        }
        return processedHtml;
      }
    } catch (error) {
      if (logErrors) {
        console.warn(`⚠️ 同步HTML处理失败 Clip ${clip.id}:`, error);
      }
    }
    
    // 策略 2: 回退到传统转译
    try {
      const translatedContent = translateHtmlToQuillCached(clip.html_raw);
      if (translatedContent && translatedContent.trim() !== '') {
        if (logErrors) {
          console.log(`🔄 回退到传统转译 Clip ${clip.id}`);
        }
        return translatedContent;
      }
    } catch (error) {
      if (logErrors) {
        console.warn(`⚠️ 传统转译失败 Clip ${clip.id}:`, error);
      }
    }
    
    // 策略 3: 最后使用原始HTML
    if (logErrors) {
      console.log(`🚀 直接使用原始HTML Clip ${clip.id}`);
    }
    return clip.html_raw;
  }

  // 回退到纯文本内容
  if (fallbackToPlainText && clip.text_plain) {
    if (logErrors) {
      console.log(`📝 使用纯文本内容 Clip ${clip.id}`);
    }
    return clip.text_plain;
  }

  // 最后的保底方案
  if (logErrors) {
    console.warn(`🆘 使用标题作为最后保底 Clip ${clip.id}`);
  }
  return clip.title || '内容获取失败';
}

/**
 * 获取内容预览（截断版本）
 * 
 * @param clip - Clip对象
 * @param maxLength - 最大长度，默认150字符
 * @returns 内容预览
 */
export function getContentPreview(clip: Clip, maxLength: number = 150): string {
  const content = getDisplayContentSync(clip, { logErrors: false });
  
  if (content.length <= maxLength) {
    return content;
  }
  
  return content.substring(0, maxLength).trim() + '...';
}

/**
 * 批量处理Clips的显示内容（同步版本）
 * 
 * @param clips - Clip数组
 * @param options - 可选配置
 * @returns 处理后的内容数组
 */
export function batchGetDisplayContent(clips: Clip[], options: ContentOptions = {}): string[] {
  return clips.map(clip => getDisplayContentSync(clip, options));
}

/**
 * 批量处理Clips的显示内容（异步版本）
 * 
 * @param clips - Clip数组
 * @param options - 可选配置
 * @returns 处理后的内容数组
 */
export async function batchGetDisplayContentAsync(clips: Clip[], options: ContentOptions = {}): Promise<string[]> {
  return Promise.all(clips.map(clip => getDisplayContent(clip, options)));
}

// =============================================================================
// 数据模型验证
// =============================================================================

/**
 * 验证数据模型的简洁性
 * 确保没有不必要的冗余字段
 * 
 * @param clip - Clip对象
 * @returns 验证结果
 */
export function validateDataModelSimplicity(clip: unknown): {
  isSimple: boolean;
  redundantFields: string[];
  recommendations: string[];
} {
  const redundantFields: string[] = [];
  const recommendations: string[] = [];

  // 检查是否有冗余的content字段
  if ('content' in clip) {
    redundantFields.push('content');
    recommendations.push('移除content字段，使用html_raw和text_plain组合');
  }

  // 检查是否有其他HTML相关的冗余字段
  if ('html_processed' in clip || 'html_formatted' in clip) {
    redundantFields.push('html_processed', 'html_formatted');
    recommendations.push('移除处理后的HTML字段，使用动态转译');
  }

  return {
    isSimple: redundantFields.length === 0,
    redundantFields,
    recommendations
  };
}

// 默认导出主要函数（向后兼容）
export { getDisplayContentSync as default };
