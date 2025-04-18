import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      style: 'vivid',
      n: 1,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: result.error?.message || 'Failed to generate image' }, { status: 400 });
  }

  const imageUrl = result.data?.[0]?.url;
  return NextResponse.json({ imageUrl });
}
