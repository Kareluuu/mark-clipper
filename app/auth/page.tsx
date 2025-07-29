'use client'

import { Auth } from '@supabase/auth-ui-react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/lib/components/AuthGuard'
import { 
  Logo, 
  authTheme, 
  authLocalization, 
  AUTH_PROVIDERS, 
  AUTH_OPTIONS 
} from './config'
import styles from './auth.module.css'

export default function AuthPage() {
  const supabase = createClient()

  return (
    <AuthGuard requireAuth={AUTH_OPTIONS.requireAuth}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logoContainer}>
            <Logo />
          </div>
          
          <div className={styles.authWrapper}>
            <div className={styles.authCard}>
              <h1 className={styles.authTitle}>Your mark assistant.</h1>
              {/* <p className={styles.authSubtitle}>Sign in to your account to continue using Mark Anytime</p> */}
              
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
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 