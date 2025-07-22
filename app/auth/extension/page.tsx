'use client'

import { useEffect, useState, Suspense } from 'react'
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

  useEffect(() => {
    // 检查是否来自扩展
    if (source !== 'extension') {
      router.push('/auth')
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Extension auth event:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
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
            
            console.log('Redirecting to extension:', redirectUrl.href)
            window.location.href = redirectUrl.href
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
      }
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticating(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, redirectTo, source])

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
              redirectTo={redirectTo || window.location.origin}
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