import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/lib/services/ai-service';
import { AIServiceProvider } from '@/lib/services/types';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

// Save base64 image to a temporary file
async function saveBase64Image(base64Data: string): Promise<string> {
    const tempDir = path.join(os.tmpdir(), 'ipixel-ads');
    await fs.mkdir(tempDir, { recursive: true });

    const filePath = path.join(tempDir, `${uuidv4()}.png`);
    const data = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');

    await fs.writeFile(filePath, buffer);
    return filePath;
}

export async function POST(req: NextRequest) {
    try {
        const { productImage, wireframeImage, adCopy, prompt, numOutputs = 1 } = await req.json();

        if (!productImage || !wireframeImage) {
            return NextResponse.json({ error: 'Product image and wireframe image are required' }, { status: 400 });
        }

        // Save the base64 images to temporary files
        const productImagePath = await saveBase64Image(productImage);
        const wireframeImagePath = await saveBase64Image(wireframeImage);

        // Create the AI service with OpenAI provider
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
        }

        const aiService = createAIService(AIServiceProvider.OPENAI, apiKey);

        // Generate the ad photo with enhanced prompt for ad-specific requirements
        const images = [productImagePath, wireframeImagePath];
        const enhancedPrompt = `!!PROFESSIONAL AD PHOTOGRAPHY!!
Transform the product in the first image using the exact layout and positioning from the wireframe in the second image.
Create a high-impact advertisement photograph with the following requirements:
- Position the product EXACTLY as shown in the wireframe layout
- Maintain ALL product details, text, logos, and design elements exactly as shown
- Do not modify the product in any way (color, shape, size)
- Create professional studio lighting optimized for advertisement impact
- Ensure clear space for text placement as indicated in the wireframe
- Create realistic shadows and reflections
- The product should be positioned according to the wireframe while maintaining visual appeal

Ad Copy to incorporate: "${adCopy || ''}"
${prompt || 'Create a professional advertisement photograph following the wireframe layout with clean composition.'}`

        const resultImageB64 = await aiService.generateStudioPhoto(images, enhancedPrompt, numOutputs);

        // Clean up temporary files
        await Promise.all([
            fs.unlink(productImagePath),
            fs.unlink(wireframeImagePath)
        ]);

        return NextResponse.json({
            success: true,
            imageUrl: `data:image/png;base64,${resultImageB64}`
        });

    } catch (error) {
        console.error('Error generating ad photo:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to generate ad photo'
        }, { status: 500 });
    }
} 
