'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { createClient } from '@/lib/supabase/client'
import { 
  Logo, 
  authTheme, 
  authLocalization, 
  AUTH_PROVIDERS, 
  AUTH_OPTIONS 
} from '../config'
import styles from '../auth.module.css'

function ExtensionAuthContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  
  // 获取URL参数
  const redirectTo = searchParams.get('redirect_to')
  const source = searchParams.get('source')
  const authSuccess = searchParams.get('auth_success')

  // 处理认证成功的逻辑
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAuthSuccess = useCallback(async (session: any) => {
    console.log('🚀 handleAuthSuccess called with session:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      redirectTo,
      hasRedirectTo: !!redirectTo
    })
    
    setIsAuthenticating(true)
    
    try {
      if (redirectTo) {
        // OAuth重定向方式 - 将认证信息附加到重定向URL
        const authData = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at?.toString() || '',
          user: JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email,
            avatar_url: session.user.user_metadata?.avatar_url
          })
        }
        
        const redirectUrl = new URL(redirectTo)
        redirectUrl.hash = new URLSearchParams(authData).toString()
        
        console.log('🔗 重定向详细信息:')
        console.log('- 原始redirectTo:', redirectTo)
        console.log('- 认证数据keys:', Object.keys(authData))
        console.log('- 最终重定向URL:', redirectUrl.href)
        console.log('- Hash部分长度:', redirectUrl.hash.length)
        
        // 添加短暂延迟确保日志输出
        console.log('⏰ 1秒后开始重定向...')
        setTimeout(() => {
          console.log('🎯 正在重定向到:', redirectUrl.href)
          window.location.href = redirectUrl.href
        }, 1000)
      } else {
        console.log('❌ No redirectTo URL found')
        // PostMessage方式（备选方案）
        if (window.opener) {
          console.log('📤 Using postMessage fallback')
          window.opener.postMessage({
            type: 'AUTH_SUCCESS',
            session: {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
              user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email
              }
            }
          }, '*')
          window.close()
        } else {
          console.log('❌ No window.opener found')
        }
      }
    } catch (error) {
      console.error('❌ Extension auth redirect failed:', error)
      setIsAuthenticating(false)
    }
  }, [redirectTo])

  useEffect(() => {
    console.log('🔍 Extension auth page loaded with params:', {
      source,
      redirectTo,
      authSuccess,
      currentUrl: window.location.href
    })

    // 检查是否来自扩展
    if (source !== 'extension') {
      console.log('❌ Not from extension, redirecting to main auth...')
      router.push('/auth')
      return
    }

    // 标记这是扩展登录，以便callback能够识别
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('isExtensionLogin', 'true')
      console.log('🏷️ Set extension login marker in sessionStorage')
    }

    // 检查当前是否已有活跃会话
    const checkCurrentSession = async () => {
      try {
        console.log('🔄 Checking current session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('✅ Session check result:', {
          hasSession: !!session,
          userEmail: session?.user?.email,
          error: error?.message,
          authSuccess,
          redirectTo
        })
        
        if (session && !error) {
          // 用户已登录，直接处理认证信息返回
          console.log('🎉 Found active session, processing auth success...')
          await handleAuthSuccess(session)
        } else if (authSuccess === 'true') {
          // 如果有auth_success参数但没有立即获取到session，等待一下再重试
          console.log('⏳ Auth success indicated but no session yet, retrying in 500ms...')
          
          // 尝试多次检查，给Supabase更多时间同步
          let retryCount = 0
          const maxRetries = 5
          const retryInterval = setInterval(async () => {
            retryCount++
            console.log(`🔄 Retrying session check (${retryCount}/${maxRetries})...`)
            
            const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession()
            console.log('🔄 Retry result:', {
              hasSession: !!retrySession,
              userEmail: retrySession?.user?.email,
              error: retryError?.message,
              retryCount
            })
            
            if (retrySession && !retryError) {
              console.log('✅ Retry successful, processing auth success...')
              clearInterval(retryInterval)
              await handleAuthSuccess(retrySession)
            } else if (retryCount >= maxRetries) {
              console.log('❌ Max retries reached, session still not available')
              clearInterval(retryInterval)
            }
          }, 1000) // 每秒重试一次
        } else {
          console.log('ℹ️ No active session and no auth_success parameter')
          
          // 如果有redirectTo但没有session，可能是页面直接被访问
          // 检查用户是否已经在主应用中登录了
          if (redirectTo) {
            console.log('🔍 Have redirectTo but no session, checking if user is logged in to main app...')
            // 延迟检查，给Supabase客户端更多时间初始化
            setTimeout(async () => {
              const { data: { session: delayedSession }, error: delayedError } = await supabase.auth.getSession()
              console.log('🔄 Delayed session check:', {
                hasSession: !!delayedSession,
                userEmail: delayedSession?.user?.email,
                error: delayedError?.message
              })
              if (delayedSession && !delayedError) {
                console.log('🎉 Found session in delayed check, processing...')
                await handleAuthSuccess(delayedSession)
              }
            }, 1000)
          }
        }
      } catch (error) {
        console.error('❌ 检查当前会话失败:', error)
      }
    }

    checkCurrentSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Extension auth event:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        await handleAuthSuccess(session)
      }
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticating(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, redirectTo, source, authSuccess, handleAuthSuccess])

  // 如果不是来自扩展，不渲染内容（会被重定向）
  if (source !== 'extension') {
    console.log('❌ 来源检查失败，重定向到主登录页')
    return <div>正在重定向...</div>
  }

  console.log('✅ 来源检查通过，渲染扩展登录页面')

  if (isAuthenticating) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.authWrapper}>
            <div className={styles.authCard}>
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <h2 className={styles.authTitle}>登录成功</h2>
                <p className={styles.authSubtitle}>正在返回扩展...</p>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    ⏳ 正在重定向到扩展，请稍候...
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    如果页面没有自动关闭，请手动关闭此标签页
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('🎨 渲染扩展登录页面UI')
  
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <Logo />
        </div>
        
        <div className={styles.authWrapper}>
          <div className={styles.authCard}>
            <h1 className={styles.authTitle}>Login Marks Clipper Extension</h1>
            <p className={styles.authSubtitle}>
              Use your account to login to Marks Clipper Extension
            </p>
            
            <Auth
              supabaseClient={supabase}
              providers={AUTH_PROVIDERS}
              appearance={{
                ...authTheme,
                className: {
                  container: styles.supabaseContainer,
                  button: styles.supabaseButton,
                  input: styles.supabaseInput,
                  label: styles.supabaseLabel,
                  anchor: styles.supabaseAnchor,
                  divider: styles.supabaseDivider,
                  message: styles.supabaseMessage,
                },
              }}
              showLinks={AUTH_OPTIONS.showLinks}
              localization={authLocalization}
              redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}

            />
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-center" style={{ color: '#71717A' }}>
                💡 After login, you will be redirected to the extension
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExtensionAuthPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.authWrapper}>
            <div className={styles.authCard}>
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <h2 className={styles.authTitle}>加载中...</h2>
                <p className={styles.authSubtitle}>正在准备登录页面</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ExtensionAuthContent />
    </Suspense>
  )
} 