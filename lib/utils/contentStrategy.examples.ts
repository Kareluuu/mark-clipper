/**
 * 内容策略使用示例
 * 演示在不同场景下如何使用内容获取策略
 */

import { 
  getDisplayContent, 
  getEditContent, 
  getDetailedDisplayContent,
  getSearchableContent,
  assessContentQuality,
  hasValidContent,
  getContentPreview,
  validateDataModelSimplicity
} from './contentStrategy';
import type { Clip } from '../types/clips';

// =============================================================================
// 示例数据
// =============================================================================

// 示例Clip数据（模拟不同场景）
const sampleClips: Clip[] = [
  {
    id: 1,
    title: '完整HTML内容示例',
    text_plain: '这是一个包含HTML格式的文章摘录，包含标题、段落和列表。',
    html_raw: '<h1>技术文章</h1><p>这是一个包含<strong>重要信息</strong>的段落。</p><ul><li>要点一</li><li>要点二</li></ul>',
    created_at: '2024-01-15T10:30:00Z',
    url: 'https://example.com/article',
    theme_name: 'Olivine',
    category: 'tech'
  },
  {
    id: 2,
    title: '纯文本内容示例',
    text_plain: '这是一个只有纯文本的记录，没有HTML格式。简单但有用的信息。',
    created_at: '2024-01-15T11:00:00Z',
    theme_name: 'Maya_blue',
    category: 'notes'
  },
  {
    id: 3,
    title: '问题HTML示例',
    text_plain: '这是一个HTML转译可能失败的示例的回退文本。',
    html_raw: '<script>alert("bad");</script><invalid-tag>内容</invalid>',
    created_at: '2024-01-15T11:30:00Z',
    theme_name: 'Jasmine',
    category: 'test'
  },
  {
    id: 4,
    title: '空内容示例',
    text_plain: '',
    created_at: '2024-01-15T12:00:00Z',
    theme_name: 'Eggshell',
    category: 'empty'
  }
];

// =============================================================================
// Card组件使用示例
// =============================================================================

/**
 * Card组件中的内容显示
 * 优先显示转译后的HTML，失败时回退到纯文本
 */
export function demonstrateCardUsage() {
  console.log('=== Card组件内容显示示例 ===\n');
  
  sampleClips.forEach((clip, index) => {
    console.log(`Card ${index + 1}: ${clip.title}`);
    
    // 获取显示内容（Card组件使用）
    const displayContent = getDisplayContent(clip);
    console.log(`显示内容: ${displayContent.substring(0, 100)}...`);
    
    // 获取预览内容（Card组件预览）
    const preview = getContentPreview(clip, 80);
    console.log(`预览: ${preview}`);
    
    console.log('');
  });
}

// =============================================================================
// EditModal组件使用示例
// =============================================================================

/**
 * EditModal中的内容编辑
 * 使用原始HTML保持格式完整性
 */
export function demonstrateEditModalUsage() {
  console.log('=== EditModal编辑内容示例 ===\n');
  
  sampleClips.forEach((clip, index) => {
    console.log(`编辑 ${index + 1}: ${clip.title}`);
    
    // 获取编辑内容（EditModal使用）
    const editContent = getEditContent(clip);
    console.log(`编辑内容: ${editContent.substring(0, 100)}...`);
    
    // 检查内容质量
    const quality = assessContentQuality(clip);
    console.log(`内容质量: ${quality.quality} (${quality.score}分)`);
    if (quality.issues.length > 0) {
      console.log(`问题: ${quality.issues.join(', ')}`);
    }
    
    console.log('');
  });
}

// =============================================================================
// 搜索功能使用示例
// =============================================================================

/**
 * 搜索功能中的内容索引
 * 提取纯文本用于搜索匹配
 */
export function demonstrateSearchUsage() {
  console.log('=== 搜索功能内容提取示例 ===\n');
  
  // 建立搜索索引
  const searchIndex = sampleClips.map(clip => ({
    id: clip.id,
    title: clip.title,
    searchableContent: getSearchableContent(clip),
    hasContent: hasValidContent(clip)
  }));
  
  console.log('搜索索引:');
  searchIndex.forEach(item => {
    console.log(`ID: ${item.id}`);
    console.log(`标题: ${item.title}`);
    console.log(`可搜索内容: ${item.searchableContent.substring(0, 80)}...`);
    console.log(`有效内容: ${item.hasContent ? '是' : '否'}`);
    console.log('');
  });
  
  // 模拟搜索
  const searchTerm = '重要';
  const results = searchIndex.filter(item => 
    item.title.includes(searchTerm) || 
    item.searchableContent.includes(searchTerm)
  );
  
  console.log(`搜索 "${searchTerm}" 的结果:`);
  results.forEach(result => {
    console.log(`- ${result.title} (ID: ${result.id})`);
  });
}

