import OpenAI from "openai";
import { AIServiceProvider } from "./types";
import { readFileSync } from "fs";
import { File } from "buffer";
import path from "path";

// Add logging function
function logAI(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🤖 ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

// Abstract base class for AI services
export abstract class AIImageService {
    abstract generateStudioPhoto(
        images: string[],
        prompt: string,
        numOutputs: number
    ): Promise<string>;
}

// OpenAI implementation
export class OpenAIImageService implements AIImageService {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey
        });
        logAI("OpenAI client initialized");
    }

    async generateStudioPhoto(
        images: string[],
        prompt: string,
        numOutputs: number
    ): Promise<string> {
        try {
            logAI(`Generating studio photo with OpenAI using ${images.length} images, prompt: ${prompt}`);

            const startTime = Date.now();

            // Create File objects with proper MIME types for each image
            const imageFiles = images.map(imagePath => {
                const buffer = readFileSync(imagePath);
                const extension = path.extname(imagePath).toLowerCase();
                let mimeType: string;

                switch (extension) {
                    case '.png':
                        mimeType = 'image/png';
                        break;
                    case '.jpg':
                    case '.jpeg':
                        mimeType = 'image/jpeg';
                        break;
                    case '.webp':
                        mimeType = 'image/webp';
                        break;
                    default:
                        throw new Error(`Unsupported image format: ${extension}`);
                }

                return new File(
                    [buffer],
                    path.basename(imagePath),
                    { type: mimeType }
                );
            });

            // Generate the image with edit
            const response = await this.client.images.edit({
                model: "gpt-image-1",
                prompt: prompt,
                image: imageFiles,
                quality: "medium", // using medium to save credits
                n: numOutputs
            });

            const endTime = Date.now();
            logAI(`OpenAI image generation completed in ${(endTime - startTime) / 1000}s`);

            if (!response.data?.[0]?.b64_json) {
                logAI("Error: OpenAI returned no image data");
                throw new Error("No image was generated");
            }

            return response.data[0].b64_json;
        } catch (error) {
            logAI("Error generating studio photo with OpenAI:", error);
            throw error;
        }
    }
}

// Factory function to create AI service based on provider
export function createAIService(provider: AIServiceProvider, apiKey: string): AIImageService {
    logAI(`Creating AI service with provider: ${provider}`);
    switch (provider) {
        case AIServiceProvider.OPENAI:
            return new OpenAIImageService(apiKey);
        // Add more providers as needed
        default:
            throw new Error(`Unsupported AI provider: ${provider}`);
    }
}
