/**
 * 浏览器调试脚本 - 检查标题转换功能
 * 在开发者控制台中运行此脚本来测试标题转换
 */

window.debugHeadings = function() {
  console.log('🔍 开始调试标题转换功能...');
  
  // 测试HTML
  const testHtml = '<h1 style="color: red; font-size: 24px;">这是H1标题</h1><h2>这是H2标题</h2><h3>这是H3标题</h3><p>这是段落内容</p>';
  
  console.log('📋 测试HTML:', testHtml);
  
  // 测试1: 简单正则替换
  console.log('\n=== 测试1: 简单正则替换 ===');
  const step1 = testHtml.replace(/<h[1-6]([^>]*)>([\s\S]*?)<\/h[1-6]>/gi, '<h2$1>$2</h2>');
  console.log('结果1 (标题标准化):', step1);
  console.log('✅ h1→h2转换:', !step1.includes('<h1') && step1.includes('<h2'));
  
  // 测试2: 样式移除
  console.log('\n=== 测试2: 样式移除 ===');
  const step2 = step1.replace(/\sstyle="[^"]*"/gi, '');
  console.log('结果2 (样式移除):', step2);
  console.log('✅ 样式移除:', !step2.includes('style='));
  
  // 测试3: 脚本移除
  console.log('\n=== 测试3: 脚本移除 ===');
  const testWithScript = step2 + '<script>alert("test")</script>';
  const step3 = testWithScript.replace(/<script[\s\S]*?<\/script>/gi, '');
  console.log('结果3 (脚本移除):', step3);
  console.log('✅ 脚本移除:', !step3.includes('<script'));
  
  // 测试4: 检查当前页面中的clips
  console.log('\n=== 测试4: 检查当前页面clips ===');
  
  // 尝试获取任何包含h1的元素
  const h1Elements = document.querySelectorAll('[class*="card"] h1, [class*="Card"] h1');
  console.log('🔍 页面中的h1元素数量:', h1Elements.length);
  
  if (h1Elements.length > 0) {
    h1Elements.forEach((el, index) => {
      console.log(`h1元素 ${index + 1}:`, {
        文本: el.textContent,
        HTML: el.outerHTML,
        父元素: el.parentElement?.className
      });
    });
  }
  
  // 查找所有Card组件
  const cardElements = document.querySelectorAll('[class*="card"], [class*="Card"]');
  console.log('🔍 页面中的Card元素数量:', cardElements.length);
  
  if (cardElements.length > 0) {
    cardElements.forEach((card, index) => {
      const h1InCard = card.querySelector('h1');
      const h2InCard = card.querySelector('h2');
      if (h1InCard || h2InCard) {
        console.log(`Card ${index + 1}:`, {
          hasH1: !!h1InCard,
          hasH2: !!h2InCard,
          h1Text: h1InCard?.textContent,
          h2Text: h2InCard?.textContent
        });
      }
    });
  }
  
  console.log('\n🎉 调试完成! 如果看到h1元素仍然存在，说明转换没有生效。');
  
  return {
    originalHtml: testHtml,
    afterHeadingNormalization: step1,
    afterStyleRemoval: step2,
    afterScriptRemoval: step3,
    h1ElementsInPage: h1Elements.length,
    cardElementsInPage: cardElements.length
  };
};

// 自动运行一次
setTimeout(() => {
  if (typeof window !== 'undefined' && window.debugHeadings) {
    console.log('🚀 自动运行标题调试脚本...');
    console.log('💡 你也可以手动运行: debugHeadings()');
    window.debugHeadings();
  }
}, 3000);
