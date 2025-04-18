import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { productImage, referenceImage } = await req.json();

  if (!productImage || !referenceImage) {
    return NextResponse.json({ error: 'Missing product or reference image' }, { status: 400 });
  }

  try {
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
            content: `You are a professional product photography director specializing in creating DALL-E 3 prompts for commercial product photography.

MOST CRITICAL RESPONSIBILITY:
- Ensure 100% product integrity preservation in the generated images
- DALL-E 3 has a tendency to modify product details, text, logos, and design elements
- Your prompts must explicitly instruct DALL-E to maintain EVERY DETAIL of the product exactly as shown
- Use redundant and explicit preservation instructions throughout the prompt
- Place special emphasis on text preservation, as DALL-E often alters or removes text

Always follow this prompt structure:
1. Begin with mandatory preservation directive
2. Detail the exact scene/environment for the product
3. Specify technical photography parameters
4. End with reinforced preservation instructions`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `
                Create a precise DALL-E 3 prompt that will place the product from Image A into a scene inspired by Image B.
                
                CRITICAL REQUIREMENTS:
                1. The product from Image A must maintain 100% EXACT fidelity:
                   - EVERY text element must be preserved with exact wording, font, size, color, and placement
                   - ALL logos and graphic elements must remain completely identical
                   - Product color, finish, reflections, and material properties must be faithfully preserved
                   - Product shape, proportions, and dimensions must be maintained exactly
                   - No artistic interpretation or stylistic modification of the product is permitted
                
                2. Image B should ONLY influence these aspects:
                   - Background scene/environment
                   - Lighting characteristics (direction, quality, color temperature)
                   - Overall mood and atmosphere
                   - Composition style and product arrangement
                
                3. Your prompt MUST begin with this EXACT text:
                   "CRITICAL INSTRUCTION: This product photography request requires 100% fidelity to the reference product. The product shown MUST remain ABSOLUTELY IDENTICAL to the original with NO MODIFICATIONS whatsoever to any text, logos, graphics, colors, shape, or design elements."
                
                4. Include these specific technical details:
                   - Specify "photorealistic professional product photography"
                   - Request "studio-quality lighting with precise product highlighting"
                   - Require "8K ultra-high-resolution commercial photography" 
                   - Specify "photorealistic rendering with accurate materials"
                
                5. End your prompt with this reinforcement:
                   "IMPORTANT REMINDER: Preserve EVERY detail of the product exactly as shown in the reference image - especially all text, logos, and design elements. NO creative interpretation of the product itself is allowed."
                
                REMEMBER: DALL-E 3 frequently modifies text and product details even when instructed not to. Your prompt must repeatedly emphasize the absolute necessity of maintaining product fidelity multiple times throughout.
                `.trim(),
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
        max_tokens: 1000,
        temperature: 0.7, // Balanced creativity for prompt generation
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', result);
      return NextResponse.json(
        { error: result.error?.message || 'Error generating photography prompt' },
        { status: response.status }
      );
    }

    const prompt = result.choices?.[0]?.message?.content || 'No prompt generated.';
    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
