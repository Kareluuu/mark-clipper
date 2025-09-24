/**
 * 系统验证工具 - 验证所有回退机制和错误处理
 * 
 * 功能：
 * 1. 验证HTML转译回退机制
 * 2. 验证内容策略回退机制  
 * 3. 验证缓存层回退机制
 * 4. 验证UI层回退机制
 * 5. 极端情况测试
 */

import { translateHtmlToQuill, htmlToPlainText } from './htmlTranslator';
import { getDisplayContent, getEditContent, assessContentQuality } from './contentStrategy';
import { translateHtmlToQuillCached, getCacheStats, clearTranslationCache } from './contentCache';
import type { Clip } from '../types/clips';

// ============ 验证结果类型定义 ============

export interface ValidationResult {
  layer: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  executionTime?: number;
}

export interface SystemValidationReport {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  timestamp: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  results: ValidationResult[];
  performanceMetrics: {
    averageTranslationTime: number;
    cacheHitRate: number;
    memoryUsage: string;
  };
}

// ============ 测试数据集 ============

const TEST_CLIPS: Partial<Clip>[] = [
  // 正常HTML内容
  {
    id: 'test-1',
    title: '正常HTML测试',
    html_raw: '<h2>标题</h2><p>这是一段正常的HTML内容。</p><ul><li>列表项1</li><li>列表项2</li></ul>',
    text_plain: '标题\n这是一段正常的HTML内容。\n• 列表项1\n• 列表项2'
  },
  
  // 损坏的HTML内容
  {
    id: 'test-2', 
    title: '损坏HTML测试',
    html_raw: '<h2>标题<p>未闭合标签<div><span>嵌套错误',
    text_plain: '标题\n未闭合标签\n嵌套错误'
  },
  
  // 空HTML内容
  {
    id: 'test-3',
    title: '空内容测试',
    html_raw: '',
    text_plain: '这是备用的纯文本内容'
  },
  
  // 只有标题
  {
    id: 'test-4',
    title: '仅标题测试',
    html_raw: '',
    text_plain: ''
  },
  
  // 极长内容
  {
    id: 'test-5',
    title: '极长内容测试',
    html_raw: '<p>' + 'A'.repeat(50000) + '</p>',
    text_plain: 'A'.repeat(50000)
  },
  
  // 特殊字符和编码
  {
    id: 'test-6',
    title: '特殊字符测试',
    html_raw: '<p>🌟 特殊字符 & HTML实体 &lt;&gt;&amp; 中文测试 中文测试</p>',
    text_plain: '🌟 特殊字符 & HTML实体 <>&  中文测试'
  },
  
  // 全部为空
  {
    id: 'test-7',
    title: '',
    html_raw: '',
    text_plain: ''
  }
];

// ============ HTML转译层验证 ============

