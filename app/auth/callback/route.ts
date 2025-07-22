import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const type = searchParams.get('type') // 邮箱确认类型
  // 如果 "next" 存在，使用它作为重定向 URL，否则使用根路径
  const next = searchParams.get('next') ?? '/'

  console.log('🔗 Auth callback received:', {
    code: !!code,
    error,
    errorDescription,
    type,
    next,
    fullUrl: request.url
  })

  // 如果有错误参数，记录并重定向到错误页面
  if (error) {
    console.error('❌ Auth callback error:', error, errorDescription)
    const errorUrl = new URL(`${origin}/auth/auth-code-error`)
    errorUrl.searchParams.set('error', error)
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(errorUrl.toString())
  }

  if (code) {
    const supabase = createRouteClient()
    console.log('🔄 Exchanging code for session...')
    
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError && data.session) {
      console.log('✅ Auth callback success:', data.user?.email)
      
      // 如果是邮箱确认类型，显示特殊成功消息
      if (type === 'signup' || type === 'email') {
        console.log('📧 Email confirmation successful')
        // 可以重定向到一个特殊的确认成功页面
        // 或者在首页显示成功消息
      }
      
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
    } else {
      console.error('❌ Code exchange failed:', exchangeError)
      const errorUrl = new URL(`${origin}/auth/auth-code-error`)
      if (exchangeError?.message) {
        errorUrl.searchParams.set('error', 'exchange_failed')
        errorUrl.searchParams.set('error_description', exchangeError.message)
      }
      return NextResponse.redirect(errorUrl.toString())
    }
  } else {
    console.log('⚠️ No code parameter found in callback')
  }

  // 返回用户到错误页面，显示他们无法登录
  const errorUrl = new URL(`${origin}/auth/auth-code-error`)
  errorUrl.searchParams.set('error', 'missing_code')
  errorUrl.searchParams.set('error_description', '缺少认证代码参数')
  return NextResponse.redirect(errorUrl.toString())
} 