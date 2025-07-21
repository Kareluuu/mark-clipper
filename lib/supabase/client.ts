import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '../types/database'

// 客户端 Supabase 实例
// 用于：实时订阅、用户交互、客户端组件
export const createClient = () => createClientComponentClient<Database>()

// 默认客户端实例
export const supabase = createClient() 