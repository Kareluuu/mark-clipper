'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import styles from './UserMenu.module.css'

export default function UserMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    setDropdownOpen(false)
  }

  const handleSignIn = () => {
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className={styles.userMenu}>
        <div className={styles.loadingDot}></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.userMenu}>
        <button 
          onClick={handleSignIn}
          className={styles.signInButton}
        >
          登录
        </button>
      </div>
    )
  }

  return (
    <div className={styles.userMenu}>
      <div className={styles.dropdown}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={styles.userButton}
        >
          <div className={styles.userAvatar}>
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        </button>
        
        {dropdownOpen && (
          <div className={styles.dropdownContent}>
            <div className={styles.userInfo}>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
            <hr className={styles.divider} />
            <button
              onClick={handleSignOut}
              className={styles.signOutButton}
            >
              登出
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 