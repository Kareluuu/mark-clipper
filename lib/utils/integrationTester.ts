/**
 * 集成测试器 - 端到端测试整个系统的集成
 * 
 * 功能：
 * 1. 端到端数据流测试
 * 2. 用户场景模拟
 * 3. 性能压力测试
 * 4. 并发处理测试
 * 5. 回退机制集成测试
 */

import { validateSystemIntegrity, quickHealthCheck } from './systemValidator';
import { 
  setupLightErrorScenario, 
  setupModerateErrorScenario, 
  setupHeavyErrorScenario,
  testErrorRecovery,
  errorSimulator
} from './errorSimulator';
import { getDisplayContent, getEditContent, batchGetDisplayContent } from './contentStrategy';
import { translateHtmlToQuillCached, getCacheStats, clearTranslationCache } from './contentCache';
import { analyzeContentMetrics, determineRenderStrategy } from './contentOptimization';
import type { Clip } from '../types/clips';

// ============ 测试场景定义 ============

export interface TestScenario {
  name: string;
  description: string;
  clips: Partial<Clip>[];
  expectedBehavior: string;
  performanceThreshold?: {
    maxTime: number; // 最大执行时间(ms)
    maxMemory?: number; // 最大内存使用(MB)
    minCacheHitRate?: number; // 最小缓存命中率
  };
}

export interface IntegrationTestResult {
  scenario: string;
  success: boolean;
  executionTime: number;
  memoryUsage?: number;
  cacheHitRate?: number;
  details: {
    totalClips: number;
    processedClips: number;
    failedClips: number;
    averageProcessingTime: number;
    errors: string[];
  };
  performanceMetrics: {
    translationTime: number;
    cacheOperations: number;
    fallbackOperations: number;
  };
}

// ============ 测试场景数据 ============

const TEST_SCENARIOS: TestScenario[] = [
  {
    name: '正常用户场景',
    description: '用户正常浏览和编辑内容',
    clips: [
      {
        id: 'normal-1',
        title: '技术文章',
        html_raw: '<h2>React最佳实践</h2><p>这是一篇关于React的技术文章。</p><ul><li>使用Hooks</li><li>组件优化</li></ul>',
        text_plain: 'React最佳实践\n这是一篇关于React的技术文章。\n• 使用Hooks\n• 组件优化'
      },
      {
        id: 'normal-2', 
        title: '产品文档',
        html_raw: '<h2>用户指南</h2><p>详细的用户操作指南。</p><blockquote>重要提示：请仔细阅读</blockquote>',
        text_plain: '用户指南\n详细的用户操作指南。\n重要提示：请仔细阅读'
      }
    ],
    expectedBehavior: '所有内容正常显示，转译成功，缓存生效',
    performanceThreshold: {
      maxTime: 1000,
      minCacheHitRate: 0.5
    }
  },
  
  {
    name: '数据质量问题场景',
    description: '处理损坏或不完整的数据',
    clips: [
      {
        id: 'corrupted-1',
        title: '损坏的HTML',
        html_raw: '<h2>标题<p>未闭合<div><span>嵌套错误',
        text_plain: '标题\n未闭合\n嵌套错误'
      },
      {
        id: 'empty-1',
        title: '空内容',
        html_raw: '',
        text_plain: ''
      },
      {
        id: 'partial-1',
        title: '部分数据',
        html_raw: '',
        text_plain: '只有纯文本内容'
      }
    ],
    expectedBehavior: '使用回退机制，确保用户始终能看到内容',
    performanceThreshold: {
      maxTime: 2000
    }
  },
  
  {
    name: '高负载场景',
    description: '大量内容同时处理',
    clips: Array.from({ length: 50 }, (_, i) => ({
      id: `load-${i}`,
      title: `大量内容测试 ${i}`,
      html_raw: '<h2>标题 ' + i + '</h2>' + '<p>' + 'X'.repeat(1000) + '</p>',
      text_plain: `标题 ${i}\n` + 'X'.repeat(1000)
    })),
    expectedBehavior: '高效处理大量内容，缓存优化生效',
    performanceThreshold: {
      maxTime: 5000,
      minCacheHitRate: 0.8
    }
  },
  
  {
    name: '极端内容场景',
    description: '处理极大或特殊内容',
    clips: [
      {
        id: 'huge-1',
        title: '超大内容',
        html_raw: '<p>' + 'A'.repeat(100000) + '</p>',
        text_plain: 'A'.repeat(100000)
      },
      {
        id: 'special-1',
        title: '特殊字符',
        html_raw: '<p>🌟🚀💡 特殊字符 & HTML实体 &lt;&gt;&amp; 中文测试</p>',
        text_plain: '🌟🚀💡 特殊字符 & HTML实体 <>& 中文测试'
      },
      {
        id: 'malicious-1',
        title: '恶意内容',
        html_raw: '<script>alert("XSS")</script><h2>正常内容</h2><iframe src="javascript:alert(1)"></iframe>',
        text_plain: '正常内容'
      }
    ],
    expectedBehavior: '安全处理特殊内容，性能在可接受范围',
    performanceThreshold: {
      maxTime: 10000
    }
  }
];

