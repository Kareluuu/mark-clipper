import useSWR from 'swr';
import { fetchCategories, CategoriesApiError } from '@/lib/api/categories';

// Categories数据获取hook
export function useCategories() {
  const { 
    data: categories, 
    error, 
    isLoading,
    mutate 
  } = useSWR(
    'categories', // SWR key
    fetchCategories,
    {
      revalidateOnFocus: false, // 不在窗口聚焦时重新验证
      revalidateOnReconnect: true, // 网络重连时重新验证
      dedupingInterval: 60000, // 1分钟内不重复请求
      errorRetryCount: 3, // 错误重试次数
      errorRetryInterval: 2000, // 错误重试间隔2秒
      onError: (error) => {
        if (error instanceof CategoriesApiError) {
          console.error('Categories API错误:', error.message, error.status);
        } else {
          console.error('Categories未知错误:', error);
        }
      },
      onSuccess: (data) => {
        console.log(`✅ 成功获取 ${data?.length || 0} 个categories`);
      }
    }
  );

  return {
    categories: categories || [],
    error,
    isLoading,
    mutate, // 手动重新获取数据的函数
  };
}