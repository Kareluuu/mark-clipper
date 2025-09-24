/**
 * 内容验证和质量检查工具
 * 
 * 功能：
 * 1. HTML 内容安全性验证
 * 2. 内容质量评估
 * 3. 性能影响分析
 * 4. 格式完整性检查
 */

import type { Clip } from '../types/clips';

// =============================================================================
// 类型定义
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 分
  issues: ValidationIssue[];
  recommendations: string[];
  summary: ValidationSummary;
}

export interface ValidationIssue {
  type: 'security' | 'performance' | 'format' | 'content';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
}

export interface ValidationSummary {
  hasHtml: boolean;
  hasPlainText: boolean;
  hasTitle: boolean;
  contentLength: number;
  estimatedRenderTime: number; // ms
  securityRisk: 'none' | 'low' | 'medium' | 'high';
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ValidationOptions {
  checkSecurity?: boolean;
  checkPerformance?: boolean;
  checkFormat?: boolean;
  checkContent?: boolean;
  strictMode?: boolean;
}

// =============================================================================
// 验证规则配置
// =============================================================================

const DEFAULT_OPTIONS: Required<ValidationOptions> = {
  checkSecurity: true,
  checkPerformance: true,
  checkFormat: true,
  checkContent: true,
  strictMode: false,
};

// 危险标签和属性
const DANGEROUS_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form', 'input', 'textarea'
]);

const DANGEROUS_ATTRIBUTES = new Set([
  'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur',
  'onsubmit', 'onchange', 'onkeydown', 'onkeyup', 'style', 'srcdoc'
]);

const DANGEROUS_PROTOCOLS = new Set([
  'javascript:', 'data:', 'vbscript:', 'file:', 'about:', 'chrome:', 'chrome-extension:'
]);

// 性能阈值
const PERFORMANCE_THRESHOLDS = {
  maxLength: 50000,      // 50KB
  maxNestingDepth: 10,   // 最大嵌套深度
  maxElements: 1000,     // 最大元素数量
  warningLength: 10000,  // 10KB 警告阈值
};

// =============================================================================
// 主要验证函数
// =============================================================================

/**
 * 验证 Clip 内容
 */
export function validateClipContent(clip: Clip, options: ValidationOptions = {}): ValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const issues: ValidationIssue[] = [];
  let score = 100;

  // 基础信息收集
  const summary = collectSummary(clip);
  
  // 执行各种检查
  if (opts.checkSecurity) {
    const securityIssues = checkSecurity(clip, opts.strictMode);
    issues.push(...securityIssues);
    score -= securityIssues.length * 10;
  }

  if (opts.checkPerformance) {
    const performanceIssues = checkPerformance(clip);
    issues.push(...performanceIssues);
    score -= performanceIssues.filter(i => i.severity === 'high').length * 15;
    score -= performanceIssues.filter(i => i.severity === 'medium').length * 5;
  }

  if (opts.checkFormat) {
    const formatIssues = checkFormat(clip);
    issues.push(...formatIssues);
    score -= formatIssues.length * 5;
  }

  if (opts.checkContent) {
    const contentIssues = checkContent(clip);
    issues.push(...contentIssues);
    score -= contentIssues.length * 3;
  }

  // 生成建议
  const recommendations = generateRecommendations(issues, summary);
  
  // 更新摘要
  summary.securityRisk = calculateSecurityRisk(issues);
  summary.qualityGrade = calculateQualityGrade(Math.max(score, 0));

  return {
    isValid: score >= 60 && !issues.some(i => i.severity === 'critical'),
    score: Math.max(score, 0),
    issues,
    recommendations,
    summary,
  };
}

// =============================================================================
// 具体检查函数
// =============================================================================

/**
 * 安全性检查
 */