// =============================================================================
// 详细内容分析示例
// =============================================================================

/**
 * 详细的内容获取和分析
 * 用于调试和内容质量监控
 */
export function demonstrateDetailedAnalysis() {
  console.log('=== 详细内容分析示例 ===\n');
  
  sampleClips.forEach((clip, index) => {
    console.log(`详细分析 ${index + 1}: ${clip.title}`);
    
    // 获取详细的显示内容结果
    const detailedResult = getDetailedDisplayContent(clip);
    console.log(`内容来源: ${detailedResult.source}`);
    console.log(`是否有错误: ${detailedResult.hasError ? '是' : '否'}`);
    if (detailedResult.errorMessage) {
      console.log(`错误信息: ${detailedResult.errorMessage}`);
    }
    console.log(`内容: ${detailedResult.content.substring(0, 80)}...`);
    
    // 验证数据模型简洁性
    const modelValidation = validateDataModelSimplicity(clip);
    console.log(`数据模型简洁: ${modelValidation.isSimple ? '是' : '否'}`);
    if (modelValidation.redundantFields.length > 0) {
      console.log(`冗余字段: ${modelValidation.redundantFields.join(', ')}`);
      console.log(`建议: ${modelValidation.recommendations.join('; ')}`);
    }
    
    console.log('');
  });
}

// =============================================================================
// 性能优化示例
// =============================================================================

/**
 * 批量处理和性能优化示例
 * 展示如何高效处理大量Clips
 */
export function demonstratePerformanceOptimization() {
  console.log('=== 性能优化示例 ===\n');
  
  // 模拟大量数据
  const manyClips = Array.from({ length: 100 }, (_, i) => ({
    ...sampleClips[i % sampleClips.length],
    id: i + 1,
    title: `${sampleClips[i % sampleClips.length].title} - ${i + 1}`
  }));
  
  console.log(`处理 ${manyClips.length} 个Clips...`);
  
  const startTime = performance.now();
  
  // 批量获取显示内容（优化的方式）
  const displayContents = manyClips.map(clip => 
    getDisplayContent(clip, { logErrors: false }) // 关闭错误日志提升性能
  );
  
  const endTime = performance.now();
  
  console.log(`批量处理完成，耗时: ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`平均每个Clip: ${((endTime - startTime) / manyClips.length).toFixed(2)}ms`);
  
  // 统计内容来源
  const sourceStats = manyClips.reduce((stats, clip) => {
    const hasHtml = !!(clip.html_raw && clip.html_raw.trim());
    const hasText = !!(clip.text_plain && clip.text_plain.trim());
    
    if (hasHtml) stats.html++;
    if (hasText) stats.text++;
    if (!hasHtml && !hasText) stats.empty++;
    
    return stats;
  }, { html: 0, text: 0, empty: 0 });
  
  console.log('内容来源统计:', sourceStats);
}

// =============================================================================
// 集成使用示例
// =============================================================================

/**
 * 完整的使用流程示例
 * 模拟真实应用中的使用场景
 */
export function demonstrateCompleteWorkflow() {
  console.log('=== 完整工作流程示例 ===\n');
  
  const clip = sampleClips[0]; // 使用第一个示例
  
  console.log('1. 组件渲染阶段:');
  console.log(`Card显示: ${getContentPreview(clip, 50)}`);
  
  console.log('\n2. 用户点击编辑:');
  console.log(`编辑器内容: ${getEditContent(clip).substring(0, 80)}...`);
  
  console.log('\n3. 搜索索引:');
  console.log(`搜索文本: ${getSearchableContent(clip).substring(0, 60)}...`);
  
  console.log('\n4. 质量检查:');
  const quality = assessContentQuality(clip);
  console.log(`质量评分: ${quality.score}/100 (${quality.quality})`);
  
  console.log('\n5. 错误处理:');
  const detailed = getDetailedDisplayContent(clip);
  console.log(`处理状态: ${detailed.hasError ? '有错误' : '正常'}`);
  
  console.log('\n工作流程完成 ✅');
}

// =============================================================================
// 主要演示函数
// =============================================================================

export function runContentStrategyExamples() {
  console.log('🚀 内容策略使用示例开始\n');
  
  demonstrateCardUsage();
  demonstrateEditModalUsage();
  demonstrateSearchUsage();
  demonstrateDetailedAnalysis();
  demonstratePerformanceOptimization();
  demonstrateCompleteWorkflow();
  
  console.log('✅ 内容策略示例完成');
}

export default runContentStrategyExamples;
