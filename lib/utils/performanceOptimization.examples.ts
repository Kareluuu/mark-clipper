/**
 * 性能优化使用示例
 * 展示如何在实际项目中应用各种性能优化策略
 */

import { 
  analyzeContentMetrics,
  determineRenderStrategy,
  analyzeBatchRenderLoad,
  createExpandableContent,
  createContentPages
} from './contentOptimization';

import {
  getPerformanceReport,
  getGlobalRenderingMetrics
} from './renderingPerformanceMonitor';

import type { Clip } from '../types/clips';

// =============================================================================
// 模拟数据
// =============================================================================

const mockClips: Clip[] = [
  {
    id: 1,
    title: '短内容示例',
    text_plain: '这是一个简短的文本内容。',
    html_raw: '<p>这是一个简短的<strong>HTML</strong>内容。</p>',
    created_at: '2024-01-15T10:30:00Z',
    theme_name: 'Olivine',
    category: 'notes'
  },
  {
    id: 2,
    title: '中等长度内容',
    text_plain: '这是一个中等长度的文本内容。'.repeat(50),
    html_raw: '<h1>标题</h1>' + '<p>这是段落内容。</p>'.repeat(20),
    created_at: '2024-01-15T11:00:00Z',
    theme_name: 'Maya_blue',
    category: 'article'
  },
  {
    id: 3,
    title: '极长内容示例',
    text_plain: '这是一个非常长的文本内容，用于测试极长内容的渲染性能。'.repeat(500),
    html_raw: '<article>' + 
      '<h1>长文章标题</h1>' +
      '<h2>章节1</h2>' +
      '<p>段落内容包含<strong>粗体</strong>、<em>斜体</em>和<a href="#">链接</a>。</p>'.repeat(100) +
      '<ul>' + '<li>列表项目</li>'.repeat(50) + '</ul>' +
      '<blockquote>这是引用内容。</blockquote>'.repeat(20) +
      '</article>',
    created_at: '2024-01-15T12:00:00Z',
    theme_name: 'Jasmine',
    category: 'document'
  }
];

// =============================================================================
// 性能分析示例
// =============================================================================

/**
 * 演示单个内容的性能分析
 */
export function demonstrateSingleContentAnalysis() {
  console.log('=== 单个内容性能分析示例 ===\n');

  mockClips.forEach((clip, index) => {
    console.log(`📊 分析内容 ${index + 1}: ${clip.title}`);
    
    // 分析内容复杂度
    const metrics = analyzeContentMetrics(clip);
    console.log('内容指标:', {
      文本长度: metrics.textLength,
      HTML长度: metrics.htmlLength,
      复杂度: metrics.complexity,
      估算渲染时间: `${metrics.estimatedRenderTime}ms`,
      优化建议: metrics.recommendations
    });

    // 确定渲染策略
    const strategy = determineRenderStrategy(clip);
    console.log('渲染策略:', {
      懒加载: strategy.shouldLazyLoad ? '启用' : '关闭',
      初始高度: strategy.initialHeight || '无限制',
      虚拟化: strategy.useVirtualization ? '启用' : '关闭',
      CSS优化: strategy.cssOptimizations.length + '项'
    });

    console.log('');
  });
}

/**
 * 演示批量内容分析
 */
export function demonstrateBatchAnalysis() {
  console.log('=== 批量内容渲染负载分析 ===\n');

  const batchAnalysis = analyzeBatchRenderLoad(mockClips);
  
  console.log('批量渲染分析:', {
    总复杂度: batchAnalysis.totalComplexity,
    平均长度: `${batchAnalysis.averageLength} 字符`,
    优化建议: batchAnalysis.optimizationSuggestions
  });

  // 模拟更大的数据集
  const largeBatch = Array.from({ length: 50 }, (_, i) => ({
    ...mockClips[i % mockClips.length],
    id: i + 1
  }));

  const largeAnalysis = analyzeBatchRenderLoad(largeBatch);
  console.log('\n大数据集分析 (50个items):', {
    总复杂度: largeAnalysis.totalComplexity,
    平均长度: `${largeAnalysis.averageLength} 字符`,
    优化建议: largeAnalysis.optimizationSuggestions
  });
}

/**
 * 演示可展开内容功能
 */
export function demonstrateExpandableContent() {
  console.log('=== 可展开内容功能示例 ===\n');

  const longClip = mockClips[2]; // 使用极长内容
  
  // 创建可展开的内容
  const expandable = createExpandableContent(longClip.html_raw || '', 1000);
  
  console.log('可展开内容分析:', {
    原始长度: `${longClip.html_raw?.length || 0} 字符`,
    预览长度: `${expandable.preview.length} 字符`,
    需要展开: expandable.needsExpansion ? '是' : '否',
    预览内容: expandable.preview.substring(0, 100) + '...'
  });

  // 创建内容分页
  const pages = createContentPages(longClip.text_plain || '', 2000);
  console.log('\n内容分页:', {
    原始长度: `${longClip.text_plain?.length || 0} 字符`,
    分页数量: pages.length,
    各页长度: pages.map(page => page.length)
  });
}

