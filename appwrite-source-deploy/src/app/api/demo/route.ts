import { NextRequest, NextResponse } from 'next/server';
import { groqChat } from '@/ai/groq';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (typeof prompt !== 'string' || prompt.length < 3) {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }
    const content = await groqChat(prompt, { temperature: 0.2 });
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}


