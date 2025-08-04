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
            name: session.user.user_metadata?.name || session.user.email
          })
        }
        
        const redirectUrl = new URL(redirectTo)
        redirectUrl.hash = new URLSearchParams(authData).toString()
        
        console.log('重定向详细信息:')
        console.log('- 原始redirectTo:', redirectTo)
        console.log('- 认证数据:', authData)
        console.log('- 最终重定向URL:', redirectUrl.href)
        console.log('- Hash部分:', redirectUrl.hash)
        
        // 添加短暂延迟确保日志输出
        setTimeout(() => {
          window.location.href = redirectUrl.href
        }, 1000)
      } else {
        // PostMessage方式（备选方案）
        if (window.opener) {
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
        }
      }
    } catch (error) {
      console.error('Extension auth redirect failed:', error)
      setIsAuthenticating(false)
    }
  }, [redirectTo])

  useEffect(() => {
    // 检查是否来自扩展
    if (source !== 'extension') {
      router.push('/auth')
      return
    }

    // 检查当前是否已有活跃会话
    const checkCurrentSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Current session check:', session?.user?.email, error)
        console.log('Auth success parameter:', authSuccess)
        
        if (session && !error) {
          // 用户已登录，直接处理认证信息返回
          console.log('Found active session, processing auth success...')
          await handleAuthSuccess(session)
        } else if (authSuccess === 'true') {
          // 如果有auth_success参数但没有立即获取到session，等待一下再重试
          console.log('Auth success indicated but no session yet, retrying...')
          setTimeout(async () => {
            const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession()
            if (retrySession && !retryError) {
              console.log('Retry successful, processing auth success...')
              await handleAuthSuccess(retrySession)
            }
          }, 500)
        }
      } catch (error) {
        console.error('检查当前会话失败:', error)
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
    return <div>正在重定向...</div>
  }

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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <Logo />
        </div>
        
        <div className={styles.authWrapper}>
          <div className={styles.authCard}>
            <h1 className={styles.authTitle}>登录 Mark Clipper 扩展</h1>
            <p className={styles.authSubtitle}>
              使用您的账户登录以在浏览器扩展中使用 Mark Clipper
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
              <p className="text-sm text-blue-700">
                💡 登录成功后将自动返回扩展
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