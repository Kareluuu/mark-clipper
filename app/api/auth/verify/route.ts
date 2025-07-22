import { createRouteClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return Response.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }
    
    const token = authorization.substring(7)
    const supabase = createRouteClient()
    
    // 使用提供的token验证用户
    const { data: user, error } = await supabase.auth.getUser(token)
    
    if (error) {
      console.error('Token verification failed:', error.message)
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    if (!user.user) {
      return Response.json({ error: 'User not found' }, { status: 401 })
    }
    
    // 返回用户信息（不包含敏感数据）
    return Response.json({
      user: {
        id: user.user.id,
        email: user.user.email,
        name: user.user.user_metadata?.name || user.user.email,
        created_at: user.user.created_at,
        last_sign_in_at: user.user.last_sign_in_at
      }
    })
  } catch (error) {
    console.error('Auth verification error:', error)
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json()
    
    if (!access_token || !refresh_token) {
      return Response.json({ error: 'Missing tokens' }, { status: 400 })
    }
    
    const supabase = createRouteClient()
    
    // 设置会话并验证
    const { data: sessionData, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })
    
    if (error) {
      console.error('Session validation failed:', error.message)
      return Response.json({ error: 'Invalid session' }, { status: 401 })
    }
    
    if (!sessionData.user) {
      return Response.json({ error: 'User not found' }, { status: 401 })
    }
    
    return Response.json({
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.user_metadata?.name || sessionData.user.email,
        created_at: sessionData.user.created_at,
        last_sign_in_at: sessionData.user.last_sign_in_at
      },
      session: {
        access_token: sessionData.session?.access_token,
        refresh_token: sessionData.session?.refresh_token,
        expires_at: sessionData.session?.expires_at
      }
    })
  } catch (error) {
    console.error('Session verification error:', error)
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
} 