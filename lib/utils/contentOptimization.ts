/**
 * 内容显示优化工具
 * 处理极长内容的性能和用户体验优化
 */

import type { Clip } from '../types/clips';

// =============================================================================
// 内容长度分析
// =============================================================================

export interface ContentMetrics {
  htmlLength: number;
  textLength: number;
  estimatedRenderTime: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'extreme';
  recommendations: string[];
}

/**
 * 分析内容的复杂度和性能特征
 */
export function analyzeContentMetrics(clip: Clip): ContentMetrics {
  const htmlLength = clip.html_raw?.length || 0;
  const textLength = clip.text_plain?.length || 0;
  
  // 估算渲染时间（基于内容长度和复杂度）
  let estimatedRenderTime = 0;
  let complexity: ContentMetrics['complexity'] = 'simple';
  const recommendations: string[] = [];

  // 基于文本长度的基础评估
  if (textLength < 500) {
    complexity = 'simple';
    estimatedRenderTime = 1;
  } else if (textLength < 2000) {
    complexity = 'moderate';
    estimatedRenderTime = 3;
  } else if (textLength < 10000) {
    complexity = 'complex';
    estimatedRenderTime = 8;
    recommendations.push('考虑启用懒加载');
  } else {
    complexity = 'extreme';
    estimatedRenderTime = 20;
    recommendations.push('建议使用虚拟滚动');
    recommendations.push('考虑内容分页显示');
  }

  // HTML复杂度调整
  if (htmlLength > textLength * 2) {
    estimatedRenderTime *= 1.5;
    recommendations.push('HTML内容较复杂，启用GPU加速');
  }

  // 检查HTML标签密度
  if (clip.html_raw) {
    const tagCount = (clip.html_raw.match(/<[^>]+>/g) || []).length;
    const tagDensity = tagCount / textLength;
    
    if (tagDensity > 0.1) {
      estimatedRenderTime *= 1.3;
      recommendations.push('标签密度较高，优化DOM结构');
    }
  }

  return {
    htmlLength,
    textLength,
    estimatedRenderTime: Math.round(estimatedRenderTime),
    complexity,
    recommendations
  };
}

// =============================================================================
// 性能优化策略
// =============================================================================

export interface OptimizationOptions {
  enableLazyLoading?: boolean;
  maxInitialHeight?: number;
  enableVirtualization?: boolean;
  gpuAcceleration?: boolean;
}

/**
 * 根据内容复杂度推荐优化选项
 */
export function getOptimizationRecommendations(metrics: ContentMetrics): OptimizationOptions {
  const options: OptimizationOptions = {};

  switch (metrics.complexity) {
    case 'simple':
      // 简单内容，无需特殊优化
      break;
      
    case 'moderate':
      options.gpuAcceleration = true;
      break;
      
    case 'complex':
      options.enableLazyLoading = true;
      options.maxInitialHeight = 500;
      options.gpuAcceleration = true;
      break;
      
    case 'extreme':
      options.enableLazyLoading = true;
      options.maxInitialHeight = 300;
      options.enableVirtualization = true;
      options.gpuAcceleration = true;
      break;
  }

  return options;
}

// =============================================================================
// 内容渲染优化组件逻辑
// =============================================================================

export interface RenderStrategy {
  shouldLazyLoad: boolean;
  initialHeight?: number;
  useVirtualization: boolean;
  cssOptimizations: string[];
}

/**
 * 确定最佳的渲染策略
 */
export function determineRenderStrategy(clip: Clip): RenderStrategy {
  const metrics = analyzeContentMetrics(clip);
  const options = getOptimizationRecommendations(metrics);
  
  const cssOptimizations: string[] = [];
  
  // 基础优化
  cssOptimizations.push('word-break: break-word');
  cssOptimizations.push('overflow-wrap: break-word');
  
  // 根据复杂度添加优化
  if (options.gpuAcceleration) {
    cssOptimizations.push('transform: translateZ(0)');
    cssOptimizations.push('will-change: transform');
  }
  
  if (metrics.complexity === 'complex' || metrics.complexity === 'extreme') {
    cssOptimizations.push('contain: layout style paint');
  }

  return {
    shouldLazyLoad: options.enableLazyLoading || false,
    initialHeight: options.maxInitialHeight,
    useVirtualization: options.enableVirtualization || false,
    cssOptimizations
  };
}

