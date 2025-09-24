import useSWR from 'swr';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Clip } from '@/lib/types';

// 认证错误类
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// 智能的 fetcher，支持认证和错误处理
const createAuthenticatedFetcher = (signOut: () => Promise<void>, router: ReturnType<typeof useRouter>) => {
  return async (url: string): Promise<Clip[]> => {
    try {
      const response = await fetch(url, {
        credentials: 'include', // 确保发送 cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 处理认证错误
      if (response.status === 401) {
        console.log('🔒 检测到认证错误，清除会话并重定向到登录页');
        
        // 清除认证状态
        await signOut();
        
        // 重定向到登录页
        router.push('/auth');
        
        throw new AuthError('认证已过期，请重新登录');
      }

      // 处理其他 HTTP 错误
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 请求失败: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }

      // 解析响应
      const data = await response.json();
      
      // 验证返回数据格式
      if (!Array.isArray(data)) {
        console.error('API 返回数据格式错误:', data);
        throw new Error('数据格式错误');
      }

      console.log(`✅ 成功获取 ${data.length} 条 clips`);
      return data;

    } catch (error) {
      // 网络错误或其他异常
      if (error instanceof AuthError) {
        throw error; // 重新抛出认证错误
      }
      
      console.error('获取 clips 失败:', error);
      throw new Error('网络请求失败，请检查网络连接');
    }
  };
};

export function useClips(category?: string | null) {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // 创建带认证的 fetcher
  const authenticatedFetcher = useCallback(
    (url: string) => createAuthenticatedFetcher(signOut, router)(url),
    [signOut, router]
  );

  // 构建API URL，包含category参数
  const apiUrl = useMemo(() => {
    if (!user || authLoading) return null;
    
    const baseUrl = '/api/clips';
    if (category && category !== null) {
      return `${baseUrl}?category=${encodeURIComponent(category)}`;
    }
    return baseUrl;
  }, [user, authLoading, category]);

  // 使用 SWR，只负责数据获取，不进行任何转译处理
  const { data, error, mutate, isValidating } = useSWR<Clip[]>(
    apiUrl,
    authenticatedFetcher,
    {
      // SWR 配置选项 - 专注于数据获取性能
      revalidateOnFocus: true,
      revalidateOnReconnect: true, 
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      dedupingInterval: 5000,
      
      // 数据获取的错误处理
      onError: (error) => {
        if (error instanceof AuthError) {
          console.log('认证错误已处理，用户将被重定向到登录页');
        } else {
          console.error('数据获取错误:', error.message);
        }
      },

      // 数据获取成功的回调
      onSuccess: (data) => {
        console.log(`📦 成功获取 ${data.length} 条原始clips数据${category ? ` (category: ${category})` : ''}`);
      },
    }
  );

  // 返回简洁的数据获取状态，不包含任何转译逻辑
  return {
    clips: data || [],
    isLoading: !error && !data,
    isValidating,
    error,
    mutate,
    // 认证状态信息
    isAuthenticated: !!user,
    isAuthLoading: authLoading,
  };
} 