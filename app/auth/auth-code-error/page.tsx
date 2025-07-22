'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '../config'
import styles from '../auth.module.css'

export default function AuthCodeErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const getErrorMessage = () => {
    if (error === 'access_denied') {
      return '您拒绝了授权请求，或邮箱验证链接已过期。'
    }
    if (errorDescription) {
      return errorDescription
    }
    return '登录过程中出现了未知错误。'
  }

  const getErrorSolution = () => {
    if (error === 'access_denied') {
      return '请重新注册或检查您的邮箱中是否有新的验证邮件。'
    }
    if (errorDescription?.includes('expired')) {
      return '验证链接已过期，请重新注册获取新的验证邮件。'
    }
    return '请重试或联系技术支持。'
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <Logo />
        </div>
        
        <div className={styles.authWrapper}>
          <div className={styles.authCard}>
            <h1 className={styles.authTitle}>登录失败</h1>
            <p className={styles.authSubtitle}>
              {getErrorMessage()}
            </p>
            
            {error && (
              <div style={{ 
                margin: '16px 0', 
                padding: '12px', 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#991b1b' }}>
                  错误详情：
                </p>
                <p style={{ margin: '0', color: '#7f1d1d' }}>
                  {error}: {errorDescription || '未知错误'}
                </p>
              </div>
            )}
            
            <div style={{ 
              margin: '16px 0', 
              padding: '12px', 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #bae6fd',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#0c4a6e' }}>
                💡 解决方案：
              </p>
              <p style={{ margin: '0', color: '#075985' }}>
                {getErrorSolution()}
              </p>
            </div>
            
            <button
              onClick={() => router.push('/auth')}
              className={styles.retryButton}
            >
              返回登录页面
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              重新加载页面
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 