/**
 * 演示性能监控数据
 */
export function demonstratePerformanceMonitoring() {
  console.log('=== 性能监控数据示例 ===\n');

  // 获取全局性能指标
  const globalMetrics = getGlobalRenderingMetrics();
  console.log('全局渲染指标:', {
    平均渲染时间: `${globalMetrics.averageRenderTime.toFixed(2)}ms`,
    最慢渲染: `${globalMetrics.slowestRender.toFixed(2)}ms`,
    优化率: `${(globalMetrics.optimizationRate * 100).toFixed(1)}%`,
    总DOM节点: globalMetrics.totalDOMNodes,
    内存使用: `${(globalMetrics.memoryUsage / 1024).toFixed(1)}KB`
  });

  // 获取性能报告
  const report = getPerformanceReport();
  console.log('\n性能报告:', {
    优化建议: report.optimizationSuggestions,
    最慢组件数量: report.slowestComponents.length
  });

  if (report.slowestComponents.length > 0) {
    console.log('\n最慢的组件:');
    report.slowestComponents.slice(0, 3).forEach((component, index) => {
      console.log(`${index + 1}. ${component.componentId}`, {
        渲染时间: `${component.renderTime.toFixed(2)}ms`,
        内容长度: `${component.contentLength} 字符`,
        复杂度: component.complexity,
        DOM节点: component.domNodes
      });
    });
  }
}

/**
 * 演示性能优化策略选择
 */
export function demonstrateOptimizationStrategies() {
  console.log('=== 性能优化策略选择 ===\n');

  const strategies = {
    simple: '简单内容 - 无需特殊优化',
    moderate: '中等内容 - 启用GPU加速',
    complex: '复杂内容 - 懒加载 + GPU加速',
    extreme: '极复杂内容 - 虚拟化 + 分页 + 全面优化'
  };

  mockClips.forEach((clip, index) => {
    const metrics = analyzeContentMetrics(clip);
    const strategy = determineRenderStrategy(clip);
    
    console.log(`📋 内容 ${index + 1} (${metrics.complexity}):`);
    console.log(`策略: ${strategies[metrics.complexity]}`);
    console.log(`实际配置:`, {
      懒加载: strategy.shouldLazyLoad,
      初始高度限制: strategy.initialHeight,
      虚拟化: strategy.useVirtualization,
      CSS优化项: strategy.cssOptimizations.length
    });
    console.log('');
  });
}

/**
 * 演示实际使用场景
 */
export function demonstrateRealWorldUsage() {
  console.log('=== 实际使用场景演示 ===\n');

  // 场景1：列表页面加载
  console.log('🌟 场景1: 列表页面首次加载');
  const batchLoad = analyzeBatchRenderLoad(mockClips);
  console.log('预期性能影响:', {
    总渲染负载: batchLoad.totalComplexity,
    建议策略: batchLoad.optimizationSuggestions.length > 0 
      ? batchLoad.optimizationSuggestions[0] 
      : '无需特殊优化'
  });

  // 场景2：滚动加载更多
  console.log('\n📜 场景2: 滚动加载更多内容');
  const additionalItems = Array.from({ length: 20 }, (_, i) => ({
    ...mockClips[1],
    id: 100 + i
  }));
  const scrollLoad = analyzeBatchRenderLoad(additionalItems);
  console.log('滚动加载优化:', {
    新增负载: scrollLoad.totalComplexity,
    推荐: scrollLoad.optimizationSuggestions.length > 0
      ? '启用虚拟滚动' 
      : '当前加载量可接受'
  });

  // 场景3：搜索结果渲染
  console.log('\n🔍 场景3: 搜索结果快速渲染');
  const searchResults = mockClips.slice(0, 2); // 模拟搜索结果
  searchResults.forEach(clip => {
    const strategy = determineRenderStrategy(clip);
    console.log(`搜索结果 ${clip.id}:`, {
      优化策略: strategy.shouldLazyLoad ? '懒加载' : '直接渲染',
      性能预期: strategy.useVirtualization ? '需要特殊处理' : '正常渲染'
    });
  });
}

/**
 * 主要示例函数
 */
export function runPerformanceOptimizationExamples() {
  console.log('🚀 性能优化示例开始\n');
  
  demonstrateSingleContentAnalysis();
  demonstrateBatchAnalysis();
  demonstrateExpandableContent();
  demonstrateOptimizationStrategies();
  demonstrateRealWorldUsage();
  demonstratePerformanceMonitoring();
  
  console.log('✅ 性能优化示例完成');
}

export default runPerformanceOptimizationExamples;
