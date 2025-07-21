import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteClient } from '@/lib/supabase/server'

// 认证结果接口
export interface AuthResult {
  success: boolean
  userId?: string
  userEmail?: string
  error?: string
}

// 统一的API认证验证函数
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    // 策略1: 优先检查 Authorization header (Bearer Token) - 给扩展使用
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7) // 移除 "Bearer " 前缀
      
      // 使用 service role 客户端验证 JWT token
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        console.log('Bearer Token 验证失败:', error?.message)
        // 继续尝试 Cookie 认证
      } else {
        console.log('✅ Bearer Token 认证成功:', user.email)
        return {
          success: true,
          userId: user.id,
          userEmail: user.email || ''
        }
      }
    }

    // 策略2: 回退检查 Cookie 认证 (给主应用使用)
    // 先检查中间件注入的用户信息
    const userIdFromHeader = request.headers.get('x-user-id')
    const userEmailFromHeader = request.headers.get('x-user-email')
    
    if (userIdFromHeader) {
      console.log('✅ Cookie 认证成功 (来自中间件):', userEmailFromHeader)
      return {
        success: true,
        userId: userIdFromHeader,
        userEmail: userEmailFromHeader || ''
      }
    }

    // 作为备选方案，直接验证 Cookie
    try {
      const supabase = createRouteClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.log('Cookie 认证失败:', error?.message)
      } else {
        console.log('✅ Cookie 认证成功 (直接验证):', user.email)
        return {
          success: true,
          userId: user.id,
          userEmail: user.email || ''
        }
      }
    } catch (cookieError) {
      console.log('Cookie 验证异常:', cookieError)
    }

    // 策略3: 都无效时返回失败
    return {
      success: false,
      error: 'Authentication required. Please provide valid Bearer token or login cookies.'
    }

  } catch (error) {
    console.error('认证过程异常:', error)
    return {
      success: false,
      error: 'Authentication process failed'
    }
  }
}

// 创建带认证的 Supabase 客户端
export function createAuthenticatedClient(userId: string) {
  // 使用 service role 客户端，但会自动添加 RLS 过滤
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'x-user-id': userId
        }
      }
    }
  )
}

// 错误响应辅助函数
export function createAuthErrorResponse(message: string = 'Unauthorized') {
  return new Response(
    JSON.stringify({ 
      error: message,
      code: 'AUTHENTICATION_REQUIRED' 
    }),
    { 
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  )
} 