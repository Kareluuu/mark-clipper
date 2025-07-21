# Supabase 客户端使用示例

## 1. 客户端组件中使用

```tsx
// app/components/UserProfile.tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <div>
      {user ? (
        <p>欢迎, {user.email}</p>
      ) : (
        <p>请登录</p>
      )}
    </div>
  )
}
```

## 2. 服务端组件中使用

```tsx
// app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: clips } = await supabase
    .from('clips')
    .select('*')
    .eq('user_id', user.id)

  return (
    <div>
      <h1>我的收藏夹</h1>
      {clips?.map(clip => (
        <div key={clip.id}>
          <h2>{clip.title}</h2>
          <p>{clip.content}</p>
        </div>
      ))}
    </div>
  )
}
```

## 3. API 路由中使用

```tsx
// app/api/clips/route.ts
import { createRouteClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: clips, error } = await supabase
    .from('clips')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ clips })
}
```

## 4. 使用认证辅助函数

```tsx
// app/components/LoginForm.tsx
'use client'
import { useState } from 'react'
import { auth } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await auth.signIn(email, password)
    
    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await auth.signInWithProvider('google')
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
      <button type="button" onClick={handleGoogleLogin}>
        使用 Google 登录
      </button>
    </form>
  )
}
```

## 5. 中间件路由保护

```tsx
// middleware.ts
import { NextRequest } from 'next/server'
import { protectedRoute } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 保护 /dashboard 路由
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return await protectedRoute(request, '/login')
  }
  
  // 保护 /api/private 路由
  if (request.nextUrl.pathname.startsWith('/api/private')) {
    return await protectedRoute(request, '/login')
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/private/:path*']
}
```

## 6. 环境变量配置

在 `.env.local` 文件中添加：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
``` 