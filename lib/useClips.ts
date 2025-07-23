import useSWR from 'swr';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ThemeKey } from '@/lib/themes/themeConfig';

// 更新的 Clip 接口，匹配 API 返回格式
export interface Clip {
  id: number;
  title: string;
  text_plain: string;
  created_at: string; // API 现在总是返回这个字段
  url?: string; // 可选字段
  theme_name: ThemeKey; // 新增
  // 不包含 user_id，因为 API 已经过滤了
}

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

export function useClips() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // 创建带认证的 fetcher
  const authenticatedFetcher = useCallback(
    (url: string) => createAuthenticatedFetcher(signOut, router)(url),
    [signOut, router]
  );

  // 使用 SWR，但只有在用户已认证时才请求
  const swrResult = useSWR<Clip[]>(
    // 关键：只有当用户存在时才设置 key，否则为 null（SWR 不会请求）
    user && !authLoading ? `/api/clips` : null,
    authenticatedFetcher,
    {
      // SWR 配置选项
      revalidateOnFocus: true, // 窗口获得焦点时重新验证
      revalidateOnReconnect: true, // 网络重连时重新验证
      errorRetryCount: 2, // 错误时重试 2 次
      errorRetryInterval: 1000, // 重试间隔 1 秒
      dedupingInterval: 5000, // 5 秒内的重复请求会被去重
      
      // 错误处理
      onError: (error) => {
        if (error instanceof AuthError) {
          console.log('认证错误已处理，用户将被重定向到登录页');
        } else {
          console.error('数据获取错误:', error.message);
        }
      },

      // 成功时的回调
      onSuccess: (data) => {
        console.log(`🔄 数据刷新成功，获取到 ${data.length} 条 clips`);
      },
    }
  );

  return {
    ...swrResult,
    // 增强的状态信息
    isAuthenticated: !!user,
    isAuthLoading: authLoading,
  };
} 