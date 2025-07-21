// 数据库类型定义
// 您可以使用 Supabase CLI 生成这些类型：
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public

export interface Database {
  public: {
    Tables: {
      clips: {
        Row: {
          id: string
          created_at: string
          title: string | null
          content: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title?: string | null
          content?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string | null
          content?: string | null
          url?: string | null
          user_id?: string | null
        }
      }
      // 添加其他表的类型定义...
    }
    Views: {
      // 视图类型定义
    }
    Functions: {
      // 函数类型定义
    }
    Enums: {
      // 枚举类型定义
    }
  }
} 