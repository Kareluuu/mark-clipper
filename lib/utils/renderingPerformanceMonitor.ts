/**
 * 渲染性能监控器
 * 专门监控长内容列表的渲染性能
 */

import { analyzeContentMetrics, measureRenderPerformance } from './contentOptimization';
import type { Clip } from '../types/clips';

// =============================================================================
// 性能监控接口
// =============================================================================

export interface RenderingMetrics {
  totalRenderTime: number;
  averageRenderTime: number;
  slowestRender: number;
  fastestRender: number;
  totalDOMNodes: number;
  memoryUsage: number;
  optimizationRate: number;
  lastUpdated: Date;
}

export interface ComponentRenderData {
  componentId: string;
  contentLength: number;
  renderTime: number;
  domNodes: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'extreme';
  isOptimized: boolean;
  timestamp: Date;
}

// =============================================================================
// 渲染性能监控器
// =============================================================================

class RenderingPerformanceMonitor {
  private renderData: Map<string, ComponentRenderData[]> = new Map();
  private globalMetrics: RenderingMetrics = {
    totalRenderTime: 0,
    averageRenderTime: 0,
    slowestRender: 0,
    fastestRender: Infinity,
    totalDOMNodes: 0,
    memoryUsage: 0,
    optimizationRate: 0,
    lastUpdated: new Date()
  };

  /**
   * 记录组件渲染性能
   */
  recordRender(
    componentId: string,
    clip: Clip,
    element: HTMLElement,
    renderStartTime: number
  ): void {
    const renderTime = performance.now() - renderStartTime;
    const contentMetrics = analyzeContentMetrics(clip);
    const perfMetrics = measureRenderPerformance(element, contentMetrics.textLength);

    const renderData: ComponentRenderData = {
      componentId,
      contentLength: contentMetrics.textLength,
      renderTime,
      domNodes: perfMetrics.domNodes,
      complexity: contentMetrics.complexity,
      isOptimized: perfMetrics.isOptimized,
      timestamp: new Date()
    };

    // 存储组件渲染数据
    if (!this.renderData.has(componentId)) {
      this.renderData.set(componentId, []);
    }
    
    const componentData = this.renderData.get(componentId)!;
    componentData.push(renderData);
    
    // 保持最近50次渲染记录
    if (componentData.length > 50) {
      componentData.shift();
    }

    // 更新全局指标
    this.updateGlobalMetrics();

    // 在开发环境输出性能警告
    if (process.env.NODE_ENV === 'development') {
      this.checkPerformanceWarnings(renderData);
    }
  }

  /**
   * 更新全局性能指标
   */
  private updateGlobalMetrics(): void {
    const allRenderData: ComponentRenderData[] = [];
    this.renderData.forEach(data => allRenderData.push(...data));

    if (allRenderData.length === 0) return;

    const renderTimes = allRenderData.map(d => d.renderTime);
    const optimizedCount = allRenderData.filter(d => d.isOptimized).length;

    this.globalMetrics = {
      totalRenderTime: renderTimes.reduce((sum, time) => sum + time, 0),
      averageRenderTime: renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length,
      slowestRender: Math.max(...renderTimes),
      fastestRender: Math.min(...renderTimes),
      totalDOMNodes: allRenderData.reduce((sum, d) => sum + d.domNodes, 0),
      memoryUsage: allRenderData.reduce((sum, d) => sum + d.contentLength * 2, 0),
      optimizationRate: optimizedCount / allRenderData.length,
      lastUpdated: new Date()
    };
  }

  /**
   * 检查性能警告
   */
  private checkPerformanceWarnings(data: ComponentRenderData): void {
    const warnings: string[] = [];

    if (data.renderTime > 16) {
      warnings.push(`🐌 渲染时间过长: ${data.renderTime.toFixed(2)}ms (目标: <16ms)`);
    }

    if (data.domNodes > 500) {
      warnings.push(`🏗️ DOM节点过多: ${data.domNodes} (建议: <500)`);
    }

    if (data.contentLength > 10000) {
      warnings.push(`📄 内容过长: ${data.contentLength} 字符 (考虑分页)`);
    }

    if (!data.isOptimized) {
      warnings.push(`⚡ 未优化组件 (复杂度: ${data.complexity})`);
    }

    if (warnings.length > 0) {
      console.group(`⚠️ 性能警告 - ${data.componentId}`);
      warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }
  }

  /**
   * 获取全局性能指标
   */
  getGlobalMetrics(): RenderingMetrics {
    return { ...this.globalMetrics };
  }

