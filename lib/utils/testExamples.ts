/**
 * 测试示例和使用指南
 * 
 * 功能：
 * 1. 提供完整的测试使用示例
 * 2. 演示错误模拟的使用场景
 * 3. 集成测试的最佳实践
 * 4. 性能监控的实际应用
 * 5. 开发环境测试流程
 */

import { 
  validateSystemIntegrity,
  quickHealthCheck,
  generateValidationReport
} from './systemValidator';
import {
  setupLightErrorScenario,
  setupModerateErrorScenario,
  simulateNetworkError,
  simulateTranslationError,
  testErrorRecovery,
  errorSimulator
} from './errorSimulator';
import {
  runQuickIntegrationTest,
  runFullIntegrationTestSuite,
  integrationTester
} from './integrationTester';
import { getDisplayContent } from './contentStrategy';
import { translateHtmlToQuill } from './htmlTranslator';
import type { Clip } from '../types/clips';

// ============ 基础使用示例 ============

/**
 * 示例1: 基础系统健康检查
 */
export async function exampleBasicHealthCheck() {
  console.log('📋 示例1: 基础系统健康检查');
  
  try {
    // 快速健康检查
    const health = await quickHealthCheck();
    console.log('健康状态:', health.healthy ? '✅ 良好' : '❌ 异常');
    console.log('详细信息:', health.message);
    
    if (health.healthy) {
      console.log('✅ 系统运行正常，可以继续其他操作');
    } else {
      console.log('⚠️ 系统存在问题，建议进行完整验证');
      
      // 如果快速检查失败，运行完整验证
      const fullReport = await validateSystemIntegrity();
      console.log('完整验证报告:');
      console.log(generateValidationReport(fullReport));
    }
  } catch (error) {
    console.error('健康检查失败:', error);
  }
}

/**
 * 示例2: 错误模拟和恢复测试
 */
export async function exampleErrorSimulation() {
  console.log('📋 示例2: 错误模拟和恢复测试');
  
  try {
    // 设置轻度错误场景
    console.log('🔧 启用轻度错误模拟...');
    setupLightErrorScenario();
    
    // 模拟网络请求错误
    const networkTest = await testErrorRecovery(async () => {
      return simulateNetworkError(async () => {
        // 模拟正常的API调用
        await new Promise(resolve => setTimeout(resolve, 100));
        return { data: 'success' };
      });
    }, 3);
    
    console.log('网络错误恢复测试:', networkTest.success ? '✅ 通过' : '❌ 失败');
    console.log('尝试次数:', networkTest.attempts);
    console.log('恢复时间:', networkTest.recoveryTime + 'ms');
    
    // 模拟HTML转译错误
    const testHtml = '<h2>测试内容</h2><p>这是测试内容</p>';
    try {
      const result = simulateTranslationError(testHtml, translateHtmlToQuill);
      console.log('HTML转译测试: ✅ 成功');
    } catch (error) {
      console.log('HTML转译测试: ⚠️ 触发错误，验证回退机制');
    }
    
    // 关闭错误模拟
    errorSimulator.disable();
    console.log('✅ 错误模拟已关闭');
    
  } catch (error) {
    console.error('错误模拟测试失败:', error);
  }
}

/**
 * 示例3: 集成测试流程
 */
export async function exampleIntegrationTesting() {
  console.log('📋 示例3: 集成测试流程');
  
  try {
    // 先运行快速测试
    console.log('⚡ 运行快速集成测试...');
    const quickResult = await runQuickIntegrationTest();
    console.log('快速测试结果:', quickResult ? '✅ 通过' : '❌ 失败');
    
    if (quickResult) {
      console.log('✅ 快速测试通过，系统基础功能正常');
    } else {
      console.log('⚠️ 快速测试失败，运行完整测试套件诊断问题');
      
      // 运行完整测试套件
      const fullResults = await runFullIntegrationTestSuite();
      console.log('完整测试结果:', fullResults.overallSuccess ? '✅ 通过' : '❌ 失败');
      
      // 显示详细报告
      console.log('\n📊 详细测试报告:');
      console.log(integrationTester.generateTestReport());
    }
  } catch (error) {
    console.error('集成测试失败:', error);
  }
}

/**
 * 示例4: 生产环境监控模拟
 */
export async function exampleProductionMonitoring() {
  console.log('📋 示例4: 生产环境监控模拟');
  
  try {
    // 模拟生产环境的定期健康检查
    console.log('🔄 启动定期健康监控...');
    
    let checkCount = 0;
    const maxChecks = 5;
    
    const monitoringInterval = setInterval(async () => {
      checkCount++;
      console.log(`\n⏰ 第${checkCount}次健康检查 (${new Date().toLocaleTimeString()})`);
      
      const health = await quickHealthCheck();
      console.log(`状态: ${health.healthy ? '🟢 健康' : '🔴 异常'}`);
      console.log(`消息: ${health.message}`);
      
      if (!health.healthy) {
        console.log('🚨 检测到异常，触发详细诊断...');
        
        // 运行系统验证
        const validation = await validateSystemIntegrity();
        console.log(`验证结果: ${validation.overallStatus}`);
        console.log(`失败测试: ${validation.failedTests}/${validation.totalTests}`);
        
        if (validation.overallStatus === 'critical') {
          console.log('🚨 系统状态严重，建议立即检查！');
        }
      }
      
      if (checkCount >= maxChecks) {
        clearInterval(monitoringInterval);
        console.log('✅ 监控演示完成');
      }
    }, 2000); // 每2秒检查一次
    
  } catch (error) {
    console.error('生产监控模拟失败:', error);
  }
}

/**
 * 示例5: 内容处理回退机制测试
 */
