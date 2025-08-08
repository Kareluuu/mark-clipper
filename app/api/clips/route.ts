import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authenticateRequest, createAuthErrorResponse } from '@/lib/api/auth';
import { DEFAULT_THEME } from '@/lib/themes/themeConfig';

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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 构建查询
    let query = supabase
      .from('clips')
      .select('id, title, text_plain, created_at, url, theme_name, category')
      .eq('user_id', authResult.userId!)
      .order('created_at', { ascending: false });

    // 如果提供了category参数，添加筛选条件
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('数据库查询错误:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clips', details: error.message }, 
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`✅ 用户 ${authResult.userEmail} 获取了 ${data?.length || 0} 条 clips${category ? ` (category: ${category})` : ''}`);
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

    // 支持单条或多条插入，自动注入 user_id 和处理 theme_name、category
    const records = Array.isArray(body) ? body : [body];
    const recordsWithUserId = records.map(record => ({
      ...record,
      user_id: authResult.userId!, // 自动注入当前用户ID
      theme_name: record.theme_name || DEFAULT_THEME, // 若缺少 theme_name，回退到默认主题
      category: record.category || 'default', // 若缺少 category，默认为 'default'
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('clips')
      .insert(recordsWithUserId)
      .select('id, title, text_plain, created_at, url, theme_name, category');

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