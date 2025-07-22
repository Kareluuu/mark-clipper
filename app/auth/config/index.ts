// 统一导出所有认证相关配置
export { authTheme } from '../auth-theme'
export { authLocalization } from '../auth-localization'
export { Logo } from '../components/Logo'

// 认证配置常量
export const AUTH_PROVIDERS = ['google']
export const AUTH_OPTIONS = {
  showLinks: true,
  requireAuth: false,
} as const 