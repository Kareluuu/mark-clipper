import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authenticateRequest, createAuthErrorResponse } from '@/lib/api/auth';

// CORS 头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    // 获取当前用户的所有不同的category值
    const { data, error } = await supabase
      .from('clips')
      .select('category')
      .eq('user_id', authResult.userId!)
      .not('category', 'is', null);

    if (error) {
      console.error('数据库查询错误:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message }, 
        { status: 500, headers: corsHeaders }
      );
    }

    // 去重并排序category列表，排除系统保留的"default"值
    const categories = [...new Set(data?.map(item => item.category) || [])]
      .filter(category => 
        category && 
        category.trim() !== '' && 
        category.toLowerCase() !== 'default' // 排除default值，因为它有专门的"No category"按钮
      )
      .sort(); // 按字母顺序排序

    console.log(`✅ 用户 ${authResult.userEmail} 获取了 ${categories.length} 个不同的 categories`);
    return NextResponse.json(categories, { headers: corsHeaders });

  } catch (error) {
    console.error('GET /api/categories 异常:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
} 