// =============================================================================
// 内容截断和分页逻辑
// =============================================================================

/**
 * 智能内容分页（为极长内容）
 */
export function createContentPages(content: string, maxPageLength: number = 5000): string[] {
  if (content.length <= maxPageLength) {
    return [content];
  }

  const pages: string[] = [];
  let currentPage = '';
  const sentences = content.split(/[.!?]+\s+/);
  
  for (const sentence of sentences) {
    if (currentPage.length + sentence.length > maxPageLength && currentPage.length > 0) {
      pages.push(currentPage.trim());
      currentPage = sentence;
    } else {
      currentPage += (currentPage ? '. ' : '') + sentence;
    }
  }
  
  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }
  
  return pages;
}

/**
 * 为长HTML内容创建"显示更多"功能
 */
export function createExpandableContent(
  htmlContent: string, 
  threshold: number = 1000
): {
  preview: string;
  fullContent: string;
  needsExpansion: boolean;
} {
  if (htmlContent.length <= threshold) {
    return {
      preview: htmlContent,
      fullContent: htmlContent,
      needsExpansion: false
    };
  }

  // 简单的HTML截断（在段落边界）
  const paragraphs = htmlContent.split('</p>');
  let preview = '';
  
  for (let i = 0; i < paragraphs.length; i++) {
    const withNextParagraph = preview + paragraphs[i] + (i < paragraphs.length - 1 ? '</p>' : '');
    
    if (withNextParagraph.length > threshold && preview.length > 0) {
      break;
    }
    
    preview = withNextParagraph;
  }

  // 确保HTML标签闭合
  if (!preview.endsWith('</p>') && preview.includes('<p')) {
    preview += '</p>';
  }

  return {
    preview,
    fullContent: htmlContent,
    needsExpansion: true
  };
}

// =============================================================================
// 性能监控
// =============================================================================

export interface PerformanceMetrics {
  renderTime: number;
  domNodes: number;
  memoryUsage: number;
  isOptimized: boolean;
}

/**
 * 测量内容渲染性能
 */
export function measureRenderPerformance(
  element: HTMLElement,
  contentLength: number
): PerformanceMetrics {
  const startTime = performance.now();
  
  // 测量DOM节点数量
  const domNodes = element.querySelectorAll('*').length;
  
  // 估算内存使用（简化计算）
  const memoryUsage = contentLength * 2 + domNodes * 100; // 字节估算
  
  const renderTime = performance.now() - startTime;
  
  // 判断是否已优化（基于性能阈值）
  const isOptimized = renderTime < 16 && domNodes < 1000; // 60fps阈值
  
  return {
    renderTime: Math.round(renderTime * 100) / 100,
    domNodes,
    memoryUsage,
    isOptimized
  };
}

// =============================================================================
// 批量优化工具
// =============================================================================

/**
 * 分析多个clips的渲染负载
 */
export function analyzeBatchRenderLoad(clips: Clip[]): {
  totalComplexity: number;
  averageLength: number;
  optimizationSuggestions: string[];
} {
  const metrics = clips.map(analyzeContentMetrics);
  
  const totalComplexity = metrics.reduce((sum, m) => {
    const weights = { simple: 1, moderate: 2, complex: 4, extreme: 8 };
    return sum + weights[m.complexity];
  }, 0);
  
  const averageLength = metrics.reduce((sum, m) => sum + m.textLength, 0) / clips.length;
  
  const suggestions: string[] = [];
  
  if (totalComplexity > 50) {
    suggestions.push('启用虚拟滚动以优化大量内容渲染');
  }
  
  if (averageLength > 2000) {
    suggestions.push('考虑默认折叠长内容');
  }
  
  const extremeCount = metrics.filter(m => m.complexity === 'extreme').length;
  if (extremeCount > 2) {
    suggestions.push('检测到多个极长内容，建议分页显示');
  }
  
  return {
    totalComplexity,
    averageLength: Math.round(averageLength),
    optimizationSuggestions: suggestions
  };
}

export default {
  analyzeContentMetrics,
  getOptimizationRecommendations,
  determineRenderStrategy,
  createContentPages,
  createExpandableContent,
  measureRenderPerformance,
  analyzeBatchRenderLoad
};
