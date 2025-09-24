/**
 * 标题转换测试脚本
 * 用于调试为什么标题格式转译没有生效
 */

import { translateHtmlToQuill } from './htmlTranslator';
import { translateHtmlToQuillCached } from './contentCache';
import { getDisplayContentSync } from './contentStrategy';
import type { Clip } from '../types/clips';

/**
 * 测试标题转换功能
 */
export function testHeadingConversion() {
  console.log('🧪 开始测试标题转换功能...');

  // 测试数据
  const testHtml = '<h1 style="color: red;">这是H1标题</h1><h2>这是H2标题</h2><h3>这是H3标题</h3><p>这是段落</p>';
  
  console.log('📋 原始HTML:', testHtml);
  
  // 测试1: 直接调用 translateHtmlToQuill
  console.log('\n=== 测试1: translateHtmlToQuill ===');
  try {
    const result1 = translateHtmlToQuill(testHtml);
    console.log('✅ 直接转换结果:', result1);
    console.log('🔍 是否包含h1标签:', result1.includes('<h1'));
    console.log('🔍 是否包含h2标签:', result1.includes('<h2'));
  } catch (error) {
    console.error('❌ 直接转换失败:', error);
  }

  // 测试2: 使用缓存版本
  console.log('\n=== 测试2: translateHtmlToQuillCached ===');
  try {
    const result2 = translateHtmlToQuillCached(testHtml);
    console.log('✅ 缓存转换结果:', result2);
    console.log('🔍 是否包含h1标签:', result2.includes('<h1'));
    console.log('🔍 是否包含h2标签:', result2.includes('<h2'));
  } catch (error) {
    console.error('❌ 缓存转换失败:', error);
  }

  // 测试3: 使用同步内容策略
  console.log('\n=== 测试3: getDisplayContentSync ===');
  const testClip: Clip = {
    id: 'test-heading',
    title: '标题转换测试',
    html_raw: testHtml,
    text_plain: '这是H1标题\n这是H2标题\n这是H3标题\n这是段落',
    created_at: new Date().toISOString(),
    url: 'test-url',
    user_id: 'test-user',
    theme_name: 'default',
    category: 'default',
  };

  try {
    const result3 = getDisplayContentSync(testClip, { logErrors: true });
    console.log('✅ 同步策略结果:', result3);
    console.log('🔍 是否包含h1标签:', result3.includes('<h1'));
    console.log('🔍 是否包含h2标签:', result3.includes('<h2'));
    console.log('🔍 是否包含style属性:', result3.includes('style='));
  } catch (error) {
    console.error('❌ 同步策略失败:', error);
  }

  // 测试4: 简单正则替换测试
  console.log('\n=== 测试4: 简单正则替换 ===');
  const simpleResult = testHtml.replace(/<h[1-6]([^>]*)>([\s\S]*?)<\/h[1-6]>/gi, '<h2$1>$2</h2>');
  console.log('✅ 简单替换结果:', simpleResult);
  console.log('🔍 是否包含h1标签:', simpleResult.includes('<h1'));
  console.log('🔍 是否包含h2标签:', simpleResult.includes('<h2'));

  // 测试5: 样式移除测试
  console.log('\n=== 测试5: 样式移除测试 ===');
  const styleRemoved = simpleResult.replace(/\sstyle="[^"]*"/gi, '');
  console.log('✅ 样式移除结果:', styleRemoved);
  console.log('🔍 是否还包含style属性:', styleRemoved.includes('style='));

  console.log('\n🎉 标题转换测试完成!');
  
  return {
    originalHtml: testHtml,
    directTranslation: translateHtmlToQuill(testHtml),
    cachedTranslation: translateHtmlToQuillCached(testHtml),
    syncStrategy: getDisplayContentSync(testClip, { logErrors: false }),
    simpleRegex: simpleResult,
    styleRemoved: styleRemoved
  };
}

/**
 * 在浏览器环境中运行测试
 */
if (typeof window !== 'undefined') {
  // 延迟执行以避免阻塞页面加载
  setTimeout(() => {
    console.log('🚀 自动运行标题转换测试...');
    testHeadingConversion();
  }, 2000);
}

export default testHeadingConversion;
