import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { productImage, referenceImage } = await req.json();

  if (!productImage || !referenceImage) {
    return NextResponse.json({ error: 'Missing image inputs' }, { status: 400 });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a creative AI that writes prompts for AI image generation tools.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Use Image A as the product. Use Image B as the visual style reference. Write a detailed prompt for generating a stylized product photoshoot image.',
            },
            {
              type: 'image_url',
              image_url: {
                url: productImage,
              },
            },
            {
              type: 'image_url',
              image_url: {
                url: referenceImage,
              },
            },
          ],
        },
      ],
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: result.error?.message || 'OpenAI API error' }, { status: 400 });
  }

  const prompt = result.choices?.[0]?.message?.content || 'No prompt generated.';
  return NextResponse.json({ prompt });
}
