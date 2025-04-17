import OpenAI from "openai";
import { AIServiceProvider, ImageAnalysisResult } from "./types";

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
    abstract generateStudioPhoto(imagePath: string, userPrompt: string, imageAnalysis?: ImageAnalysisResult): Promise<string>;
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

    async generateStudioPhoto(imagePath: string, userPrompt: string, imageAnalysis?: ImageAnalysisResult): Promise<string> {
        try {
            // Build a detailed prompt based on the image analysis and user prompt
            let detailedPrompt = "Create a professional product photo studio shot";

            // If we have image analysis, use it to enhance the prompt
            if (imageAnalysis) {
                detailedPrompt += ` of ${imageAnalysis.description}`;

                if (imageAnalysis.attributes) {
                    const { color, material, shape, category } = imageAnalysis.attributes;
                    const attributes = [];

                    if (color) attributes.push(`color: ${color}`);
                    if (material) attributes.push(`material: ${material}`);
                    if (shape) attributes.push(`shape: ${shape}`);
                    if (category) attributes.push(`type: ${category}`);

                    if (attributes.length > 0) {
                        detailedPrompt += ` with ${attributes.join(", ")}`;
                    }
                }
            }
            // For text-only mode, rely completely on user's prompt
            else if (!imagePath && userPrompt) {
                detailedPrompt += ` of ${userPrompt}`;
            }
            // For image without analysis, use a simpler approach
            else {
                detailedPrompt += ` of this product: ${userPrompt}`;
            }

            // Add user's specific requirements for image + analysis mode
            if (imageAnalysis && userPrompt && userPrompt.trim() !== "") {
                detailedPrompt += `. User requests: ${userPrompt}`;
            }

            // Add standard photo requirements
            detailedPrompt += `. High quality, professional lighting, clean background, detailed product features.`;

            logAI("Sending image generation request to OpenAI");
            logAI("Prompt:", detailedPrompt.slice(0, 200) + (detailedPrompt.length > 200 ? "..." : ""));

            const startTime = Date.now();

            // Generate the image
            const response = await this.client.images.generate({
                model: "dall-e-3",
                prompt: detailedPrompt,
                n: 1,
                size: "1024x1024",
                quality: "standard", // Use standard to save credits
                response_format: "b64_json"
            });

            const endTime = Date.now();
            logAI(`OpenAI image generation completed in ${(endTime - startTime) / 1000}s`);

            if (!response.data[0]?.b64_json) {
                logAI("Error: OpenAI returned no image data");
                throw new Error("No image was generated");
            }

            logAI("Image generation successful", {
                revisedPrompt: response.data[0].revised_prompt?.slice(0, 100) + "..." || "No revised prompt"
            });

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
