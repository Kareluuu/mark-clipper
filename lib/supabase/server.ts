import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '../types/database'
import { cookies } from 'next/headers'

// 服务端组件 Supabase 实例
// 用于：服务端组件、SSR
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// API 路由 Supabase 实例  
// 用于：API 路由处理器
export const createRouteClient = () => {
  const cookieStore = cookies()
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
}

// 默认服务端实例
// 注意：不要在模块顶层调用createServerClient()，会导致构建时cookies()错误
// export const supabaseServer = createServerClient() 