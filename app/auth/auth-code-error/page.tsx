'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '../config'
import styles from '../auth.module.css'

function AuthCodeErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const getErrorMessage = () => {
    if (error === 'access_denied') {
      return 'You denied the authorization request, or the email verification link has expired.'
    }
    if (errorDescription) {
      return errorDescription
    }
    return 'An unknown error occurred during the login process.'
  }

  const getErrorSolution = () => {
    if (error === 'access_denied') {
      return 'Please register again or check your email for a new verification email.'
    }
    if (errorDescription?.includes('expired')) {
      return 'The verification link has expired. Please register again to get a new verification email.'
    }
    return 'Please try again or contact technical support.'
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <Logo />
        </div>
        
        <div className={styles.authWrapper}>
          <div className={styles.authCard}>
            <h1 className={styles.authTitle}>Login Failed</h1>
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
                  Error Details:
                </p>
                <p style={{ margin: '0', color: '#7f1d1d' }}>
                  {error}: {errorDescription || 'Unknown error'}
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
                💡 Solution:
              </p>
              <p style={{ margin: '0', color: '#075985' }}>
                {getErrorSolution()}
              </p>
            </div>
            
            <button
              onClick={() => router.push('/auth')}
              className={styles.retryButton}
            >
              Back to Login Page
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
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <Logo />
        </div>
        
        <div className={styles.authWrapper}>
          <div className={styles.authCard}>
            <h1 className={styles.authTitle}>Loading...</h1>
            <p className={styles.authSubtitle}>
              Processing your request, please wait...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCodeErrorContent />
    </Suspense>
  )
} 