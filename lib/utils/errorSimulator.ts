/**
 * 错误模拟器 - 模拟各种错误情况来测试回退机制
 * 
 * 功能：
 * 1. 模拟网络错误
 * 2. 模拟数据损坏
 * 3. 模拟内存不足
 * 4. 模拟转译失败
 * 5. 模拟缓存失效
 */

import type { Clip } from '../types/clips';

// ============ 错误类型定义 ============

export type ErrorScenario = 
  | 'network_timeout'
  | 'network_offline' 
  | 'auth_expired'
  | 'data_corrupted'
  | 'html_malformed'
  | 'memory_overflow'
  | 'cache_failure'
  | 'translation_error'
  | 'database_connection'
  | 'rate_limit_exceeded';

export interface ErrorSimulationConfig {
  scenario: ErrorScenario;
  probability: number; // 0-1之间，错误发生概率
  delay?: number; // 模拟延迟(ms)
  customMessage?: string;
  duration?: number; // 错误持续时间(ms)
}

export interface SimulationResult {
  scenario: ErrorScenario;
  triggered: boolean;
  timestamp: Date;
  message: string;
  recoveryTime?: number;
}

// ============ 错误模拟器类 ============

class ErrorSimulator {
  private activeSimulations: Map<ErrorScenario, ErrorSimulationConfig> = new Map();
  private simulationHistory: SimulationResult[] = [];
  private isEnabled: boolean = false;

  /**
   * 启用错误模拟
   */
  enable(): void {
    this.isEnabled = true;
    console.log('🔧 错误模拟器已启用');
  }

  /**
   * 禁用错误模拟
   */
  disable(): void {
    this.isEnabled = false;
    this.activeSimulations.clear();
    console.log('✅ 错误模拟器已禁用');
  }

  /**
   * 添加错误模拟配置
   */
  addSimulation(config: ErrorSimulationConfig): void {
    if (!this.isEnabled) return;
    
    this.activeSimulations.set(config.scenario, config);
    console.log(`📝 已添加错误模拟: ${config.scenario} (概率: ${config.probability * 100}%)`);
  }

  /**
   * 移除错误模拟
   */
  removeSimulation(scenario: ErrorScenario): void {
    this.activeSimulations.delete(scenario);
    console.log(`🗑️ 已移除错误模拟: ${scenario}`);
  }

  /**
   * 检查是否应该触发错误
   */
  shouldTriggerError(scenario: ErrorScenario): SimulationResult | null {
    if (!this.isEnabled) return null;
    
    const config = this.activeSimulations.get(scenario);
    if (!config) return null;

    const triggered = Math.random() < config.probability;
    
    const result: SimulationResult = {
      scenario,
      triggered,
      timestamp: new Date(),
      message: triggered 
        ? (config.customMessage || this.getDefaultErrorMessage(scenario))
        : `模拟检查：${scenario} 未触发`
    };

    this.simulationHistory.push(result);
    
    if (triggered) {
      console.warn(`🚨 触发错误模拟: ${scenario} - ${result.message}`);
    }

    return result;
  }

  /**
   * 模拟网络延迟
   */
  async simulateNetworkDelay(scenario: ErrorScenario): Promise<void> {
    const config = this.activeSimulations.get(scenario);
    if (config?.delay) {
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }
  }

  /**
   * 获取模拟历史
   */
  getSimulationHistory(): SimulationResult[] {
    return [...this.simulationHistory];
  }

  /**
   * 清除模拟历史
   */
  clearHistory(): void {
    this.simulationHistory = [];
    console.log('🧹 已清除错误模拟历史');
  }

  /**
   * 获取默认错误消息
   */
  private getDefaultErrorMessage(scenario: ErrorScenario): string {
    const messages = {
      'network_timeout': '网络请求超时',
      'network_offline': '网络连接断开',
      'auth_expired': '认证令牌已过期',
      'data_corrupted': '数据已损坏',
      'html_malformed': 'HTML格式错误',
      'memory_overflow': '内存不足',
      'cache_failure': '缓存服务失效',
      'translation_error': 'HTML转译失败',
      'database_connection': '数据库连接失败',
      'rate_limit_exceeded': '请求频率超限'
    };
    
    return messages[scenario] || '未知错误';
  }
}

// 单例实例
const errorSimulator = new ErrorSimulator();

// ============ 模拟错误的包装函数 ============

/**
 * 模拟网络请求错误
 */
export async function simulateNetworkError<T>(
  operation: () => Promise<T>,
  scenario: ErrorScenario = 'network_timeout'
): Promise<T> {
  const simulation = errorSimulator.shouldTriggerError(scenario);
  
  if (simulation?.triggered) {
    await errorSimulator.simulateNetworkDelay(scenario);
    throw new Error(simulation.message);
  }
  
  return operation();
}

/**
 * 模拟HTML转译错误
 */