// ============ 集成测试执行器 ============

class IntegrationTester {
  private testResults: IntegrationTestResult[] = [];
  
  /**
   * 运行单个测试场景
   */
  async runScenario(scenario: TestScenario): Promise<IntegrationTestResult> {
    console.log(`🧪 开始测试场景: ${scenario.name}`);
    
    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();
    
    // 清空缓存确保测试公平性
    clearTranslationCache();
    
    const result: IntegrationTestResult = {
      scenario: scenario.name,
      success: false,
      executionTime: 0,
      details: {
        totalClips: scenario.clips.length,
        processedClips: 0,
        failedClips: 0,
        averageProcessingTime: 0,
        errors: []
      },
      performanceMetrics: {
        translationTime: 0,
        cacheOperations: 0,
        fallbackOperations: 0
      }
    };
    
    try {
      // 批量处理内容
      const processingTimes: number[] = [];
      
      for (const clip of scenario.clips) {
        try {
          const clipStartTime = Date.now();
          
          // 测试显示内容获取
          const displayContent = getDisplayContent(clip as Clip, {
            fallbackToPlainText: true,
            logErrors: false
          });
          
          // 测试编辑内容获取
          const editContent = getEditContent(clip as Clip);
          
          // 测试内容分析
          const metrics = analyzeContentMetrics(clip as Clip);
          const strategy = determineRenderStrategy(metrics);
          
          const clipTime = Date.now() - clipStartTime;
          processingTimes.push(clipTime);
          
          if (displayContent || editContent) {
            result.details.processedClips++;
          } else {
            result.details.failedClips++;
            result.details.errors.push(`Clip ${clip.id}: 无法获取任何内容`);
          }
          
        } catch (error) {
          result.details.failedClips++;
          result.details.errors.push(
            `Clip ${clip.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
      
      // 计算平均处理时间
      result.details.averageProcessingTime = processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0;
      
      // 获取缓存统计
      const cacheStats = getCacheStats();
      result.cacheHitRate = cacheStats.hitRate;
      result.performanceMetrics.cacheOperations = cacheStats.operations;
      
      // 计算总执行时间
      result.executionTime = Date.now() - startTime;
      result.memoryUsage = this.getMemoryUsage() - startMemory;
      
      // 评估成功条件
      const successConditions = [
        result.details.processedClips > 0, // 至少处理了一些内容
        result.details.failedClips < result.details.totalClips * 0.5, // 失败率小于50%
        !scenario.performanceThreshold?.maxTime || result.executionTime <= scenario.performanceThreshold.maxTime,
        !scenario.performanceThreshold?.minCacheHitRate || result.cacheHitRate >= scenario.performanceThreshold.minCacheHitRate
      ];
      
      result.success = successConditions.every(condition => condition);
      
      console.log(`${result.success ? '✅' : '❌'} 场景完成: ${scenario.name} (${result.executionTime}ms)`);
      
    } catch (error) {
      result.details.errors.push(`场景执行错误: ${error instanceof Error ? error.message : String(error)}`);
      result.executionTime = Date.now() - startTime;
      console.error(`❌ 场景失败: ${scenario.name}`, error);
    }
    
    this.testResults.push(result);
    return result;
  }
  
  /**
   * 运行所有测试场景
   */
  async runAllScenarios(): Promise<IntegrationTestResult[]> {
    console.log('🚀 开始运行所有集成测试场景...');
    
    const results: IntegrationTestResult[] = [];
    
    for (const scenario of TEST_SCENARIOS) {
      const result = await this.runScenario(scenario);
      results.push(result);
      
      // 场景间短暂停顿，避免资源竞争
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
  
  /**
   * 错误恢复能力测试
   */
  async testErrorRecoveryCapability(): Promise<{
    lightErrors: any;
    moderateErrors: any;
    heavyErrors: any;
  }> {
    console.log('🔥 开始错误恢复能力测试...');
    
    // 轻度错误测试
    setupLightErrorScenario();
    const lightErrors = await testErrorRecovery(async () => {
      const testClip: Clip = {
        id: 'error-test-1',
        title: '错误恢复测试',
        html_raw: '<h2>测试内容</h2><p>用于测试错误恢复</p>',
        text_plain: '测试内容\n用于测试错误恢复',
        created_at: new Date().toISOString(),
        url: 'test-url',
        theme_name: 'default'
      };
      
      const result = getDisplayContent(testClip);
      if (!result) throw new Error('内容获取失败');
    });
    
    // 中度错误测试
    setupModerateErrorScenario();
    const moderateErrors = await testErrorRecovery(async () => {
      const batchResult = batchGetDisplayContent([
        {
          id: 'batch-1',
          title: '批量测试1',
          html_raw: '<p>内容1</p>',
          text_plain: '内容1'
        },
        {
          id: 'batch-2', 
          title: '批量测试2',
          html_raw: '<p>内容2</p>',
          text_plain: '内容2'
        }
      ] as Clip[]);
      
      if (batchResult.length === 0) throw new Error('批量处理失败');
    });
    
    // 重度错误测试
    setupHeavyErrorScenario();
    const heavyErrors = await testErrorRecovery(async () => {
      const healthCheck = await quickHealthCheck();
      if (!healthCheck.healthy) throw new Error(healthCheck.message);
    });
    
    // 恢复正常模式
    errorSimulator.disable();
    
    return { lightErrors, moderateErrors, heavyErrors };
  }
  
  /**
   * 并发压力测试
   */
  async testConcurrentLoad(concurrentUsers: number = 10, operationsPerUser: number = 5): Promise<{
    totalOperations: number;
    successfulOperations: number;
    averageResponseTime: number;
    errors: string[];
  }> {
    console.log(`⚡ 开始并发压力测试: ${concurrentUsers} 用户, 每用户 ${operationsPerUser} 操作`);
    
    const totalOperations = concurrentUsers * operationsPerUser;
    const errors: string[] = [];
    const responseTimes: number[] = [];
    let successfulOperations = 0;
    
    // 创建并发操作
    const concurrentOperations = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
      for (let opIndex = 0; opIndex < operationsPerUser; opIndex++) {
        try {
          const startTime = Date.now();
          
          // 模拟用户操作
          const testClip: Clip = {
            id: `concurrent-${userIndex}-${opIndex}`,
            title: `并发测试 用户${userIndex} 操作${opIndex}`,
            html_raw: `<h2>用户${userIndex}</h2><p>操作${opIndex}的内容</p>`,
            text_plain: `用户${userIndex}\n操作${opIndex}的内容`,
            created_at: new Date().toISOString(),
            url: 'concurrent-test',
            theme_name: 'default'
          };
          
          // 执行内容处理操作
          const displayContent = getDisplayContent(testClip);
          const editContent = getEditContent(testClip);
          const metrics = analyzeContentMetrics(testClip);
          
          const responseTime = Date.now() - startTime;
          responseTimes.push(responseTime);
          successfulOperations++;
          
        } catch (error) {
          errors.push(`用户${userIndex}操作${opIndex}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    });
    
    // 等待所有并发操作完成
    await Promise.all(concurrentOperations);
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
    
    return {
      totalOperations,
      successfulOperations,
      averageResponseTime,
      errors
    };
  }
  
  /**
   * 获取内存使用情况（简化版）
   */
  private getMemoryUsage(): number {
    // 在浏览器环境中，这是一个简化的内存估算
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
  
  /**
   * 生成测试报告
   */
  generateTestReport(): string {
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    
    let report = `
# 🧪 集成测试报告

## 📊 总体结果
- 🎯 **总测试场景**: ${totalTests}
- ✅ **成功**: ${successfulTests} (${((successfulTests/totalTests)*100).toFixed(1)}%)
- ❌ **失败**: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)

## 📋 详细结果

`;

    for (const result of this.testResults) {
      const statusIcon = result.success ? '✅' : '❌';
      
      report += `### ${statusIcon} ${result.scenario}\n`;
      report += `- **执行时间**: ${result.executionTime}ms\n`;
      report += `- **处理内容**: ${result.details.processedClips}/${result.details.totalClips}\n`;
      report += `- **失败内容**: ${result.details.failedClips}\n`;
      report += `- **平均处理时间**: ${result.details.averageProcessingTime.toFixed(2)}ms\n`;
      
      if (result.cacheHitRate !== undefined) {
        report += `- **缓存命中率**: ${(result.cacheHitRate * 100).toFixed(1)}%\n`;
      }
      
      if (result.details.errors.length > 0) {
        report += `- **错误详情**:\n`;
        result.details.errors.forEach(error => {
          report += `  - ${error}\n`;
        });
      }
      
      report += '\n';
    }
    
    return report;
  }
  
  /**
   * 清除测试结果
   */
  clearResults(): void {
    this.testResults = [];
  }
}

// ============ 导出 ============

export const integrationTester = new IntegrationTester();

export {
  IntegrationTester,
  TEST_SCENARIOS
};

// ============ 快速测试接口 ============

/**
 * 运行快速集成测试
 */
export async function runQuickIntegrationTest(): Promise<boolean> {
  console.log('⚡ 运行快速集成测试...');
  
  try {
    // 系统健康检查
    const healthCheck = await quickHealthCheck();
    if (!healthCheck.healthy) {
      console.error('❌ 系统健康检查失败:', healthCheck.message);
      return false;
    }
    
    // 运行基本场景测试
    const basicScenario = TEST_SCENARIOS[0]; // 正常用户场景
    const result = await integrationTester.runScenario(basicScenario);
    
    console.log(`${result.success ? '✅' : '❌'} 快速集成测试完成`);
    return result.success;
  } catch (error) {
    console.error('❌ 快速集成测试失败:', error);
    return false;
  }
}

/**
 * 运行完整集成测试套件
 */
export async function runFullIntegrationTestSuite(): Promise<{
  scenarioResults: IntegrationTestResult[];
  errorRecoveryResults: any;
  concurrentLoadResults: any;
  overallSuccess: boolean;
}> {
  console.log('🚀 运行完整集成测试套件...');
  
  // 运行所有场景测试
  const scenarioResults = await integrationTester.runAllScenarios();
  
  // 运行错误恢复测试
  const errorRecoveryResults = await integrationTester.testErrorRecoveryCapability();
  
  // 运行并发压力测试
  const concurrentLoadResults = await integrationTester.testConcurrentLoad(5, 3);
  
  // 评估整体成功率
  const successfulScenarios = scenarioResults.filter(r => r.success).length;
  const overallSuccess = successfulScenarios >= scenarioResults.length * 0.8; // 80%成功率
  
  console.log(`🏁 完整测试套件完成, 整体状态: ${overallSuccess ? '✅ 通过' : '❌ 未通过'}`);
  
  return {
    scenarioResults,
    errorRecoveryResults,
    concurrentLoadResults,
    overallSuccess
  };
}