  /**
   * 获取组件性能历史
   */
  getComponentHistory(componentId: string): ComponentRenderData[] {
    return this.renderData.get(componentId) || [];
  }

  /**
   * 获取性能统计报告
   */
  getPerformanceReport(): {
    summary: RenderingMetrics;
    slowestComponents: ComponentRenderData[];
    optimizationSuggestions: string[];
  } {
    const summary = this.getGlobalMetrics();
    
    // 找出最慢的组件
    const allData: ComponentRenderData[] = [];
    this.renderData.forEach(data => allData.push(...data));
    const slowestComponents = allData
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 5);

    // 生成优化建议
    const suggestions: string[] = [];
    
    if (summary.averageRenderTime > 10) {
      suggestions.push('平均渲染时间偏高，考虑启用懒加载');
    }
    
    if (summary.optimizationRate < 0.8) {
      suggestions.push('优化率偏低，检查长内容组件的优化策略');
    }
    
    if (summary.totalDOMNodes > 5000) {
      suggestions.push('DOM节点总数过多，考虑虚拟滚动');
    }

    const complexComponents = allData.filter(d => d.complexity === 'extreme').length;
    if (complexComponents > 3) {
      suggestions.push('检测到多个极复杂组件，建议内容分页');
    }

    return {
      summary,
      slowestComponents,
      optimizationSuggestions: suggestions
    };
  }

  /**
   * 重置所有监控数据
   */
  reset(): void {
    this.renderData.clear();
    this.globalMetrics = {
      totalRenderTime: 0,
      averageRenderTime: 0,
      slowestRender: 0,
      fastestRender: Infinity,
      totalDOMNodes: 0,
      memoryUsage: 0,
      optimizationRate: 0,
      lastUpdated: new Date()
    };
  }

  /**
   * 导出监控数据
   */
  exportData(): {
    globalMetrics: RenderingMetrics;
    componentData: Record<string, ComponentRenderData[]>;
    timestamp: string;
  } {
    const componentData: Record<string, ComponentRenderData[]> = {};
    this.renderData.forEach((data, id) => {
      componentData[id] = data;
    });

    return {
      globalMetrics: this.globalMetrics,
      componentData,
      timestamp: new Date().toISOString()
    };
  }
}

// =============================================================================
// React Hook for Performance Monitoring
// =============================================================================

import React from 'react';

/**
 * React Hook for monitoring component rendering performance
 */
export function useRenderingPerformance(componentId: string, clip: Clip) {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const renderStartTime = React.useRef<number>(0);

  // 记录渲染开始时间
  React.useLayoutEffect(() => {
    renderStartTime.current = performance.now();
  });

  // 记录渲染完成
  React.useEffect(() => {
    if (elementRef.current && renderStartTime.current > 0) {
      globalMonitor.recordRender(
        componentId,
        clip,
        elementRef.current,
        renderStartTime.current
      );
    }
  });

  return { elementRef };
}

// =============================================================================
// 全局监控器实例
// =============================================================================

const globalMonitor = new RenderingPerformanceMonitor();

/**
 * 获取性能报告
 */
export function getPerformanceReport() {
  return globalMonitor.getPerformanceReport();
}

/**
 * 获取全局性能指标
 */
export function getGlobalRenderingMetrics() {
  return globalMonitor.getGlobalMetrics();
}

/**
 * 重置性能监控
 */
export function resetRenderingMonitor() {
  globalMonitor.reset();
}

/**
 * 导出性能数据
 */
export function exportRenderingData() {
  return globalMonitor.exportData();
}

/**
 * 在开发环境中定期输出性能报告
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 每30秒输出一次性能报告
  setInterval(() => {
    const report = globalMonitor.getPerformanceReport();
    
    if (report.summary.averageRenderTime > 0) {
      console.group('📊 列表渲染性能报告');
      console.log('平均渲染时间:', `${report.summary.averageRenderTime.toFixed(2)}ms`);
      console.log('优化率:', `${(report.summary.optimizationRate * 100).toFixed(1)}%`);
      console.log('总DOM节点:', report.summary.totalDOMNodes);
      
      if (report.optimizationSuggestions.length > 0) {
        console.log('优化建议:', report.optimizationSuggestions);
      }
      
      if (report.slowestComponents.length > 0) {
        console.log('最慢组件:', report.slowestComponents.slice(0, 3));
      }
      
      console.groupEnd();
    }
  }, 30000);
}

export default globalMonitor;
