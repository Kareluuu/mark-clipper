import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from './lib/supabase/middleware'

// 公开路由白名单 - 无需认证即可访问
const publicRoutes = [
  '/auth',
  '/auth/callback',
  '/auth/auth-code-error',
]

// API 路由前缀
const apiRoutes = [
  '/api',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 创建响应对象
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 创建 Supabase 客户端
  const supabase = createMiddlewareClient(request, response)

  // 刷新会话（如果过期会自动刷新）
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  // 记录认证状态（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 Middleware: ${pathname} - ${session ? `用户: ${session.user.email}` : '未登录'}`)
  }

  // 检查是否为公开路由
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // 检查是否为 API 路由
  const isApiRoute = apiRoutes.some(route => pathname.startsWith(route))

  // 1. API 路由预处理 - 注入 session 信息到 headers
  if (isApiRoute) {
    if (session) {
      // 将用户信息注入到请求头，供 API 路由使用
      response.headers.set('x-user-id', session.user.id)
      response.headers.set('x-user-email', session.user.email || '')
    }
    return response
  }

  // 2. 未登录用户访问受保护页面 → 重定向到 /auth
  if (!session && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    
    console.log(`🚫 重定向未登录用户: ${pathname} → /auth`)
    return NextResponse.redirect(redirectUrl)
  }

  // 3. 已登录用户访问认证页面 → 重定向到主页
  // 但允许扩展专用页面正常工作
  if (session && pathname.startsWith('/auth') && pathname !== '/auth/callback' && pathname !== '/auth/extension') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.delete('redirectedFrom')
    
    console.log(`🏠 重定向已登录用户: ${pathname} → /`)
    return NextResponse.redirect(redirectUrl)
  }

  // 4. 正常访问，返回更新后的响应
  return response
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (favicon 文件)
     * - 静态资源文件 (.svg, .png, .jpg, 等)
     * - public 目录下的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 