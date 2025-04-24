import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/lib/services/ai-service';
import { AIServiceProvider } from '@/lib/services/types';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

// Save base64 image to a temporary file
async function saveBase64Image(base64Data: string): Promise<string> {
    const tempDir = path.join(os.tmpdir(), 'ipixel-images');
    await fs.mkdir(tempDir, { recursive: true });

    const filePath = path.join(tempDir, `${uuidv4()}.png`);
    const data = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');

    await fs.writeFile(filePath, buffer);
    return filePath;
}

export async function POST(req: NextRequest) {
    try {
        const { productImage, templateImage, prompt, numOutputs = 1 } = await req.json();

        if (!productImage || !templateImage) {
            return NextResponse.json({ error: 'Product image and template image are required' }, { status: 400 });
        }

        // Save the base64 images to temporary files
        const productImagePath = await saveBase64Image(productImage);
        const templateImagePath = await saveBase64Image(templateImage);

        // Create the AI service with OpenAI provider
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
        }

        const aiService = createAIService(AIServiceProvider.OPENAI, apiKey);

        // Generate the studio photo
        const images = [productImagePath, templateImagePath];
        const enhancedPrompt = `!!PROFESSIONAL PRODUCT PHOTOGRAPHY!!
Transform the product in the first image using the photography style from the second image.
Create a high-quality studio photograph with the following requirements:
- Maintain ALL product details, text, logos, and design elements exactly as shown
- Do not modify the product in any way (color, shape, size)
- Focus on creating a professional studio lighting and environment
- Create realistic shadows and reflections
- The product should be the main subject and clearly visible

${prompt || 'Create a professional product photograph with clean background and appealing composition.'}`;

        const resultImageB64 = await aiService.generateStudioPhoto(images, enhancedPrompt, numOutputs);

        // Clean up temporary files
        await Promise.all([
            fs.unlink(productImagePath),
            fs.unlink(templateImagePath)
        ]);

        return NextResponse.json({
            success: true,
            imageUrl: `data:image/png;base64,${resultImageB64}`
        });

    } catch (error: Error | unknown) {
        console.error('Error generating studio photo:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to generate studio photo'
        }, { status: 500 });
    }
}
