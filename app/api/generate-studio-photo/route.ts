import { NextRequest, NextResponse } from "next/server";
import { createAIService } from "../../../lib/services/ai-service";
import { AIServiceProvider } from "../../../lib/services/types";
import { preprocessImage, base64ToImage } from "../../../lib/utils/image-processing";
import { createImageAnalysisService } from "../../../lib/services/image-analysis-service";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";

// Simple logging function with timestamps
function logWithTimestamp(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

// Make sure API doesn't parse the body as JSON
export const config = {
    api: {
        bodyParser: false,
        responseLimit: "10mb"
    }
};

export async function POST(request: NextRequest) {
    const requestId = uuidv4().slice(0, 8); // Short ID for tracing
    logWithTimestamp(`[${requestId}] 📥 Request received for studio photo generation`);

    try {
        // Get the form data
        const formData = await request.formData();
        const imageFile = formData.get("image") as File | null;
        const prompt = formData.get("prompt") as string;
        const skipAnalysis = formData.get("skipAnalysis") === "true";

        logWithTimestamp(`[${requestId}] 📋 Request parameters: skipAnalysis=${skipAnalysis}, hasImage=${!!imageFile}, promptLength=${prompt?.length || 0}`);

        // Require a prompt when no image is provided
        if (!imageFile && (!prompt || !prompt.trim())) {
            logWithTimestamp(`[${requestId}] ❌ Error: No prompt provided with no image`);
            return NextResponse.json({ error: "Please provide a prompt when no image is uploaded" }, { status: 400 });
        }

        // For text-only generation
        if (skipAnalysis && !imageFile) {
            logWithTimestamp(`[${requestId}] 💬 Text-only mode activated`);

            // Check for OpenAI API key
            const openaiApiKey = process.env.OPENAI_API_KEY;
            if (!openaiApiKey) {
                logWithTimestamp(`[${requestId}] ❌ Error: Missing OpenAI API key`);
                return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 });
            }

            // Initialize the AI service
            const aiService = createAIService(AIServiceProvider.OPENAI, openaiApiKey);

            logWithTimestamp(`[${requestId}] 🖼️ Generating image from text prompt`);
            logWithTimestamp(`[${requestId}] Prompt: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}"`);

            // Generate the studio photo directly from prompt
            const startTime = Date.now();
            const resultBase64 = await aiService.generateStudioPhoto("", prompt);
            const endTime = Date.now();

            logWithTimestamp(`[${requestId}] ✅ Image generated successfully in ${(endTime - startTime) / 1000}s`);

            // Save the result to a file
            const resultId = uuidv4();
            const outputPath = path.join(process.cwd(), "public", "uploads", `${resultId}.png`);
            await base64ToImage(resultBase64, outputPath);

            logWithTimestamp(`[${requestId}] 💾 Image saved to ${outputPath}`);

            return NextResponse.json({
                success: true,
                imageUrl: `/uploads/${resultId}.png`,
                requestId
            });
        }

        // If we get here, we're processing an image
        if (!imageFile) {
            logWithTimestamp(`[${requestId}] ❌ Error: No image file provided`);
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        // Create a temporary file
        const tempDir = path.join(os.tmpdir(), "product-studio");
        await fs.mkdir(tempDir, { recursive: true });

        const imagePath = path.join(tempDir, `${uuidv4()}_${imageFile.name}`);
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        await fs.writeFile(imagePath, imageBuffer);

        logWithTimestamp(`[${requestId}] 📁 Image saved to temporary path: ${imagePath}`);

        // Preprocess the image (resize, etc.)
        logWithTimestamp(`[${requestId}] 🔄 Preprocessing image...`);
        const processedImagePath = await preprocessImage(imagePath);
        logWithTimestamp(`[${requestId}] ✅ Image preprocessing complete: ${processedImagePath}`);

        // Check for OpenAI API key
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            logWithTimestamp(`[${requestId}] ❌ Error: Missing OpenAI API key`);
            await fs.unlink(imagePath).catch(() => { });
            await fs.unlink(processedImagePath).catch(() => { });
            return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 });
        }

        // Initialize the AI service
        const aiService = createAIService(AIServiceProvider.OPENAI, openaiApiKey);

        let imageAnalysis = undefined;

        // Analyze the image if not skipped
        if (!skipAnalysis) {
            try {
                logWithTimestamp(`[${requestId}] 🔍 Analyzing image with Vision API...`);
                const analysisStartTime = Date.now();

                const analysisService = createImageAnalysisService(openaiApiKey);
                imageAnalysis = await analysisService.analyzeImage(processedImagePath);

                const analysisEndTime = Date.now();
                logWithTimestamp(`[${requestId}] ✅ Image analysis complete in ${(analysisEndTime - analysisStartTime) / 1000}s`);
                logWithTimestamp(`[${requestId}] 📊 Analysis results:`, {
                    description: imageAnalysis.description?.substring(0, 100) + '...',
                    attributes: imageAnalysis.attributes
                });
            } catch (error) {
                logWithTimestamp(`[${requestId}] ⚠️ Image analysis failed, continuing without it:`, error);
                // Continue without image analysis
            }
        } else {
            logWithTimestamp(`[${requestId}] ⏩ Image analysis skipped as requested`);
        }

        // Generate the studio photo
        logWithTimestamp(`[${requestId}] 🖼️ Generating studio photo...`);
        const genStartTime = Date.now();

        const resultBase64 = await aiService.generateStudioPhoto(processedImagePath, prompt, imageAnalysis);

        const genEndTime = Date.now();
        logWithTimestamp(`[${requestId}] ✅ Studio photo generated in ${(genEndTime - genStartTime) / 1000}s`);

        // Save the result to a file
        const resultId = uuidv4();
        const outputPath = path.join(process.cwd(), "public", "uploads", `${resultId}.png`);
        await base64ToImage(resultBase64, outputPath);

        logWithTimestamp(`[${requestId}] 💾 Result saved to ${outputPath}`);

        // Clean up temporary files
        await fs.unlink(imagePath).catch(() => { });
        await fs.unlink(processedImagePath).catch(() => { });
        logWithTimestamp(`[${requestId}] 🧹 Temporary files cleaned up`);

        logWithTimestamp(`[${requestId}] ✅ Request completed successfully`);
        return NextResponse.json({
            success: true,
            imageUrl: `/uploads/${resultId}.png`,
            analysis: imageAnalysis,
            requestId
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate studio photo';
        logWithTimestamp(`[${requestId}] ❌ Error processing studio photo:`, errorMessage);
        return NextResponse.json({
            error: errorMessage,
            requestId
        }, {
            status: 500
        });
    }
}
