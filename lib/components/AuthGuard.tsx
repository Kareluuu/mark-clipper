'use client'

import React from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean // 是否需要认证，默认true
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 如果不需要认证，直接渲染子组件
    if (!requireAuth) return

    // 等待认证状态加载完成
    if (loading) return

    // 如果需要认证但用户未登录，且当前不在认证相关页面
    if (!user && !pathname.startsWith('/auth')) {
      router.push('/auth')
      return
    }

    // 如果用户已登录但在认证页面，重定向到首页
    // 但允许扩展专用页面正常工作
    if (user && pathname.startsWith('/auth') && pathname !== '/auth/extension') {
      router.push('/')
      return
    }
  }, [user, loading, pathname, router, requireAuth])

  // 显示加载状态
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#fafafa'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e4e4e7',
            borderTop: '3px solid #18181b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{
            color: '#52525b',
            fontSize: '14px'
          }}>
            加载中...
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // 如果需要认证但用户未登录，不渲染内容（等待重定向）
  if (requireAuth && !user && !pathname.startsWith('/auth')) {
    return null
  }

  // 如果用户已登录但在认证页面，不渲染内容（等待重定向）
  // 但允许扩展专用页面正常工作
  if (user && pathname.startsWith('/auth') && pathname !== '/auth/extension') {
    return null
  }

  return <>{children}</>
} 