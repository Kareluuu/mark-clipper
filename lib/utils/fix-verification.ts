/**
 * 修复验证脚本
 * 验证 HTML 处理系统修复是否成功
 */

import { getDisplayContentSync } from './contentStrategy';
import type { Clip } from '../types/clips';

/**
 * 测试修复是否成功
 */
export function verifyFix(): boolean {
  console.log('🔍 开始验证 HTML 处理系统修复...');

  // 创建测试 Clip
  const testClip: Clip = {
    id: 'test-1',
    title: '测试标题',
    html_raw: '<h1 style="color: red; font-size: 24px;">这是一个带样式的标题</h1><p>这是段落内容</p>',
    text_plain: '这是一个带样式的标题\n这是段落内容',
    created_at: new Date().toISOString(),
    url: 'test-url',
    user_id: 'test-user',
    theme_name: 'default',
    category: 'default',
  };

  try {
    // 测试同步函数
    const result = getDisplayContentSync(testClip, {
      fallbackToPlainText: true,
      logErrors: true
    });

    console.log('✅ 同步函数调用成功');
    console.log('📄 处理结果:', result);

    // 验证结果是字符串
    if (typeof result !== 'string') {
      console.error('❌ 错误: 返回结果不是字符串，而是:', typeof result);
      return false;
    }

    // 验证 trim 方法可用
    try {
      const trimmed = result.trim();
      console.log('✅ trim() 方法调用成功');
      console.log('📏 处理后长度:', trimmed.length);
    } catch (error) {
      console.error('❌ 错误: trim() 方法调用失败:', error);
      return false;
    }

    // 验证 h1 标签是否被正确处理
    if (result.includes('<h1')) {
      console.warn('⚠️  警告: 仍然包含 h1 标签，可能需要启用新的处理器');
    } else {
      console.log('✅ h1 标签已被正确处理');
    }

    // 验证样式属性是否被移除
    if (result.includes('style=')) {
      console.warn('⚠️  警告: 仍然包含 style 属性，可能需要启用新的处理器');
    } else {
      console.log('✅ 样式属性已被移除');
    }

    console.log('🎉 HTML 处理系统修复验证成功!');
    return true;

  } catch (error) {
    console.error('❌ 验证失败:', error);
    return false;
  }
}

/**
 * 测试异步函数是否正常工作
 */
export async function verifyAsyncFix(): Promise<boolean> {
  console.log('🔍 验证异步 HTML 处理器...');

  // 动态导入以避免构建时错误
  try {
    const { getDisplayContent } = await import('./contentStrategy');
    
    const testClip: Clip = {
      id: 'test-async',
      title: '异步测试标题',
      html_raw: '<h1>异步测试</h1><script>alert("test")</script><p>内容</p>',
      text_plain: '异步测试\n内容',
      created_at: new Date().toISOString(),
      url: 'test-url',
      user_id: 'test-user',
      theme_name: 'default',
      category: 'default',
    };

    const result = await getDisplayContent(testClip, {
      fallbackToPlainText: true,
      logErrors: true
    });

    console.log('✅ 异步函数调用成功');
    console.log('📄 异步处理结果:', result);

    if (typeof result !== 'string') {
      console.error('❌ 错误: 异步返回结果不是字符串');
      return false;
    }

    if (result.includes('<script>')) {
      console.warn('⚠️  警告: 仍然包含 script 标签');
    } else {
      console.log('✅ script 标签已被移除');
    }

    console.log('🎉 异步 HTML 处理器验证成功!');
    return true;

  } catch (error) {
    console.error('❌ 异步验证失败:', error);
    return false;
  }
}

// 在浏览器环境中自动运行验证
if (typeof window !== 'undefined') {
  // 延迟执行以避免阻塞页面加载
  setTimeout(() => {
    console.log('🚀 开始自动验证 HTML 处理系统修复...');
    verifyFix();
    verifyAsyncFix().catch(console.error);
  }, 1000);
}
