import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt, numOutputs = 1 } = await req.json();

  // Validate numOutputs is between 1 and 4
  const sanitizedNumOutputs = Math.min(Math.max(1, Number(numOutputs)), 4);

  // Ensure the prompt emphasizes product preservation with a structured directive
  const enhancedPrompt = `!!CRITICAL PRESERVATION DIRECTIVE!!
This is a professional product photography request that REQUIRES:
- The product must remain 100% identical to the reference image
- ALL text elements must be preserved exactly as shown (same words, fonts, sizes, colors, positions)
- ALL logos, graphics, and design elements must be preserved exactly as shown
- Product color, shape, proportions, and materials must remain exactly as shown
- NO creative interpretation or modification of ANY product elements is permitted

${prompt}

FINAL REMINDER: This product MUST be rendered exactly as it appears in the reference with absolutely NO CHANGES to text, logos, design elements, or any other product characteristics.`;

  try {
    // For DALL-E 3, we need to make multiple requests since it doesn't support n>1
    if (sanitizedNumOutputs > 1) {
      // Initialize array to store image URLs
      const imageUrls: string[] = [];

      // Make multiple requests in parallel
      const generationPromises = Array(sanitizedNumOutputs).fill(0).map(() =>
        fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: enhancedPrompt,
            size: '1024x1024',
            style: 'natural',     // Natural style for photorealistic product renderings
            quality: 'hd',        // HD quality for better detail preservation
            response_format: 'url', // Simple URL response format
            n: 1,
          }),
        }).then(res => res.json())
      );

      const results = await Promise.all(generationPromises);

      // Extract image URLs from results
      results.forEach(result => {
        if (result.data?.[0]?.url) {
          imageUrls.push(result.data[0].url);
        }
      });

      if (imageUrls.length === 0) {
        return NextResponse.json({
          error: 'Failed to generate any images'
        }, { status: 400 });
      }

      return NextResponse.json({ imageUrls });
    } else {
      // Original single image generation flow
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          size: '1024x1024',
          style: 'natural',     // Natural style for photorealistic product renderings
          quality: 'hd',        // HD quality for better detail preservation
          response_format: 'url', // Simple URL response format
          n: 1,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('DALL-E API error:', result);
        return NextResponse.json({
          error: result.error?.message || 'Failed to generate image'
        }, { status: 400 });
      }

      const imageUrl = result.data?.[0]?.url;
      // Return both imageUrl and imageUrls for backward compatibility
      return NextResponse.json({ imageUrl, imageUrls: [imageUrl] });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Failed to process image generation request'
    }, { status: 500 });
  }
}
