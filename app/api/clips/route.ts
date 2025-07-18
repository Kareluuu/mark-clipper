import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('clips')
    .select('id, title, text_plain')
    .order('id', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
} 