async function validateHtmlTranslationLayer(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // 测试1: 正常HTML转译
  try {
    const startTime = performance.now();
    const result = translateHtmlToQuill('<h2>测试</h2><p>内容</p>');
    const executionTime = performance.now() - startTime;
    
    results.push({
      layer: 'HTML转译层',
      test: '正常HTML转译',
      status: result.includes('<h2>') ? 'pass' : 'fail',
      message: result.includes('<h2>') ? '转译成功' : '转译结果不符合预期',
      details: { result, executionTime },
      executionTime
    });
  } catch (error) {
    results.push({
      layer: 'HTML转译层',
      test: '正常HTML转译',
      status: 'fail',
      message: `转译失败: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  // 测试2: 损坏HTML回退
  try {
    const malformedHtml = '<h2>未闭合<p>错误<div>';
    const startTime = performance.now();
    const result = translateHtmlToQuill(malformedHtml);
    const executionTime = performance.now() - startTime;
    
    results.push({
      layer: 'HTML转译层', 
      test: '损坏HTML回退',
      status: typeof result === 'string' ? 'pass' : 'fail',
      message: typeof result === 'string' ? '成功处理损坏HTML' : '未能处理损坏HTML',
      details: { result, executionTime },
      executionTime
    });
  } catch (error) {
    results.push({
      layer: 'HTML转译层',
      test: '损坏HTML回退',
      status: 'warning',
      message: `损坏HTML抛出异常，需要上层回退处理: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  // 测试3: 纯文本提取回退
  try {
    const startTime = performance.now();
    const result = htmlToPlainText('<h2>标题</h2><p>内容</p>');
    const executionTime = performance.now() - startTime;
    
    results.push({
      layer: 'HTML转译层',
      test: '纯文本提取回退',
      status: result.includes('标题') && result.includes('内容') ? 'pass' : 'fail',
      message: result.includes('标题') && result.includes('内容') ? '纯文本提取成功' : '纯文本提取失败',
      details: { result, executionTime },
      executionTime
    });
  } catch (error) {
    results.push({
      layer: 'HTML转译层',
      test: '纯文本提取回退',
      status: 'fail',
      message: `纯文本提取失败: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  return results;
}

// ============ 内容策略层验证 ============

async function validateContentStrategyLayer(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  for (const testClip of TEST_CLIPS) {
    const clip = testClip as Clip;
    
    // 测试显示内容获取
    try {
      const startTime = performance.now();
      const displayContent = getDisplayContent(clip, { 
        fallbackToPlainText: true,
        logErrors: false 
      });
      const executionTime = performance.now() - startTime;
      
      const hasContent = displayContent && displayContent.trim().length > 0;
      
      results.push({
        layer: '内容策略层',
        test: `显示内容获取 - ${clip.title || clip.id}`,
        status: hasContent ? 'pass' : 'fail',
        message: hasContent ? '成功获取显示内容' : '未能获取显示内容',
        details: { 
          displayContent: displayContent.substring(0, 100) + (displayContent.length > 100 ? '...' : ''),
          contentLength: displayContent.length,
          executionTime 
        },
        executionTime
      });
    } catch (error) {
      results.push({
        layer: '内容策略层',
        test: `显示内容获取 - ${clip.title || clip.id}`,
        status: 'fail',
        message: `显示内容获取失败: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // 测试编辑内容获取
    try {
      const startTime = performance.now();
      const editContent = getEditContent(clip);
      const executionTime = performance.now() - startTime;
      
      const hasContent = editContent && editContent.trim().length > 0;
      
      results.push({
        layer: '内容策略层',
        test: `编辑内容获取 - ${clip.title || clip.id}`,
        status: hasContent ? 'pass' : 'warning',
        message: hasContent ? '成功获取编辑内容' : '编辑内容为空（可能正常）',
        details: { 
          editContent: editContent.substring(0, 100) + (editContent.length > 100 ? '...' : ''),
          contentLength: editContent.length,
          executionTime 
        },
        executionTime
      });
    } catch (error) {
      results.push({
        layer: '内容策略层',
        test: `编辑内容获取 - ${clip.title || clip.id}`,
        status: 'fail',
        message: `编辑内容获取失败: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    
    // 测试内容质量评估
    try {
      const startTime = performance.now();
      const quality = assessContentQuality(clip);
      const executionTime = performance.now() - startTime;
      
      results.push({
        layer: '内容策略层',
        test: `内容质量评估 - ${clip.title || clip.id}`,
        status: 'pass',
        message: `质量评估完成: ${quality.overallQuality}`,
        details: { quality, executionTime },
        executionTime
      });
    } catch (error) {
      results.push({
        layer: '内容策略层',
        test: `内容质量评估 - ${clip.title || clip.id}`,
        status: 'fail',
        message: `质量评估失败: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }
  
  return results;
}

// ============ 缓存层验证 ============

async function validateCacheLayer(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // 清空缓存开始测试
  clearTranslationCache();
  
  // 测试1: 缓存未命中时的转译
  try {
    const testHtml = '<h2>缓存测试</h2><p>这是测试内容</p>';
    const startTime = performance.now();
    const result1 = translateHtmlToQuillCached(testHtml);
    const firstCallTime = performance.now() - startTime;
    
    results.push({
      layer: '缓存层',
      test: '缓存未命中转译',
      status: result1.includes('<h2>') ? 'pass' : 'fail',
      message: result1.includes('<h2>') ? '缓存未命中时转译成功' : '缓存未命中时转译失败',
      details: { result: result1, executionTime: firstCallTime },
      executionTime: firstCallTime
    });
    
    // 测试2: 缓存命中
    const startTime2 = performance.now();
    const result2 = translateHtmlToQuillCached(testHtml);
    const secondCallTime = performance.now() - startTime2;
    
    const cacheWorking = secondCallTime < firstCallTime && result1 === result2;
    
    results.push({
      layer: '缓存层',
      test: '缓存命中优化',
      status: cacheWorking ? 'pass' : 'warning',
      message: cacheWorking ? '缓存命中，性能提升' : '缓存可能未生效',
      details: { 
        firstCallTime, 
        secondCallTime, 
        speedup: `${((firstCallTime / secondCallTime) * 100).toFixed(1)}%`,
        resultMatch: result1 === result2 
      },
      executionTime: secondCallTime
    });
  } catch (error) {
    results.push({
      layer: '缓存层',
      test: '缓存功能测试',
      status: 'fail',
      message: `缓存测试失败: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  // 测试3: 缓存统计
  try {
    const stats = getCacheStats();
    
    results.push({
      layer: '缓存层',
      test: '缓存统计获取',
      status: typeof stats.hitRate === 'number' ? 'pass' : 'fail',
      message: typeof stats.hitRate === 'number' ? '缓存统计正常' : '缓存统计异常',
      details: stats
    });
  } catch (error) {
    results.push({
      layer: '缓存层',
      test: '缓存统计获取',
      status: 'fail',
      message: `缓存统计获取失败: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  return results;
}

// ============ 极端情况测试 ============

async function validateExtremeScenarios(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // 测试1: 超大内容处理
  try {
    const hugeContent = '<p>' + 'X'.repeat(100000) + '</p>';
    const startTime = performance.now();
    const result = getDisplayContent({
      id: 'huge-test',
      title: '超大内容测试',
      html_raw: hugeContent,
      text_plain: 'X'.repeat(100000)
    } as Clip);
    const executionTime = performance.now() - startTime;
    
    results.push({
      layer: '极端情况',
      test: '超大内容处理',
      status: executionTime < 5000 ? 'pass' : 'warning', // 5秒内完成
      message: executionTime < 5000 ? '超大内容处理性能良好' : '超大内容处理较慢',
      details: { contentSize: hugeContent.length, executionTime },
      executionTime
    });
  } catch (error) {
    results.push({
      layer: '极端情况',
      test: '超大内容处理',
      status: 'fail',
      message: `超大内容处理失败: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  // 测试2: 全空内容处理
  try {
    const startTime = performance.now();
    const result = getDisplayContent({
      id: 'empty-test',
      title: '',
      html_raw: '',
      text_plain: ''
    } as Clip);
    const executionTime = performance.now() - startTime;
    
    results.push({
      layer: '极端情况',
      test: '全空内容处理',
      status: result.length > 0 ? 'pass' : 'warning',
      message: result.length > 0 ? '全空内容有合理回退' : '全空内容可能显示空白',
      details: { result, executionTime },
      executionTime
    });
  } catch (error) {
    results.push({
      layer: '极端情况',
      test: '全空内容处理',
      status: 'fail',
      message: `全空内容处理失败: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  // 测试3: 恶意内容处理
  try {
    const maliciousContent = '<script>alert("XSS")</script><iframe src="javascript:alert(1)"></iframe><h2>正常内容</h2>';
    const startTime = performance.now();
    const result = getDisplayContent({
      id: 'malicious-test',
      title: '恶意内容测试',
      html_raw: maliciousContent,
      text_plain: '正常内容'
    } as Clip);
    const executionTime = performance.now() - startTime;
    
    const containsScript = result.includes('<script>') || result.includes('<iframe>');
    
    results.push({
      layer: '极端情况',
      test: '恶意内容处理',
      status: !containsScript ? 'pass' : 'fail',
      message: !containsScript ? '恶意内容已被清理' : '恶意内容未被完全清理',
      details: { result, containsScript, executionTime },
      executionTime
    });
  } catch (error) {
    results.push({
      layer: '极端情况',
      test: '恶意内容处理',
      status: 'warning',
      message: `恶意内容测试异常，回退到错误处理: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  return results;
}

// ============ 完整系统验证 ============

export async function validateSystemIntegrity(): Promise<SystemValidationReport> {
  const startTime = Date.now();
  
  console.log('🔍 开始系统完整性验证...');
  
  // 并行执行所有验证
  const [
    htmlResults,
    strategyResults, 
    cacheResults,
    extremeResults
  ] = await Promise.all([
    validateHtmlTranslationLayer(),
    validateContentStrategyLayer(),
    validateCacheLayer(),
    validateExtremeScenarios()
  ]);
  
  const allResults = [
    ...htmlResults,
    ...strategyResults,
    ...cacheResults, 
    ...extremeResults
  ];
  
  // 统计结果
  const totalTests = allResults.length;
  const passedTests = allResults.filter(r => r.status === 'pass').length;
  const failedTests = allResults.filter(r => r.status === 'fail').length;
  const warningTests = allResults.filter(r => r.status === 'warning').length;
  
  // 计算整体状态
  let overallStatus: 'healthy' | 'degraded' | 'critical';
  if (failedTests === 0 && warningTests <= totalTests * 0.1) {
    overallStatus = 'healthy';
  } else if (failedTests <= totalTests * 0.1) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'critical';
  }
  
  // 性能指标
  const translationTimes = allResults
    .filter(r => r.executionTime !== undefined)
    .map(r => r.executionTime!);
  const averageTranslationTime = translationTimes.length > 0 
    ? translationTimes.reduce((a, b) => a + b, 0) / translationTimes.length 
    : 0;
  
  const cacheStats = getCacheStats();
  
  const report: SystemValidationReport = {
    overallStatus,
    timestamp: new Date(),
    totalTests,
    passedTests,
    failedTests,
    warningTests,
    results: allResults,
    performanceMetrics: {
      averageTranslationTime,
      cacheHitRate: cacheStats.hitRate,
      memoryUsage: `${(cacheStats.cacheSize / 1024).toFixed(1)}KB`
    }
  };
  
  const endTime = Date.now();
  console.log(`✅ 系统验证完成，耗时 ${endTime - startTime}ms`);
  
  return report;
}

// ============ 报告生成器 ============

export function generateValidationReport(report: SystemValidationReport): string {
  const { overallStatus, totalTests, passedTests, failedTests, warningTests, results, performanceMetrics } = report;
  
  const statusEmoji = {
    'healthy': '🟢',
    'degraded': '🟡', 
    'critical': '🔴'
  };
  
  let output = `
# 📊 系统验证报告

## 🎯 总体状态
${statusEmoji[overallStatus]} **${overallStatus.toUpperCase()}** - ${new Date(report.timestamp).toLocaleString()}

## 📈 测试统计
- 🧪 **总测试数**: ${totalTests}
- ✅ **通过**: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)
- ⚠️ **警告**: ${warningTests} (${((warningTests/totalTests)*100).toFixed(1)}%)
- ❌ **失败**: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)

## ⚡ 性能指标
- 🕒 **平均转译时间**: ${performanceMetrics.averageTranslationTime.toFixed(2)}ms
- 💾 **缓存命中率**: ${(performanceMetrics.cacheHitRate * 100).toFixed(1)}%
- 🧠 **内存使用**: ${performanceMetrics.memoryUsage}

## 📋 详细结果

`;

  // 按层级分组显示结果
  const groupedResults = results.reduce((groups, result) => {
    if (!groups[result.layer]) {
      groups[result.layer] = [];
    }
    groups[result.layer].push(result);
    return groups;
  }, {} as Record<string, ValidationResult[]>);
  
  for (const [layer, layerResults] of Object.entries(groupedResults)) {
    output += `### ${layer}\n\n`;
    
    for (const result of layerResults) {
      const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      const timeInfo = result.executionTime ? ` (${result.executionTime.toFixed(2)}ms)` : '';
      
      output += `${statusIcon} **${result.test}**${timeInfo}\n`;
      output += `   ${result.message}\n\n`;
    }
  }
  
  return output;
}

// ============ 快速健康检查 ============

export async function quickHealthCheck(): Promise<{ healthy: boolean; message: string }> {
  try {
    // 快速测试核心功能
    const testHtml = '<h2>健康检查</h2><p>测试内容</p>';
    const translated = translateHtmlToQuill(testHtml);
    const cached = translateHtmlToQuillCached(testHtml);
    const displayContent = getDisplayContent({
      id: 'health-check',
      title: '健康检查',
      html_raw: testHtml,
      text_plain: '健康检查 测试内容'
    } as Clip);
    
    const allWorking = translated.includes('<h2>') && 
                      cached.includes('<h2>') && 
                      displayContent.includes('健康检查');
    
    return {
      healthy: allWorking,
      message: allWorking ? '系统运行正常' : '系统存在问题，建议运行完整验证'
    };
  } catch (error) {
    return {
      healthy: false,
      message: `健康检查失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
