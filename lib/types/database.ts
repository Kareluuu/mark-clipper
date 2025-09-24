// 数据库类型定义 - 数据结构的单一来源
// 您可以使用 Supabase CLI 生成这些类型：
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public

import { ThemeKey } from '@/lib/themes/themeConfig';

export interface Database {
  public: {
    Tables: {
      clips: {
        Row: {
          id: number
          created_at: string               // ISO 时间字符串
          title: string | null             // 数据库允许 null
          text_plain: string | null        // 数据库允许 null
          url: string | null               // 数据库允许 null
          user_id: string                  // 用户 ID（必填）
          theme_name: ThemeKey             // 主题名称
          category: string                 // 分类
          html_raw: string | null          // 原始 HTML 内容（新增字段）
        }
        Insert: {
          id?: number                      // 可选，数据库自动生成
          created_at?: string              // 可选，数据库自动生成
          title?: string | null            // 可选
          text_plain?: string | null       // 可选
          url?: string | null              // 可选
          user_id: string                  // 必填
          theme_name?: ThemeKey            // 可选，有默认值
          category?: string                // 可选，有默认值
          html_raw?: string | null         // 可选（新增字段）
        }
        Update: {
          id?: number
          created_at?: string
          title?: string | null
          text_plain?: string | null
          url?: string | null
          user_id?: string
          theme_name?: ThemeKey
          category?: string
          html_raw?: string | null         // 可选（新增字段）
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