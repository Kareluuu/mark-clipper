/**
 * 性能监控模块
 * 监控组件层按需转译的性能表现
 */

import { getCacheStats } from './contentCache';

// =============================================================================
// 性能监控接口
// =============================================================================

interface PerformanceMetrics {
  componentRenders: number;
  translationCalls: number;
  cacheHitRate: number;
  averageTranslationTime: number;
  memoryUsage: number;
  lastUpdated: Date;
}

interface ComponentMetrics {
  name: string;
  renderCount: number;
  translationCount: number;
  totalTranslationTime: number;
  lastRenderTime: number;
}

// =============================================================================
// 性能监控器
// =============================================================================

class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private globalMetrics: PerformanceMetrics = {
    componentRenders: 0,
    translationCalls: 0,
    cacheHitRate: 0,
    averageTranslationTime: 0,
    memoryUsage: 0,
    lastUpdated: new Date()
  };

  /**
   * 记录组件渲染
   */
  recordComponentRender(componentName: string): void {
    const existing = this.metrics.get(componentName) || {
      name: componentName,
      renderCount: 0,
      translationCount: 0,
      totalTranslationTime: 0,
      lastRenderTime: 0
    };

    existing.renderCount++;
    existing.lastRenderTime = Date.now();
    
    this.metrics.set(componentName, existing);
    this.globalMetrics.componentRenders++;
    this.updateGlobalMetrics();
  }

  /**
   * 记录转译操作
   */
  recordTranslation(componentName: string, translationTime: number): void {
    const existing = this.metrics.get(componentName) || {
      name: componentName,
      renderCount: 0,
      translationCount: 0,
      totalTranslationTime: 0,
      lastRenderTime: 0
    };

    existing.translationCount++;
    existing.totalTranslationTime += translationTime;
    
    this.metrics.set(componentName, existing);
    this.globalMetrics.translationCalls++;
    this.updateGlobalMetrics();
  }

  /**
   * 更新全局指标
   */
  private updateGlobalMetrics(): void {
    const cacheStats = getCacheStats();
    
    this.globalMetrics.cacheHitRate = cacheStats.hitRate;
    this.globalMetrics.memoryUsage = cacheStats.totalMemory;
    
    // 计算平均转译时间
    let totalTime = 0;
    let totalCalls = 0;
    
    this.metrics.forEach(metric => {
      totalTime += metric.totalTranslationTime;
      totalCalls += metric.translationCount;
    });
    
    this.globalMetrics.averageTranslationTime = 
      totalCalls > 0 ? totalTime / totalCalls : 0;
    
    this.globalMetrics.lastUpdated = new Date();
  }

  /**
   * 获取全局性能指标
   */
  getGlobalMetrics(): PerformanceMetrics {
    this.updateGlobalMetrics();
    return { ...this.globalMetrics };
  }

  /**
   * 获取组件性能指标
   */
  getComponentMetrics(componentName?: string): ComponentMetrics[] {
    if (componentName) {
      const metric = this.metrics.get(componentName);
      return metric ? [metric] : [];
    }
    
    return Array.from(this.metrics.values())
      .sort((a, b) => b.renderCount - a.renderCount);
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    summary: PerformanceMetrics;
    components: ComponentMetrics[];
    recommendations: string[];
  } {
    const summary = this.getGlobalMetrics();
    const components = this.getComponentMetrics();
    const recommendations: string[] = [];

    // 生成性能建议
    if (summary.cacheHitRate < 0.7) {
      recommendations.push('缓存命中率较低，考虑增加缓存大小或优化缓存策略');
    }

    if (summary.averageTranslationTime > 10) {
      recommendations.push('平均转译时间较长，考虑优化HTML转译算法');
    }

    if (summary.memoryUsage > 1024 * 1024) { // 1MB
      recommendations.push('内存使用量较高，考虑减少缓存大小或增加清理频率');
    }

    const totalRenders = components.reduce((sum, c) => sum + c.renderCount, 0);
    const totalTranslations = components.reduce((sum, c) => sum + c.translationCount, 0);
    
    if (totalTranslations / totalRenders > 0.5) {
      recommendations.push('转译调用比例较高，检查useMemo依赖是否正确');
    }

    return {
      summary,
      components,
      recommendations
    };
  }

  /**
   * 重置所有指标
   */
  reset(): void {
    this.metrics.clear();
    this.globalMetrics = {
      componentRenders: 0,
      translationCalls: 0,
      cacheHitRate: 0,
      averageTranslationTime: 0,
      memoryUsage: 0,
      lastUpdated: new Date()
    };
  }

  /**
   * 导出数据用于分析
   */
  exportData(): {
    globalMetrics: PerformanceMetrics;
    componentMetrics: ComponentMetrics[];
    cacheStats: ReturnType<typeof getCacheStats>;
    timestamp: string;
  } {
    return {
      globalMetrics: this.getGlobalMetrics(),
      componentMetrics: this.getComponentMetrics(),
      cacheStats: getCacheStats(),
      timestamp: new Date().toISOString()
    };
  }
}

// =============================================================================
// 性能监控Hook和工具函数
// =============================================================================

// 全局监控器实例
const globalMonitor = new PerformanceMonitor();

/**
 * 用于组件的性能监控Hook
 */
export function usePerformanceMonitor(componentName: string) {
  // 记录组件渲染
  React.useEffect(() => {
    globalMonitor.recordComponentRender(componentName);
  });

  // 返回记录转译的函数
  const recordTranslation = React.useCallback((translationTime: number) => {
    globalMonitor.recordTranslation(componentName, translationTime);
  }, [componentName]);

  return { recordTranslation };
}

/**
 * 高阶组件：为组件添加性能监控
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const MonitoredComponent = React.forwardRef<any, P>((props, ref) => {
    const startTime = React.useRef<number>(0);
    
    // 记录渲染开始
    React.useLayoutEffect(() => {
      startTime.current = performance.now();
      globalMonitor.recordComponentRender(componentName);
    });

    return <WrappedComponent ref={ref} {...props} />;
  });

  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return MonitoredComponent;
}

/**
 * 装饰器：为转译函数添加性能监控
 */
export function withTranslationTiming(
  translationFn: (html: string) => string,
  componentName: string
) {
  return (html: string): string => {
    const startTime = performance.now();
    
    try {
      const result = translationFn(html);
      const duration = performance.now() - startTime;
      globalMonitor.recordTranslation(componentName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      globalMonitor.recordTranslation(componentName, duration);
      throw error;
    }
  };
}

/**
 * 获取性能报告
 */
export function getPerformanceReport() {
  return globalMonitor.getPerformanceReport();
}

/**
 * 重置性能监控数据
 */
export function resetPerformanceMonitor() {
  globalMonitor.reset();
}

/**
 * 导出性能数据
 */
export function exportPerformanceData() {
  return globalMonitor.exportData();
}

/**
 * 在开发环境中输出性能报告
 */
export function logPerformanceReport() {
  if (process.env.NODE_ENV === 'development') {
    const report = globalMonitor.getPerformanceReport();
    
    console.group('🚀 组件层转译性能报告');
    console.log('📊 全局指标:', report.summary);
    console.log('🏗️ 组件指标:', report.components);
    if (report.recommendations.length > 0) {
      console.log('💡 优化建议:', report.recommendations);
    }
    console.groupEnd();
  }
}

// 在开发环境中定期输出性能报告
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 每30秒输出一次性能报告
  setInterval(logPerformanceReport, 30 * 1000);
}

// React import for hooks
import React from 'react';

export default globalMonitor;
