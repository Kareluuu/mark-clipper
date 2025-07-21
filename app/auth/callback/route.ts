import { createRouteClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 如果 "next" 存在，使用它作为重定向 URL，否则使用根路径
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createRouteClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // 原始主机
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // 我们可以安全地重定向到本地主机
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // 返回用户到错误页面，显示他们无法登录
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 