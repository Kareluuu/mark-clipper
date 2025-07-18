import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// CORS 头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET() {
  const { data, error } = await supabase
    .from('clips')
    .select('id, title, text_plain')
    .order('id', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json(data, { headers: corsHeaders });
}

export async function POST(request: Request) {
  const body = await request.json();
  // 支持单条或多条插入
  const records = Array.isArray(body) ? body : [body];
  const { data, error } = await supabase
    .from('clips')
    .insert(records)
    .select('id, title, text_plain');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json(data, { status: 201, headers: corsHeaders });
} 