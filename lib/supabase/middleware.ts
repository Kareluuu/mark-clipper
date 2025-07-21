import { createMiddlewareClient as createSupabaseMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '../types/database'
import { NextRequest, NextResponse } from 'next/server'

// 中间件 Supabase 实例
// 用于：路由保护、会话刷新、重定向逻辑
export const createMiddlewareClient = (req: NextRequest, res: NextResponse) => {
  return createSupabaseMiddlewareClient<Database>({ req, res })
}

// 中间件辅助函数
export const updateSession = async (req: NextRequest) => {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createMiddlewareClient(req, res)

  // 刷新会话（如果过期会自动刷新）
  await supabase.auth.getSession()

  return res
}

// 路由保护辅助函数
export const protectedRoute = async (req: NextRequest, redirectTo = '/login') => {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createMiddlewareClient(req, res)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 如果没有会话，重定向到登录页
  if (!session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = redirectTo
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
} 