function checkSecurity(clip: Clip, strictMode: boolean): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!clip.html_raw) return issues;

  const html = clip.html_raw.toLowerCase();

  // 检查危险标签
  for (const tag of DANGEROUS_TAGS) {
    if (html.includes(`<${tag}`) || html.includes(`</${tag}`)) {
      issues.push({
        type: 'security',
        severity: tag === 'script' ? 'critical' : 'high',
        message: `发现潜在危险标签: ${tag}`,
        suggestion: `移除或替换 ${tag} 标签`,
      });
    }
  }

  // 检查危险属性
  for (const attr of DANGEROUS_ATTRIBUTES) {
    if (html.includes(attr + '=')) {
      issues.push({
        type: 'security',
        severity: attr.startsWith('on') ? 'high' : 'medium',
        message: `发现潜在危险属性: ${attr}`,
        suggestion: `移除 ${attr} 属性`,
      });
    }
  }

  // 检查危险协议
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (html.includes(protocol)) {
      issues.push({
        type: 'security',
        severity: 'high',
        message: `发现危险协议: ${protocol}`,
        suggestion: `替换为安全的 URL 协议`,
      });
    }
  }

  // 检查内联样式（严格模式）
  if (strictMode && html.includes('style=')) {
    issues.push({
      type: 'security',
      severity: 'medium',
      message: '内联样式可能存在安全风险',
      suggestion: '使用 CSS 类替代内联样式',
    });
  }

  return issues;
}

/**
 * 性能检查
 */
function checkPerformance(clip: Clip): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!clip.html_raw) return issues;

  const html = clip.html_raw;
  const length = html.length;

  // 内容长度检查
  if (length > PERFORMANCE_THRESHOLDS.maxLength) {
    issues.push({
      type: 'performance',
      severity: 'high',
      message: `内容过大: ${length} 字符`,
      suggestion: '考虑分割内容或使用懒加载',
    });
  } else if (length > PERFORMANCE_THRESHOLDS.warningLength) {
    issues.push({
      type: 'performance',
      severity: 'medium',
      message: `内容较大: ${length} 字符，可能影响性能`,
      suggestion: '监控渲染性能',
    });
  }

  // 嵌套深度检查
  const nestingDepth = calculateNestingDepth(html);
  if (nestingDepth > PERFORMANCE_THRESHOLDS.maxNestingDepth) {
    issues.push({
      type: 'performance',
      severity: 'medium',
      message: `嵌套层次过深: ${nestingDepth} 层`,
      suggestion: '简化 HTML 结构',
    });
  }

  // 元素数量检查
  const elementCount = (html.match(/<[^>]+>/g) || []).length;
  if (elementCount > PERFORMANCE_THRESHOLDS.maxElements) {
    issues.push({
      type: 'performance',
      severity: 'medium',
      message: `元素数量过多: ${elementCount} 个`,
      suggestion: '减少元素数量或使用虚拟滚动',
    });
  }

  return issues;
}

/**
 * 格式检查
 */
function checkFormat(clip: Clip): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!clip.html_raw) return issues;

  const html = clip.html_raw;

  // 检查未闭合标签
  const openTags = html.match(/<(?!\/)[^>]+>/g) || [];
  const closeTags = html.match(/<\/[^>]+>/g) || [];
  
  if (openTags.length !== closeTags.length) {
    issues.push({
      type: 'format',
      severity: 'medium',
      message: '可能存在未闭合的标签',
      suggestion: '检查并修复 HTML 标签配对',
    });
  }

  // 检查格式错误
  if (html.includes('<>') || html.includes('</>')) {
    issues.push({
      type: 'format',
      severity: 'low',
      message: '发现空标签',
      suggestion: '移除空的 HTML 标签',
    });
  }

  // 检查重复空白
  if (/\s{3,}/.test(html)) {
    issues.push({
      type: 'format',
      severity: 'low',
      message: '存在多余的空白字符',
      suggestion: '清理多余的空格和换行',
    });
  }

  return issues;
}

/**
 * 内容检查
 */
function checkContent(clip: Clip): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 检查内容完整性
  if (!clip.html_raw && !clip.text_plain) {
    issues.push({
      type: 'content',
      severity: 'high',
      message: '缺少内容数据',
      suggestion: '添加 HTML 或纯文本内容',
    });
  }

  if (!clip.title || clip.title.trim() === '') {
    issues.push({
      type: 'content',
      severity: 'low',
      message: '缺少标题',
      suggestion: '添加描述性标题',
    });
  }

  // 检查内容质量
  const textContent = clip.text_plain || '';
  if (textContent.length < 10) {
    issues.push({
      type: 'content',
      severity: 'medium',
      message: '内容过短',
      suggestion: '添加更多有意义的内容',
    });
  }

  return issues;
}

