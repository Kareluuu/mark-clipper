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
    
    // 验证clip ID格式
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid clip ID format' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // 解析请求体
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const { url, title, text_plain, html_raw, meta, theme_name } = body;

    // 请求体验证
    const validationErrors: string[] = [];

    // text_plain是编辑的核心字段，必须存在且有意义
    if (text_plain === undefined || text_plain === null) {
      validationErrors.push('text_plain field is required');
    } else if (typeof text_plain !== 'string') {
      validationErrors.push('text_plain must be a string');
    } else if (text_plain.trim().length === 0) {
      validationErrors.push('text_plain cannot be empty or only whitespace');
    } else if (text_plain.length > 50000) { // 设置合理的长度限制
      validationErrors.push('text_plain exceeds maximum length of 50,000 characters');
    }

    // title验证（如果提供）
    if (title !== undefined && title !== null) {
      if (typeof title !== 'string') {
        validationErrors.push('title must be a string');
      } else if (title.length > 500) {
        validationErrors.push('title exceeds maximum length of 500 characters');
      }
    }

    // URL验证（如果提供）
    if (url !== undefined && url !== null) {
      if (typeof url !== 'string') {
        validationErrors.push('url must be a string');
      } else if (url.length > 2000) {
        validationErrors.push('url exceeds maximum length of 2,000 characters');
      }
    }

    // theme_name验证（如果提供）
    if (theme_name !== undefined && theme_name !== null) {
      const validThemes = ['eggshell', 'jasmine', 'maya_blue', 'olivine'];
      if (!validThemes.includes(theme_name)) {
        validationErrors.push(`theme_name must be one of: ${validThemes.join(', ')}`);
      }
    }

    // 如果有验证错误，返回400状态
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors,
          received_fields: Object.keys(body)
        }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // 准备更新数据（只包含有效字段）
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    // 只更新提供的字段
    if (text_plain !== undefined) updateData.text_plain = text_plain.trim();
    if (title !== undefined) updateData.title = title?.trim() || null;
    if (url !== undefined) updateData.url = url?.trim() || null;
    if (html_raw !== undefined) updateData.html_raw = html_raw;
    if (meta !== undefined) updateData.meta = meta;
    if (theme_name !== undefined) updateData.theme_name = theme_name;

    console.log(`🔄 用户 ${authResult.userEmail} 正在更新 clip ${id}`, {
      fields: Object.keys(updateData),
      text_length: text_plain?.length || 0
    });

    // 使用 service role 客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 确保只能编辑自己的 clips
    const { data, error } = await supabase
      .from('clips')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', authResult.userId!) // 用户数据隔离
      .select();

    if (error) {
      console.error('更新 clip 数据库错误:', error);
      return NextResponse.json(
        { 
          error: 'Failed to update clip', 
          details: error.message,
          code: error.code 
        }, 
        { status: 500, headers: corsHeaders }
      );
    }

    if (!data || data.length === 0) {
      console.warn(`用户 ${authResult.userEmail} 尝试更新不存在的 clip ${id}`);
      return NextResponse.json(
        { error: 'Clip not found or access denied' }, 
        { status: 404, headers: corsHeaders }
      );
    }

    console.log(`✅ 用户 ${authResult.userEmail} 成功更新了 clip ${id}`);
    return NextResponse.json(
      { 
        data: data[0],
        message: 'Clip updated successfully' 
      }, 
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('PUT /api/clips/[id] 异常:', error);
    
    // 区分不同类型的错误
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON format' }, 
        { status: 400, headers: corsHeaders }
      );
    }
    
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