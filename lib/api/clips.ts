import { Clip } from '@/lib/useClips';

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
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
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
      throw new ApiError('认证已过期，请重新登录', 401);
    }

    // 处理其他错误状态
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status} ${response.statusText}` };
      }

      throw new ApiError(
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
    
    if (error instanceof ApiError) {
      throw error;
    }

    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      throw new ApiError('请求超时，请检查网络连接', 408);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ApiError('网络请求失败，请检查网络连接', 0, errorMessage);
  }
}

// 更新clip的API函数
export async function updateClip(
  clipId: number,
  updates: Partial<Pick<Clip, 'text_plain' | 'title' | 'url' | 'theme_name' | 'html_raw'>>
): Promise<Clip> {
  console.log(`📡 发送更新请求到 clip ${clipId}:`, {
    fields: Object.keys(updates),
    text_length: updates.text_plain?.length || 0
  });

  // 前端验证
  if (!clipId || clipId <= 0) {
    throw new ApiError('无效的clip ID', 400);
  }

  if (!updates.text_plain || typeof updates.text_plain !== 'string') {
    throw new ApiError('text_plain字段是必需的且必须是字符串', 400);
  }

  if (updates.text_plain.trim().length === 0) {
    throw new ApiError('内容不能为空', 400);
  }

  const response = await apiRequest<{ data: Clip; message: string }>(
    `${API_BASE}/api/clips/${clipId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    }
  );

  console.log(`✅ Clip ${clipId} 更新成功`);
  return response.data;
}

// 删除clip的API函数（提取现有逻辑）
export async function deleteClip(clipId: number): Promise<void> {
  console.log(`📡 发送删除请求到 clip ${clipId}`);

  if (!clipId || clipId <= 0) {
    throw new ApiError('无效的clip ID', 400);
  }

  await apiRequest<{ message: string }>(
    `${API_BASE}/api/clips/${clipId}`,
    {
      method: 'DELETE',
    }
  );

  console.log(`✅ Clip ${clipId} 删除成功`);
}

// 获取所有clips的API函数（为将来可能的需求）
export async function fetchClips(): Promise<Clip[]> {
  console.log('📡 获取clips列表');

  const response = await apiRequest<Clip[]>(`${API_BASE}/api/clips`);
  
  console.log(`✅ 成功获取 ${response.length} 条clips`);
  return response;
}

// 创建新clip的API函数（为将来可能的需求）
export async function createClip(
  clipData: Pick<Clip, 'text_plain' | 'title' | 'url'> & { theme_name?: string }
): Promise<Clip> {
  console.log('📡 创建新clip:', {
    title: clipData.title,
    text_length: clipData.text_plain?.length || 0
  });

  if (!clipData.text_plain || typeof clipData.text_plain !== 'string') {
    throw new ApiError('text_plain字段是必需的且必须是字符串', 400);
  }

  const response = await apiRequest<{ data: Clip }>(
    `${API_BASE}/api/clips`,
    {
      method: 'POST',
      body: JSON.stringify(clipData),
    }
  );

  console.log('✅ 新clip创建成功');
  return response.data;
} 