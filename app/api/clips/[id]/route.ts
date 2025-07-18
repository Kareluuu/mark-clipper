import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 编辑剪藏
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { url, title, text_plain, html_raw, meta } = body;
  const { data, error } = await supabase.from('clips')
    .update({ url, title, text_plain, html_raw, meta, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data[0] });
}

// 删除剪藏
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from('clips').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: 'Deleted successfully' });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, text_plain } = body;
  const { data, error } = await supabase.from('clips').insert([{ title, text_plain }]).select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data[0] });
} 