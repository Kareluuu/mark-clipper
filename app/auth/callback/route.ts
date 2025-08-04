import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const type = searchParams.get('type') // 邮箱确认类型
  const state = searchParams.get('state') // OAuth状态参数，可能包含扩展信息
  // 如果 "next" 存在，使用它作为重定向 URL，否则使用根路径
  const next = searchParams.get('next') ?? '/'

  // 获取referer信息来判断是否来自扩展
  const referer = request.headers.get('referer')
  
  console.log('🔗 Auth callback received:', {
    code: !!code,
    error,
    errorDescription,
    type,
    state,
    next,
    fullUrl: request.url,
    referer
  })

  // 检查是否来自扩展登录页面
  // 支持多种referer格式：直接referer或者Google OAuth后的referer
  const isFromExtension = referer && (
    referer.includes('/auth/extension') ||
    // 检查state参数中是否包含扩展标识（如果Google OAuth使用state传递）
    (state && state.includes('extension'))
  )
  
  console.log('🔍 Extension detection details:', {
    referer,
    state,
    isFromExtension,
    refererIncludesExtension: referer?.includes('/auth/extension'),
    stateIncludesExtension: state?.includes('extension')
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
      console.log('🔍 Is from extension:', isFromExtension)
      
      // 如果是邮箱确认类型，显示特殊成功消息
      if (type === 'signup' || type === 'email') {
        console.log('📧 Email confirmation successful')
        // 可以重定向到一个特殊的确认成功页面
        // 或者在首页显示成功消息
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // 如果是来自扩展登录，直接重定向回扩展页面
      if (isFromExtension) {
        console.log('🚀 OAuth success from extension, redirecting back to extension auth page')
        const redirectUrl = isLocalEnv ? 
          `${origin}/auth/extension?source=extension&auth_success=true` :
          forwardedHost ? 
            `https://${forwardedHost}/auth/extension?source=extension&auth_success=true` :
            `${origin}/auth/extension?source=extension&auth_success=true`
        
        return NextResponse.redirect(redirectUrl)
      } else {
        // 普通登录，重定向到成功页面或主页
        console.log('✅ OAuth processing complete, redirecting to success page')
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}/auth/callback/success`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}/auth/callback/success`)
        } else {
          return NextResponse.redirect(`${origin}/auth/callback/success`)
        }
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
  errorUrl.searchParams.set('error_description', 'Missing authentication code parameter')
  return NextResponse.redirect(errorUrl.toString())
} 