// =============================================================================
// 工具函数
// =============================================================================

/**
 * 收集基础摘要信息
 */
function collectSummary(clip: Clip): ValidationSummary {
  const textContent = clip.text_plain || '';
  const htmlContent = clip.html_raw || '';
  
  return {
    hasHtml: !!htmlContent.trim(),
    hasPlainText: !!textContent.trim(),
    hasTitle: !!(clip.title && clip.title.trim()),
    contentLength: Math.max(textContent.length, htmlContent.length),
    estimatedRenderTime: Math.max(htmlContent.length / 1000, 1), // 简单估算
    securityRisk: 'none', // 将在后面更新
    qualityGrade: 'A', // 将在后面更新
  };
}

/**
 * 计算嵌套深度
 */
function calculateNestingDepth(html: string): number {
  let maxDepth = 0;
  let currentDepth = 0;
  
  const tags = html.match(/<[^>]+>/g) || [];
  
  for (const tag of tags) {
    if (tag.startsWith('</')) {
      currentDepth--;
    } else if (!tag.endsWith('/>')) {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    }
  }
  
  return maxDepth;
}

/**
 * 计算安全风险等级
 */
function calculateSecurityRisk(issues: ValidationIssue[]): 'none' | 'low' | 'medium' | 'high' {
  const securityIssues = issues.filter(i => i.type === 'security');
  
  if (securityIssues.some(i => i.severity === 'critical')) return 'high';
  if (securityIssues.some(i => i.severity === 'high')) return 'high';
  if (securityIssues.some(i => i.severity === 'medium')) return 'medium';
  if (securityIssues.length > 0) return 'low';
  
  return 'none';
}

/**
 * 计算质量等级
 */
function calculateQualityGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * 生成建议
 */
function generateRecommendations(issues: ValidationIssue[], summary: ValidationSummary): string[] {
  const recommendations: string[] = [];
  
  // 基于问题类型生成建议
  const securityIssues = issues.filter(i => i.type === 'security').length;
  const performanceIssues = issues.filter(i => i.type === 'performance').length;
  const formatIssues = issues.filter(i => i.type === 'format').length;
  
  if (securityIssues > 0) {
    recommendations.push('使用 HTML 清理工具去除危险内容');
  }
  
  if (performanceIssues > 0) {
    recommendations.push('优化内容结构以提升渲染性能');
  }
  
  if (formatIssues > 0) {
    recommendations.push('修复 HTML 格式错误以确保正确显示');
  }
  
  if (!summary.hasPlainText) {
    recommendations.push('添加纯文本版本作为回退方案');
  }
  
  if (summary.contentLength > PERFORMANCE_THRESHOLDS.warningLength) {
    recommendations.push('考虑使用分页或懒加载处理大内容');
  }
  
  return recommendations;
}

// =============================================================================
// 便捷函数
// =============================================================================

/**
 * 快速安全检查
 */
export function quickSecurityCheck(html: string): boolean {
  const lowercaseHtml = html.toLowerCase();
  
  for (const tag of DANGEROUS_TAGS) {
    if (lowercaseHtml.includes(`<${tag}`)) {
      return false;
    }
  }
  
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowercaseHtml.includes(protocol)) {
      return false;
    }
  }
  
  return true;
}

/**
 * 批量验证
 */
export function batchValidateClips(clips: Clip[], options: ValidationOptions = {}): ValidationResult[] {
  return clips.map(clip => validateClipContent(clip, options));
}

/**
 * 获取验证统计
 */
export function getValidationStats(results: ValidationResult[]) {
  const total = results.length;
  const valid = results.filter(r => r.isValid).length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / total;
  const securityRisks = results.filter(r => r.summary.securityRisk !== 'none').length;
  
  return {
    total,
    valid,
    invalid: total - valid,
    validRate: (valid / total) * 100,
    averageScore,
    securityRisks,
    gradeDistribution: {
      A: results.filter(r => r.summary.qualityGrade === 'A').length,
      B: results.filter(r => r.summary.qualityGrade === 'B').length,
      C: results.filter(r => r.summary.qualityGrade === 'C').length,
      D: results.filter(r => r.summary.qualityGrade === 'D').length,
      F: results.filter(r => r.summary.qualityGrade === 'F').length,
    },
  };
}
