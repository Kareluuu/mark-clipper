// 数据库类型定义
// 您可以使用 Supabase CLI 生成这些类型：
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public

import { ThemeKey } from '@/lib/themes/themeConfig';

export interface Database {
  public: {
    Tables: {
      clips: {
        Row: {
          id: number
          created_at: string
          title: string | null
          text_plain: string | null
          url: string | null
          user_id: string
          theme_name: ThemeKey
        }
        Insert: {
          id?: number
          created_at?: string
          title?: string | null
          text_plain?: string | null
          url?: string | null
          user_id: string
          theme_name?: ThemeKey
        }
        Update: {
          id?: number
          created_at?: string
          title?: string | null
          text_plain?: string | null
          url?: string | null
          user_id?: string
          theme_name?: ThemeKey
        }
      }
      // 添加其他表的类型定义...
    }
    Views: {
      // 视图类型定义
      [_: string]: never
    }
    Functions: {
      // 函数类型定义
      [_: string]: never
    }
    Enums: {
      // 枚举类型定义
      [_: string]: never
    }
  }
} 