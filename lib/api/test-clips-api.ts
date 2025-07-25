// 这是一个测试文件，用于验证clips API的功能
// 在开发环境中可以用来快速测试API端点

import { updateClip, deleteClip, ApiError } from './clips';

// 测试updateClip函数
export async function testUpdateClip() {
  console.log('\n🧪 测试updateClip API...');
  
  try {
    // 测试有效的更新
    const result = await updateClip(1, {
      text_plain: '这是一个测试更新的内容',
      title: '测试标题'
    });
    
    console.log('✅ updateClip测试成功:', result);
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(`❌ updateClip测试失败 (${error.status}):`, error.message);
      if (error.details) {
        console.log('详细信息:', error.details);
      }
    } else {
      console.log('❌ updateClip测试异常:', error);
    }
    return false;
  }
}

// 测试deleteClip函数
export async function testDeleteClip() {
  console.log('\n🧪 测试deleteClip API...');
  
  try {
    await deleteClip(999); // 使用不存在的ID进行测试
    console.log('✅ deleteClip测试成功');
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      console.log(`❌ deleteClip测试失败 (${error.status}):`, error.message);
      // 404错误是预期的，因为我们使用了不存在的ID
      if (error.status === 404) {
        console.log('✅ 404错误是预期的（不存在的clip ID）');
        return true;
      }
    } else {
      console.log('❌ deleteClip测试异常:', error);
    }
    return false;
  }
}

// 测试输入验证
export async function testValidation() {
  console.log('\n🧪 测试输入验证...');
  
  const tests = [
    {
      name: '空内容验证',
      data: { text_plain: '' },
      expectedError: true
    },
    {
      name: '非字符串内容验证',
      data: { text_plain: 123 as unknown },
      expectedError: true
    },
    {
      name: '缺少text_plain字段',
      data: { title: '只有标题' },
      expectedError: true
    },
    {
      name: '无效clip ID',
      clipId: -1,
      data: { text_plain: '测试内容' },
      expectedError: true
    }
  ];

  let passedTests = 0;
  
  for (const test of tests) {
    try {
      const clipId = test.clipId || 1;
      await updateClip(clipId, test.data as Record<string, unknown>);
      
      if (test.expectedError) {
        console.log(`❌ ${test.name}: 期望错误但成功了`);
      } else {
        console.log(`✅ ${test.name}: 成功`);
        passedTests++;
      }
    } catch (error) {
      if (test.expectedError) {
        console.log(`✅ ${test.name}: 正确捕获了验证错误`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: 意外的错误 -`, error instanceof Error ? error.message : error);
      }
    }
  }
  
  console.log(`\n📊 验证测试结果: ${passedTests}/${tests.length} 通过`);
  return passedTests === tests.length;
}

// 运行所有测试
export async function runAllTests() {
  console.log('🚀 开始运行Clips API测试套件...');
  
  const results = {
    update: await testUpdateClip(),
    delete: await testDeleteClip(),
    validation: await testValidation()
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).length;
  
  console.log('\n📋 测试总结:');
  console.log(`✅ 通过: ${passed}/${total}`);
  console.log(`❌ 失败: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️ 部分测试失败，请检查API实现');
  }
  
  return passed === total;
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && require.main === module) {
  runAllTests().catch(console.error);
} 