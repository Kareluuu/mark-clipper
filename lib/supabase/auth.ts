import { User, Session } from '@supabase/supabase-js'
import { createClient } from './client'
import { createServerClient } from './server'

// 客户端认证辅助函数
export const auth = {
  // 获取当前用户
  getCurrentUser: async (): Promise<User | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // 获取当前会话
  getCurrentSession: async (): Promise<Session | null> => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // 登录
  signIn: async (email: string, password: string) => {
    const supabase = createClient()
    return await supabase.auth.signInWithPassword({ email, password })
  },

  // 注册
  signUp: async (email: string, password: string) => {
    const supabase = createClient()
    return await supabase.auth.signUp({ email, password })
  },

  // 登出
  signOut: async () => {
    const supabase = createClient()
    return await supabase.auth.signOut()
  },

  // Google OAuth 登录
  signInWithGoogle: async () => {
    const supabase = createClient()
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
  }
}

// 服务端认证辅助函数
export const serverAuth = {
  // 获取服务端用户
  getCurrentUser: async (): Promise<User | null> => {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // 获取服务端会话
  getCurrentSession: async (): Promise<Session | null> => {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
} 