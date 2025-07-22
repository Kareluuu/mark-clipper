'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logoStyles from '../../components/Logo.module.css'
import styles from '../auth.module.css'

function Logo() {
  return (
    <div className={logoStyles.logo}>
      <Image 
        alt="logo" 
        className={logoStyles.logoImage} 
        src="/markat_logo.svg"
        width={120}
        height={40}
        priority
      />
    </div>
  )
}

export default function AuthCodeErrorPage() {
  const router = useRouter()

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
              很抱歉，您的登录过程中出现了错误。请重试。
            </p>
            
            <button
              onClick={() => router.push('/auth')}
              className={styles.retryButton}
            >
              返回登录页面
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 