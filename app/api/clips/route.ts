import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authenticateRequest, createAuthErrorResponse } from '@/lib/api/auth';

// CORS 头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  // 双重认证验证
  const authResult = await authenticateRequest(request);
  
  if (!authResult.success) {
    return createAuthErrorResponse(authResult.error);
  }

  try {
    // 使用 service role 客户端进行数据查询，自动应用 RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 只获取当前用户的 clips，实现数据隔离
  const { data, error } = await supabase
    .from('clips')
      .select('id, title, text_plain, created_at, url')
      .eq('user_id', authResult.userId!)
      .order('created_at', { ascending: false });

  if (error) {
      console.error('数据库查询错误:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clips', details: error.message }, 
        { status: 500, headers: corsHeaders }
      );
  }

    console.log(`✅ 用户 ${authResult.userEmail} 获取了 ${data?.length || 0} 条 clips`);
  return NextResponse.json(data, { headers: corsHeaders });

  } catch (error) {
    console.error('GET /api/clips 异常:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  // 双重认证验证
  const authResult = await authenticateRequest(request);
  
  if (!authResult.success) {
    return createAuthErrorResponse(authResult.error);
  }

  try {
  const body = await request.json();
    
    // 使用 service role 客户端进行数据插入
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 支持单条或多条插入，自动注入 user_id
  const records = Array.isArray(body) ? body : [body];
    const recordsWithUserId = records.map(record => ({
      ...record,
      user_id: authResult.userId!, // 自动注入当前用户ID
      created_at: new Date().toISOString()
    }));

  const { data, error } = await supabase
    .from('clips')
      .insert(recordsWithUserId)
      .select('id, title, text_plain, created_at, url');

  if (error) {
      console.error('数据库插入错误:', error);
      return NextResponse.json(
        { error: 'Failed to create clips', details: error.message }, 
        { status: 500, headers: corsHeaders }
      );
  }

    console.log(`✅ 用户 ${authResult.userEmail} 创建了 ${data?.length || 0} 条 clips`);
  return NextResponse.json(data, { status: 201, headers: corsHeaders });

  } catch (error) {
    console.error('POST /api/clips 异常:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
} 