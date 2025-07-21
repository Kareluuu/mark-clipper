// 统一导出所有 Supabase 客户端实例
export { createClient, supabase } from './client'
export { createServerClient, createRouteClient } from './server'
export { createMiddlewareClient, updateSession, protectedRoute } from './middleware'
export { auth, serverAuth } from './auth'

// 类型导出
export type { Database } from '../types/database' 