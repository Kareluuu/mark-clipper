'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/lib/components/AuthGuard'
import logoStyles from '../components/Logo.module.css'
import styles from './auth.module.css'

function Logo() {
  return (
    <div className={logoStyles.logo}>
      <img 
        alt="logo" 
        className={logoStyles.logoImage} 
        src="/markat_logo.svg" 
      />
    </div>
  )
}

export default function AuthPage() {
  const supabase = createClient()

  return (
    <AuthGuard requireAuth={false}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logoContainer}>
            <Logo />
          </div>
          
          <div className={styles.authWrapper}>
            <div className={styles.authCard}>
              <h1 className={styles.authTitle}>欢迎回来</h1>
              <p className={styles.authSubtitle}>登录您的账户以继续使用 Mark Clipper</p>
              
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#18181b',
                        brandAccent: '#27272a',
                        brandButtonText: 'white',
                        defaultButtonBackground: '#fafafa',
                        defaultButtonBackgroundHover: '#f4f4f5',
                        defaultButtonBorder: '#e4e4e7',
                        defaultButtonText: '#18181b',
                        dividerBackground: '#e4e4e7',
                        inputBackground: '#fafafa',
                        inputBorder: '#e4e4e7',
                        inputBorderHover: '#d4d4d8',
                        inputBorderFocus: '#18181b',
                        inputText: '#18181b',
                        inputLabelText: '#52525b',
                        inputPlaceholder: '#a1a1aa',
                        messageText: '#52525b',
                        messageTextDanger: '#ef4444',
                        anchorTextColor: '#18181b',
                        anchorTextHoverColor: '#27272a',
                      },
                      space: {
                        spaceSmall: '4px',
                        spaceMedium: '8px',
                        spaceLarge: '16px',
                        labelBottomMargin: '8px',
                        anchorBottomMargin: '4px',
                        emailInputSpacing: '4px',
                        buttonPadding: '10px 15px',
                        inputPadding: '10px 15px',
                      },
                      fontSizes: {
                        baseBodySize: '14px',
                        baseInputSize: '14px',
                        baseLabelSize: '14px',
                        baseButtonSize: '14px',
                      },
                      fonts: {
                        bodyFontFamily: `'Geist', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`,
                        buttonFontFamily: `'Geist', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`,
                        inputFontFamily: `'Geist', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`,
                        labelFontFamily: `'Geist', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`,
                      },
                      borderWidths: {
                        buttonBorderWidth: '1px',
                        inputBorderWidth: '1px',
                      },
                      radii: {
                        borderRadiusButton: '6px',
                        buttonBorderRadius: '6px',
                        inputBorderRadius: '6px',
                      },
                    },
                  },
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
                onlyThirdPartyProviders={false}
                magicLink={true}
                view="sign_in"
                showLinks={true}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: '邮箱地址',
                      password_label: '密码',
                      email_input_placeholder: '输入您的邮箱地址',
                      password_input_placeholder: '输入您的密码',
                      button_label: '登录',
                      loading_button_label: '登录中...',
                      link_text: '已有账户？点击登录',
                    },
                    sign_up: {
                      email_label: '邮箱地址',
                      password_label: '密码',
                      email_input_placeholder: '输入您的邮箱地址',
                      password_input_placeholder: '创建密码',
                      button_label: '注册',
                      loading_button_label: '注册中...',
                      link_text: '没有账户？点击注册',
                    },
                    magic_link: {
                      email_input_label: '邮箱地址',
                      email_input_placeholder: '输入您的邮箱地址',
                      button_label: '发送魔法链接',
                      loading_button_label: '发送中...',
                      link_text: '发送魔法链接邮件',
                    },
                    forgotten_password: {
                      email_label: '邮箱地址',
                      email_input_placeholder: '输入您的邮箱地址',
                      button_label: '发送重置邮件',
                      loading_button_label: '发送中...',
                      link_text: '忘记密码？',
                    },
                    update_password: {
                      password_label: '新密码',
                      password_input_placeholder: '输入您的新密码',
                      button_label: '更新密码',
                      loading_button_label: '更新中...',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
} 