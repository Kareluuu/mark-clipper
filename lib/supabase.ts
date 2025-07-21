// 向后兼容的 Supabase 客户端
// 推荐使用新的客户端实例：lib/supabase/client.ts, server.ts, middleware.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// 传统客户端实例（向后兼容）
export const supabase = createClient(supabaseUrl, supabaseKey);

// 推荐导入新的客户端实例
export { supabase as default } from './supabase/client'; 