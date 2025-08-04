'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔗 Client-side callback handler started')
        
        // 检查是否是扩展登录
        const isExtensionLogin = sessionStorage.getItem('isExtensionLogin') === 'true'
        console.log('🔍 Extension login check:', isExtensionLogin)
        
        // 处理OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Auth callback error:', error)
          router.push('/auth/auth-code-error')
          return
        }

        if (data.session) {
          console.log('✅ Auth callback success:', data.session.user?.email)
          
          if (isExtensionLogin) {
            console.log('🚀 Redirecting to extension auth page')
            // 清除标记
            sessionStorage.removeItem('isExtensionLogin')
            // 重定向到扩展页面
            router.push('/auth/extension?source=extension&auth_success=true')
          } else {
            console.log('🏠 Redirecting to home page')
            router.push('/')
          }
        } else {
          console.log('⚠️ No session found, redirecting to auth')
          router.push('/auth')
        }
      } catch (error) {
        console.error('❌ Callback handling failed:', error)
        router.push('/auth/auth-code-error')
      }
    }

    handleCallback()
  }, [router, supabase, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold">Processing authentication...</h2>
        <p className="text-gray-600">Please wait while we complete your login.</p>
      </div>
    </div>
  )
}