export function simulateTranslationError(
  html: string,
  operation: (html: string) => string
): string {
  const simulation = errorSimulator.shouldTriggerError('translation_error');
  
  if (simulation?.triggered) {
    throw new Error(simulation.message);
  }
  
  // 模拟HTML损坏
  const htmlCorruption = errorSimulator.shouldTriggerError('html_malformed');
  if (htmlCorruption?.triggered) {
    // 故意损坏HTML来测试回退
    const corruptedHtml = html.replace(/<\//g, '<').substring(0, html.length / 2);
    return operation(corruptedHtml);
  }
  
  return operation(html);
}

/**
 * 模拟缓存错误
 */
export function simulateCacheError<T>(
  operation: () => T,
  fallback: () => T
): T {
  const simulation = errorSimulator.shouldTriggerError('cache_failure');
  
  if (simulation?.triggered) {
    console.warn('💾 缓存失效，使用回退方案');
    return fallback();
  }
  
  return operation();
}

/**
 * 模拟数据损坏
 */
export function simulateDataCorruption(clip: Clip): Clip {
  const simulation = errorSimulator.shouldTriggerError('data_corrupted');
  
  if (simulation?.triggered) {
    // 模拟数据损坏情况
    return {
      ...clip,
      html_raw: Math.random() > 0.5 ? '' : clip.html_raw?.substring(0, 10) + '...corrupted...',
      text_plain: Math.random() > 0.5 ? '' : clip.text_plain?.substring(0, 10) + '...corrupted...'
    };
  }
  
  return clip;
}

// ============ 预设错误场景 ============

/**
 * 轻度错误场景 - 偶发网络问题
 */
export function setupLightErrorScenario(): void {
  errorSimulator.enable();
  errorSimulator.addSimulation({
    scenario: 'network_timeout',
    probability: 0.05, // 5%概率
    delay: 2000
  });
  errorSimulator.addSimulation({
    scenario: 'cache_failure',
    probability: 0.02, // 2%概率
  });
}

/**
 * 中度错误场景 - 常见问题
 */
export function setupModerateErrorScenario(): void {
  errorSimulator.enable();
  errorSimulator.addSimulation({
    scenario: 'network_timeout',
    probability: 0.15, // 15%概率
    delay: 3000
  });
  errorSimulator.addSimulation({
    scenario: 'html_malformed',
    probability: 0.1, // 10%概率
  });
  errorSimulator.addSimulation({
    scenario: 'translation_error',
    probability: 0.05, // 5%概率
  });
  errorSimulator.addSimulation({
    scenario: 'cache_failure',
    probability: 0.08, // 8%概率
  });
}

/**
 * 重度错误场景 - 压力测试
 */
export function setupHeavyErrorScenario(): void {
  errorSimulator.enable();
  errorSimulator.addSimulation({
    scenario: 'network_offline',
    probability: 0.3, // 30%概率
    delay: 5000
  });
  errorSimulator.addSimulation({
    scenario: 'data_corrupted',
    probability: 0.2, // 20%概率
  });
  errorSimulator.addSimulation({
    scenario: 'auth_expired',
    probability: 0.15, // 15%概率
  });
  errorSimulator.addSimulation({
    scenario: 'translation_error',
    probability: 0.25, // 25%概率
  });
  errorSimulator.addSimulation({
    scenario: 'memory_overflow',
    probability: 0.1, // 10%概率
  });
}

/**
 * 极端错误场景 - 灾难恢复测试
 */
export function setupExtremeErrorScenario(): void {
  errorSimulator.enable();
  
  // 所有主要错误都有较高概率
  const scenarios: ErrorScenario[] = [
    'network_offline',
    'data_corrupted', 
    'auth_expired',
    'translation_error',
    'cache_failure',
    'html_malformed',
    'memory_overflow'
  ];
  
  scenarios.forEach(scenario => {
    errorSimulator.addSimulation({
      scenario,
      probability: 0.4, // 40%概率
      delay: Math.random() * 3000 + 1000 // 1-4秒延迟
    });
  });
}

// ============ 错误恢复测试 ============

/**
 * 测试错误恢复能力
 */
export async function testErrorRecovery(
  testFunction: () => Promise<unknown>,
  maxRetries: number = 3
): Promise<{
  success: boolean;
  attempts: number;
  errors: string[];
  recoveryTime: number;
}> {
  const startTime = Date.now();
  const errors: string[] = [];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await testFunction();
      return {
        success: true,
        attempts: attempt,
        errors,
        recoveryTime: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`尝试 ${attempt}: ${errorMessage}`);
      
      if (attempt < maxRetries) {
        // 指数退避重试
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return {
    success: false,
    attempts: maxRetries,
    errors,
    recoveryTime: Date.now() - startTime
  };
}

// ============ 导出 ============

export {
  errorSimulator,
  ErrorSimulator
};

// ============ 使用示例 ============

/*
// 启用轻度错误模拟
setupLightErrorScenario();

// 测试网络请求错误恢复
await simulateNetworkError(async () => {
  const response = await fetch('/api/clips');
  return response.json();
});

// 测试HTML转译错误恢复
const result = simulateTranslationError(htmlContent, translateHtmlToQuill);

// 测试缓存错误恢复
const cached = simulateCacheError(
  () => cache.get(key),
  () => expensiveOperation()
);

// 关闭错误模拟
errorSimulator.disable();
*/
