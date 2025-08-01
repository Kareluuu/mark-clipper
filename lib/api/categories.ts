// Categories API客户端

// API 基础配置
const API_BASE = '';  // 相对路径，由Next.js处理
const DEFAULT_TIMEOUT = 30000; // 30秒超时

// 通用的fetch配置
const defaultFetchOptions: RequestInit = {
  credentials: 'include', // 包含cookies用于认证
  headers: {
    'Content-Type': 'application/json',
  },
};

// API错误类
export class CategoriesApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CategoriesApiError';
  }
}

// 通用的API请求处理函数
async function apiRequest<T>(
  url: string, 
  options: RequestInit = {},
  timeout = DEFAULT_TIMEOUT
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...defaultFetchOptions,
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 处理认证错误
    if (response.status === 401) {
      throw new CategoriesApiError('认证已过期，请重新登录', 401);
    }

    // 处理其他错误状态
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status} ${response.statusText}` };
      }

      throw new CategoriesApiError(
        errorData.error || `请求失败: ${response.status}`,
        response.status,
        errorData.details
      );
    }

    // 解析成功响应
    const data = await response.json();
    return data;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof CategoriesApiError) {
      throw error;
    }

    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw new CategoriesApiError('请求超时，请检查网络连接', 408);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new CategoriesApiError('网络请求失败，请检查网络连接', 0, errorMessage);
  }
}

// 获取所有categories的API函数
export async function fetchCategories(): Promise<string[]> {
  console.log('📡 获取categories列表');

  const response = await apiRequest<string[]>(`${API_BASE}/api/categories`);
  
  console.log(`✅ 成功获取 ${response.length} 个categories`);
  return response;
}