'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import styles from './UserMenu.module.css'

export default function UserMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [navWidth, setNavWidth] = useState<number | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 检测是否为桌面端
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkIsDesktop()
    window.addEventListener('resize', checkIsDesktop)
    
    return () => window.removeEventListener('resize', checkIsDesktop)
  }, [])

  const handleCloseDropdown = useCallback(() => {
    if (dropdownOpen) {
      setIsClosing(true)
      setTimeout(() => {
        setDropdownOpen(false)
        setIsClosing(false)
      }, 200) // 匹配动画持续时间
    }
  }, [dropdownOpen])

  // 获取Nav宽度
  useEffect(() => {
    const getNavWidth = () => {
      const navElement = document.querySelector('[data-nav]') as HTMLElement
      if (navElement) {
        const rect = navElement.getBoundingClientRect()
        setNavWidth(rect.width)
      }
    }

    // 初始获取
    getNavWidth()

    // 监听窗口大小变化
    window.addEventListener('resize', getNavWidth)

    // 监听DOM变化（Nav可能动态变化）
    const observer = new MutationObserver(getNavWidth)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('resize', getNavWidth)
      observer.disconnect()
    }
  }, [])

  // 点击空白处和其他按钮关闭dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleCloseDropdown()
      }
    }

    // 点击其他按钮关闭dropdown
    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // 检查是否点击了其他按钮（非UserMenu内的按钮）
      if (target.tagName === 'BUTTON' && dropdownRef.current && !dropdownRef.current.contains(target)) {
        handleCloseDropdown()
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('click', handleButtonClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('click', handleButtonClick)
    }
  }, [dropdownOpen, handleCloseDropdown])

  const handleToggleDropdown = useCallback(() => {
    if (dropdownOpen) {
      handleCloseDropdown()
    } else {
      setDropdownOpen(true)
    }
  }, [dropdownOpen, handleCloseDropdown])

  const handleSignOut = async () => {
    await signOut()
    handleCloseDropdown()
  }

  const handleSignIn = () => {
    router.push('/auth')
  }

  // 计算dropdown样式
  const dropdownStyle: React.CSSProperties = {
    width: isDesktop && navWidth ? `${navWidth}px` : undefined,
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
    <div className={styles.userMenu} ref={dropdownRef}>
      <div className={styles.dropdown}>
        <button
          onClick={handleToggleDropdown}
          className={styles.userButton}
        >
          <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <ChevronDown className={styles.chevronIcon} size={16} />
          </div>
        </button>
        
        {dropdownOpen && (
          <div 
            className={`${styles.dropdownContent} ${isClosing ? styles.dropdownContentExit : ''}`}
            style={dropdownStyle}
          >
            <div className={styles.dropdownWrapper}>
              <div className={styles.userInfoWrapper}>
                <div className={styles.userInfoItem}>
                  <div className={styles.userEmail}>{user.email}</div>
                </div>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.signOutWrapper}>
                <button
                  onClick={handleSignOut}
                  className={styles.signOutButton}
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 