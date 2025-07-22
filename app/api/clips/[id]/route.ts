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

// 编辑剪藏
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 双重认证验证
  const authResult = await authenticateRequest(request);
  
  if (!authResult.success) {
    return createAuthErrorResponse(authResult.error);
  }

  try {
  const { id } = await params;
  const body = await request.json();
  const { url, title, text_plain, html_raw, meta } = body;

    // 使用 service role 客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 确保只能编辑自己的 clips
    const { data, error } = await supabase
      .from('clips')
      .update({ 
        url, 
        title, 
        text_plain, 
        html_raw, 
        meta, 
        updated_at: new Date().toISOString() 
      })
    .eq('id', id)
      .eq('user_id', authResult.userId!) // 用户数据隔离
    .select();

  if (error) {
      console.error('更新 clip 错误:', error);
      return NextResponse.json(
        { error: 'Failed to update clip', details: error.message }, 
        { status: 500, headers: corsHeaders }
      );
  }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Clip not found or access denied' }, 
        { status: 404, headers: corsHeaders }
      );
    }

    console.log(`✅ 用户 ${authResult.userEmail} 更新了 clip ${id}`);
    return NextResponse.json({ data: data[0] }, { headers: corsHeaders });

  } catch (error) {
    console.error('PUT /api/clips/[id] 异常:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

// 删除剪藏
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 双重认证验证
  const authResult = await authenticateRequest(request);
  
  if (!authResult.success) {
    return createAuthErrorResponse(authResult.error);
  }

  try {
  const { id } = await params;

    // 使用 service role 客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 确保只能删除自己的 clips
    const { error, count } = await supabase
      .from('clips')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', authResult.userId!); // 用户数据隔离

  if (error) {
      console.error('删除 clip 错误:', error);
      return NextResponse.json(
        { error: 'Failed to delete clip', details: error.message }, 
        { status: 500, headers: corsHeaders }
      );
  }

    if (count === 0) {
      return NextResponse.json(
        { error: 'Clip not found or access denied' }, 
        { status: 404, headers: corsHeaders }
      );
    }

    console.log(`✅ 用户 ${authResult.userEmail} 删除了 clip ${id}`);
    return NextResponse.json({ message: 'Deleted successfully' }, { headers: corsHeaders });

  } catch (error) {
    console.error('DELETE /api/clips/[id] 异常:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

// 在特定 ID 路由创建新的 clip（通常不使用，但保留兼容性）
export async function POST(request: NextRequest) {
  // 双重认证验证
  const authResult = await authenticateRequest(request);
  
  if (!authResult.success) {
    return createAuthErrorResponse(authResult.error);
  }

  try {
  const body = await request.json();
  const { title, text_plain } = body;

    // 使用 service role 客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 自动注入 user_id
    const { data, error } = await supabase
      .from('clips')
      .insert([{ 
        title, 
        text_plain, 
        user_id: authResult.userId!,
        created_at: new Date().toISOString()
      }])
      .select();

  if (error) {
      console.error('创建 clip 错误:', error);
      return NextResponse.json(
        { error: 'Failed to create clip', details: error.message }, 
        { status: 500, headers: corsHeaders }
      );
  }

    console.log(`✅ 用户 ${authResult.userEmail} 在 [id] 路由创建了新 clip`);
  return NextResponse.json({ data: data[0] }, { status: 201, headers: corsHeaders });

  } catch (error) {
    console.error('POST /api/clips/[id] 异常:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
} 