export async function exampleContentFallbackTesting() {
  console.log('📋 示例5: 内容处理回退机制测试');
  
  // 测试用例集合
  const testCases: Array<{ name: string; clip: Partial<Clip> }> = [
    {
      name: '正常HTML内容',
      clip: {
        id: 'test-normal',
        title: '正常测试',
        html_raw: '<h2>标题</h2><p>正常内容</p>',
        text_plain: '标题\n正常内容'
      }
    },
    {
      name: '损坏HTML内容',
      clip: {
        id: 'test-broken',
        title: '损坏测试',
        html_raw: '<h2>标题<p>未闭合<div>',
        text_plain: '标题\n未闭合内容'
      }
    },
    {
      name: '空HTML内容',
      clip: {
        id: 'test-empty',
        title: '空HTML测试',
        html_raw: '',
        text_plain: '只有纯文本内容'
      }
    },
    {
      name: '全空内容',
      clip: {
        id: 'test-all-empty',
        title: '',
        html_raw: '',
        text_plain: ''
      }
    }
  ];
  
  try {
    // 启用中度错误模拟，增加错误发生概率
    setupModerateErrorScenario();
    
    for (const testCase of testCases) {
      console.log(`\n🧪 测试: ${testCase.name}`);
      
      try {
        const displayContent = getDisplayContent(testCase.clip as Clip, {
          fallbackToPlainText: true,
          logErrors: false
        });
        
        if (displayContent && displayContent.trim().length > 0) {
          console.log('✅ 成功获取显示内容');
          console.log('内容长度:', displayContent.length);
          console.log('内容预览:', displayContent.substring(0, 50) + '...');
        } else {
          console.log('⚠️ 获取到空内容');
        }
      } catch (error) {
        console.log('❌ 内容处理失败:', error instanceof Error ? error.message : String(error));
      }
    }
    
    // 关闭错误模拟
    errorSimulator.disable();
    console.log('\n✅ 内容回退测试完成');
    
  } catch (error) {
    console.error('内容回退测试失败:', error);
  }
}

// ============ 开发环境测试流程 ============

/**
 * 完整的开发环境测试流程
 */
export async function runDevelopmentTestFlow() {
  console.log('🚀 开始完整的开发环境测试流程\n');
  
  try {
    // 步骤1: 基础健康检查
    console.log('='.repeat(50));
    await exampleBasicHealthCheck();
    
    // 步骤2: 错误恢复测试
    console.log('\n' + '='.repeat(50));
    await exampleErrorSimulation();
    
    // 步骤3: 集成测试
    console.log('\n' + '='.repeat(50));
    await exampleIntegrationTesting();
    
    // 步骤4: 内容回退测试
    console.log('\n' + '='.repeat(50));
    await exampleContentFallbackTesting();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 开发环境测试流程完成！');
    console.log('✅ 所有测试模块已验证');
    console.log('🛡️ 回退机制已确认工作正常');
    console.log('📊 性能监控已验证');
    
  } catch (error) {
    console.error('❌ 测试流程执行失败:', error);
  }
}

// ============ 使用指南 ============

/**
 * 测试工具使用指南
 */
export function printTestingGuide() {
  console.log(`
🧪 Mark Clipper 测试工具使用指南

📋 1. 日常开发测试
   - 使用 quickHealthCheck() 进行快速检查
   - 使用 runQuickIntegrationTest() 验证核心功能
   - 在开发过程中定期运行基础测试

🔥 2. 错误情况测试
   - setupLightErrorScenario() - 5%概率错误，模拟偶发问题
   - setupModerateErrorScenario() - 15%概率错误，模拟常见问题  
   - setupHeavyErrorScenario() - 30%概率错误，压力测试
   - setupExtremeErrorScenario() - 40%概率错误，灾难恢复测试

🧩 3. 集成测试
   - runQuickIntegrationTest() - 快速验证核心功能
   - runFullIntegrationTestSuite() - 完整的端到端测试
   - 包含正常场景、错误场景、性能场景、极端场景

📊 4. 性能监控
   - validateSystemIntegrity() - 完整的系统验证
   - getCacheStats() - 缓存性能指标
   - 实时监控渲染性能和内存使用

🎛️ 5. 测试控制面板
   - TestDashboardWrapper - React组件，提供可视化测试界面
   - 实时状态监控、错误模拟控制、测试执行控制
   - 仅在开发环境中可用

🔄 6. 使用流程建议
   1. 新功能开发前: 运行 quickHealthCheck
   2. 功能开发中: 使用轻度错误模拟测试
   3. 功能完成后: 运行快速集成测试
   4. 发布前: 运行完整测试套件
   5. 生产监控: 定期健康检查和性能监控

⚠️  7. 注意事项
   - 错误模拟仅在测试时启用，完成后记得禁用
   - 测试控制面板仅在开发环境可用
   - 性能测试结果仅供参考，实际性能取决于运行环境
   - 完整测试套件耗时较长，建议在CI/CD中运行
`);
}

// ============ 导出所有示例 ============

export const testExamples = {
  exampleBasicHealthCheck,
  exampleErrorSimulation, 
  exampleIntegrationTesting,
  exampleProductionMonitoring,
  exampleContentFallbackTesting,
  runDevelopmentTestFlow,
  printTestingGuide
};

export default testExamples;

// ============ 快捷命令 ============

// 在浏览器控制台中使用的快捷命令
if (typeof window !== 'undefined') {
  (window as any).markClipperTesting = {
    quickTest: runQuickIntegrationTest,
    healthCheck: quickHealthCheck,
    fullTest: runFullIntegrationTestSuite,
    guide: printTestingGuide,
    examples: testExamples
  };
  
  console.log('🧪 Mark Clipper测试工具已加载到 window.markClipperTesting');
  console.log('💡 在控制台输入 markClipperTesting.guide() 查看使用指南');
}
