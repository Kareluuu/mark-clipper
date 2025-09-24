/**
 * 测试控制面板组件 - 用于开发环境的系统测试和验证
 * 
 * 功能：
 * 1. 系统验证控制面板
 * 2. 错误模拟控制
 * 3. 集成测试执行
 * 4. 性能监控显示
 * 5. 实时状态展示
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  validateSystemIntegrity, 
  quickHealthCheck, 
  generateValidationReport,
  type SystemValidationReport 
} from './systemValidator';
import { 
  errorSimulator,
  setupLightErrorScenario,
  setupModerateErrorScenario, 
  setupHeavyErrorScenario,
  setupExtremeErrorScenario
} from './errorSimulator';
import { 
  integrationTester,
  runQuickIntegrationTest,
  runFullIntegrationTestSuite
} from './integrationTester';
import { getCacheStats, clearTranslationCache } from './contentCache';

// ============ 类型定义 ============

interface HealthStatus {
  healthy: boolean;
  message: string;
  timestamp: Date;
}

interface CacheMetrics {
  hitRate: number;
  operations: number;
  cacheSize: number;
  memoryUsage: string;
}

interface TestProgress {
  isRunning: boolean;
  currentTest: string;
  progress: number;
  results?: any;
}

// ============ 样式定义 ============

const dashboardStyles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '10px'
  },
  section: {
    margin: '20px 0',
    padding: '20px',
    border: '1px solid #e1e5e9',
    borderRadius: '8px',
    background: '#ffffff'
  },
  button: {
    padding: '10px 20px',
    margin: '5px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  primaryButton: {
    background: '#0066cc',
    color: 'white'
  },
  dangerButton: {
    background: '#dc3545',
    color: 'white'
  },
  successButton: {
    background: '#28a745',
    color: 'white'
  },
  warningButton: {
    background: '#ffc107',
    color: '#212529'
  },
  statusGood: {
    color: '#28a745',
    fontWeight: 'bold'
  },
  statusBad: {
    color: '#dc3545',
    fontWeight: 'bold'
  },
  statusWarning: {
    color: '#ffc107',
    fontWeight: 'bold'
  },
  metricCard: {
    display: 'inline-block',
    margin: '10px',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    minWidth: '150px',
    textAlign: 'center' as const
  },
  progressBar: {
    width: '100%',
    height: '20px',
    background: '#f0f0f0',
    borderRadius: '10px',
    overflow: 'hidden',
    margin: '10px 0'
  },
  progressFill: (progress: number) => ({
    width: `${progress}%`,
    height: '100%',
    background: 'linear-gradient(90deg, #4CAF50, #45a049)',
    transition: 'width 0.3s ease'
  }),
  codeBlock: {
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '5px',
    padding: '15px',
    fontSize: '12px',
    fontFamily: 'Monaco, Consolas, monospace',
    whiteSpace: 'pre-wrap' as const,
    maxHeight: '300px',
    overflow: 'auto'
  }
};

// ============ 测试控制面板组件 ============

export const TestDashboard: React.FC = () => {
  // 状态管理
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const [validationReport, setValidationReport] = useState<SystemValidationReport | null>(null);
  const [testProgress, setTestProgress] = useState<TestProgress>({
    isRunning: false,
    currentTest: '',
    progress: 0
  });
  const [errorScenario, setErrorScenario] = useState<string>('none');
  const [testResults, setTestResults] = useState<string>('');

  // ============ 健康检查 ============

  const runHealthCheck = useCallback(async () => {
    try {
      const result = await quickHealthCheck();
      setHealthStatus({
        ...result,
        timestamp: new Date()
      });
    } catch (error) {
      setHealthStatus({
        healthy: false,
        message: `健康检查失败: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date()
      });
    }
  }, []);

  // ============ 缓存指标更新 ============

  const updateCacheMetrics = useCallback(() => {
    try {
      const stats = getCacheStats();
      setCacheMetrics({
        hitRate: stats.hitRate,
        operations: stats.operations,
        cacheSize: stats.cacheSize,
        memoryUsage: `${(stats.cacheSize / 1024).toFixed(1)}KB`
      });
    } catch (error) {
      console.error('获取缓存指标失败:', error);
    }
  }, []);

  // ============ 系统验证 ============

  const runSystemValidation = useCallback(async () => {
    setTestProgress({
      isRunning: true,
      currentTest: '系统完整性验证',
      progress: 0
    });

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setTestProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      const report = await validateSystemIntegrity();
      
      clearInterval(progressInterval);
      setValidationReport(report);
      setTestResults(generateValidationReport(report));
      
      setTestProgress({
        isRunning: false,
        currentTest: '',
        progress: 100,
        results: report
      });
    } catch (error) {
      setTestProgress({
        isRunning: false,
        currentTest: '',
        progress: 0
      });
      setTestResults(`验证失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  // ============ 快速测试 ============

  const runQuickTest = useCallback(async () => {
    setTestProgress({
      isRunning: true,
      currentTest: '快速集成测试',
      progress: 0
    });

    try {
      const progressInterval = setInterval(() => {
        setTestProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 20, 80)
        }));
      }, 100);

      const success = await runQuickIntegrationTest();
      
      clearInterval(progressInterval);
      setTestProgress({
        isRunning: false,
        currentTest: '',
        progress: 100
      });
      
      setTestResults(`快速测试${success ? '✅ 通过' : '❌ 失败'}\n时间: ${new Date().toLocaleString()}`);
    } catch (error) {
      setTestProgress({
        isRunning: false,
        currentTest: '',
        progress: 0
      });
      setTestResults(`快速测试失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  // ============ 完整测试套件 ============

  const runFullTestSuite = useCallback(async () => {
    setTestProgress({
      isRunning: true,
      currentTest: '完整测试套件',
      progress: 0
    });

    try {
      const progressInterval = setInterval(() => {
        setTestProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 90)
        }));
      }, 500);

      const results = await runFullIntegrationTestSuite();
      
      clearInterval(progressInterval);
      setTestProgress({
        isRunning: false,
        currentTest: '',
        progress: 100,
        results
      });
      
      const report = integrationTester.generateTestReport();
      setTestResults(report);
    } catch (error) {
      setTestProgress({
        isRunning: false,
        currentTest: '',
        progress: 0
      });
      setTestResults(`完整测试失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  // ============ 错误场景控制 ============

  const setErrorSimulation = useCallback((scenario: string) => {
    errorSimulator.disable(); // 先禁用当前设置
    
    switch (scenario) {
      case 'light':
        setupLightErrorScenario();
        break;
      case 'moderate':
        setupModerateErrorScenario();
        break;
      case 'heavy':
        setupHeavyErrorScenario();
        break;
      case 'extreme':
        setupExtremeErrorScenario();
        break;
      default:
        // 保持禁用状态
        break;
    }
    
    setErrorScenario(scenario);
  }, []);

  // ============ 定期更新 ============

  useEffect(() => {
    // 初始加载
    runHealthCheck();
    updateCacheMetrics();

    // 定期更新
    const interval = setInterval(() => {
      updateCacheMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, [runHealthCheck, updateCacheMetrics]);

  // ============ 渲染 ============

  return (
    <div style={dashboardStyles.container}>
      {/* 头部 */}
      <div style={dashboardStyles.header}>
        <h1>🧪 Mark Clipper 测试控制面板</h1>
        <p>系统验证 • 错误模拟 • 性能监控</p>
      </div>

      {/* 系统状态 */}
      <div style={dashboardStyles.section}>
        <h2>📊 系统状态</h2>
        
        {/* 健康状态 */}
        <div style={dashboardStyles.metricCard}>
          <h3>健康状态</h3>
          {healthStatus ? (
            <div>
              <div style={healthStatus.healthy ? dashboardStyles.statusGood : dashboardStyles.statusBad}>
                {healthStatus.healthy ? '🟢 健康' : '🔴 异常'}
              </div>
              <small>{healthStatus.message}</small>
              <br />
              <small>{healthStatus.timestamp.toLocaleTimeString()}</small>
            </div>
          ) : (
            <div>检查中...</div>
          )}
          <br />
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.primaryButton}}
            onClick={runHealthCheck}
          >
            重新检查
          </button>
        </div>

        {/* 缓存指标 */}
        <div style={dashboardStyles.metricCard}>
          <h3>缓存性能</h3>
          {cacheMetrics ? (
            <div>
              <div>命中率: {(cacheMetrics.hitRate * 100).toFixed(1)}%</div>
              <div>操作数: {cacheMetrics.operations}</div>
              <div>内存: {cacheMetrics.memoryUsage}</div>
            </div>
          ) : (
            <div>加载中...</div>
          )}
          <br />
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.warningButton}}
            onClick={() => {
              clearTranslationCache();
              updateCacheMetrics();
            }}
          >
            清空缓存
          </button>
        </div>

        {/* 验证状态 */}
        <div style={dashboardStyles.metricCard}>
          <h3>验证状态</h3>
          {validationReport ? (
            <div>
              <div style={
                validationReport.overallStatus === 'healthy' ? dashboardStyles.statusGood :
                validationReport.overallStatus === 'degraded' ? dashboardStyles.statusWarning :
                dashboardStyles.statusBad
              }>
                {validationReport.overallStatus === 'healthy' ? '🟢 健康' :
                 validationReport.overallStatus === 'degraded' ? '🟡 降级' : '🔴 严重'}
              </div>
              <div>通过: {validationReport.passedTests}/{validationReport.totalTests}</div>
              <div>平均时间: {validationReport.performanceMetrics.averageTranslationTime.toFixed(1)}ms</div>
            </div>
          ) : (
            <div>未验证</div>
          )}
        </div>
      </div>

      {/* 测试控制 */}
      <div style={dashboardStyles.section}>
        <h2>🧪 测试控制</h2>
        
        <div>
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.successButton}}
            onClick={runQuickTest}
            disabled={testProgress.isRunning}
          >
            快速测试
          </button>
          
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.primaryButton}}
            onClick={runSystemValidation}
            disabled={testProgress.isRunning}
          >
            系统验证
          </button>
          
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.primaryButton}}
            onClick={runFullTestSuite}
            disabled={testProgress.isRunning}
          >
            完整测试套件
          </button>
        </div>

        {/* 测试进度 */}
        {testProgress.isRunning && (
          <div>
            <p>当前测试: {testProgress.currentTest}</p>
            <div style={dashboardStyles.progressBar}>
              <div style={dashboardStyles.progressFill(testProgress.progress)} />
            </div>
            <p>{testProgress.progress.toFixed(0)}% 完成</p>
          </div>
        )}
      </div>

      {/* 错误模拟控制 */}
      <div style={dashboardStyles.section}>
        <h2>🔥 错误模拟</h2>
        <p>当前场景: <strong>{errorScenario === 'none' ? '无模拟' : errorScenario}</strong></p>
        
        <div>
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.successButton}}
            onClick={() => setErrorSimulation('none')}
          >
            关闭模拟
          </button>
          
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.warningButton}}
            onClick={() => setErrorSimulation('light')}
          >
            轻度错误
          </button>
          
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.warningButton}}
            onClick={() => setErrorSimulation('moderate')}
          >
            中度错误
          </button>
          
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.dangerButton}}
            onClick={() => setErrorSimulation('heavy')}
          >
            重度错误
          </button>
          
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.dangerButton}}
            onClick={() => setErrorSimulation('extreme')}
          >
            极端错误
          </button>
        </div>
      </div>

      {/* 测试结果 */}
      {testResults && (
        <div style={dashboardStyles.section}>
          <h2>📋 测试结果</h2>
          <button
            style={{...dashboardStyles.button, ...dashboardStyles.warningButton}}
            onClick={() => setTestResults('')}
          >
            清空结果
          </button>
          <div style={dashboardStyles.codeBlock}>
            {testResults}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ 开发环境检查包装器 ============

export const TestDashboardWrapper: React.FC = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px',
        color: '#666'
      }}>
        <h2>🚫 测试控制面板</h2>
        <p>此功能仅在开发环境中可用</p>
      </div>
    );
  }
  
  return <TestDashboard />;
};

export default TestDashboardWrapper;
