/**
 * 工具函数统一导出
 */

export {
  translateHtmlToQuill,
  htmlToPlainText,
  getSupportedQuillFormats,
  isSupportedHtmlTag,
  getQuillFormatForHtmlTag,
  QUILL_FORMATS
} from './htmlTranslator';

// 导出使用示例和辅助函数
export {
  demonstrateHtmlTranslator,
  processClipContent
} from './examples';

// 导出Quill集成测试函数
export {
  runQuillIntegrationTests,
  verifyStyleConsistency,
  quillFormatTests,
  quillToolbarConfig
} from './quill-integration-test';

// 导出内容获取策略函数
export {
  getDisplayContent,
  getDisplayContentSync,
  getEditContent,
  getDetailedDisplayContent,
  getSearchableContent,
  assessContentQuality,
  hasValidContent,
  getContentPreview,
  batchGetDisplayContent,
  batchGetDisplayContentAsync,
  validateDataModelSimplicity
} from './contentStrategy';

// 导出缓存相关函数
export {
  translateHtmlToQuillCached,
  getCacheStats,
  clearTranslationCache,
  warmupCache,
  cleanupCache
} from './contentCache';

// 导出性能优化函数
export {
  analyzeContentMetrics,
  getOptimizationRecommendations,
  determineRenderStrategy,
  createContentPages,
  createExpandableContent,
  measureRenderPerformance,
  analyzeBatchRenderLoad
} from './contentOptimization';

// 导出渲染性能监控函数
export {
  useRenderingPerformance,
  getPerformanceReport,
  getGlobalRenderingMetrics,
  resetRenderingMonitor,
  exportRenderingData
} from './renderingPerformanceMonitor';

// 导出内容策略类型
export type {
  ContentResult,
  ContentOptions
} from './contentStrategy';

// 导出系统验证和测试工具
export {
  validateSystemIntegrity,
  quickHealthCheck,
  generateValidationReport
} from './systemValidator';

export {
  errorSimulator,
  simulateNetworkError,
  simulateTranslationError,
  simulateCacheError,
  simulateDataCorruption,
  setupLightErrorScenario,
  setupModerateErrorScenario,
  setupHeavyErrorScenario,
  setupExtremeErrorScenario,
  testErrorRecovery
} from './errorSimulator';

export {
  integrationTester,
  runQuickIntegrationTest,
  runFullIntegrationTestSuite,
  TEST_SCENARIOS
} from './integrationTester';

export { TestDashboardWrapper } from './testDashboard';

export { testExamples } from './testExamples';

// 导出新的 HTML 处理器
export {
  processHtml,
  cleanHtml,
  extractText,
  strictClean,
  clearCache,
  getCacheStats
} from './htmlProcessor';

// 导出内容验证器
export {
  validateClipContent,
  quickSecurityCheck,
  batchValidateClips,
  getValidationStats
} from './contentValidator';

// 重新导出默认函数
export { default as translateHtmlToQuill } from './htmlTranslator';
