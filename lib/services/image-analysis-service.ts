import OpenAI from "openai";
import { ImageAnalysisResult, ImageAnalysisService } from "./types";
import fs from "fs/promises";

// Add logging function
function logAnalysis(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

export class OpenAIImageAnalysisService implements ImageAnalysisService {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey
        });
        logAnalysis("OpenAI Vision client initialized");
    }

    async analyzeImage(imagePath: string): Promise<ImageAnalysisResult> {
        try {
            logAnalysis(`Starting image analysis for ${imagePath}`);

            // Read the image file
            const startReadTime = Date.now();
            const imageBuffer = await fs.readFile(imagePath);
            const base64Image = imageBuffer.toString("base64");
            logAnalysis(`Image read in ${Date.now() - startReadTime}ms, size: ${(imageBuffer.length / 1024).toFixed(1)}KB`);

            logAnalysis("Sending Vision API request");
            const apiStartTime = Date.now();

            // Use GPT-4 Vision to analyze the image
            const response = await this.client.chat.completions.create({
                model: "gpt-4o",
                max_tokens: 500, // Increased token limit for more detailed analysis
                response_format: { type: "json_object" }, // Force JSON output
                messages: [
                    {
                        role: "system",
                        content: `You are an expert product photographer and analyst with specialized knowledge in identifying product details for commercial photography.
Your task is to analyze product images and extract key visual characteristics that would be essential for creating professional studio photos.
Focus on capturing all visually significant elements with precise terminology.
ALWAYS respond with valid JSON only.`
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this product image in detail. Extract all information that would be relevant for creating professional product photography.
Include:
1. Precise color descriptions (including specific shades, finishes, and any color variations)
2. Exact shape and dimensional characteristics
3. Material composition and surface textures
4. All visible text, logos, and branding elements (exactly as they appear)
5. Key product features that define its visual identity
6. Product category and specific type

Respond ONLY with a JSON object containing:
- "description": a comprehensive paragraph with all visual details
- "attributes": an object with keys for color, shape, material, texture, branding, text_elements, and category
- "photography_considerations": specific lighting, angle, and composition suggestions for this type of product`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ]
            });

            const apiEndTime = Date.now();
            logAnalysis(`Vision API response received in ${(apiEndTime - apiStartTime) / 1000}s`);
            logAnalysis(`Tokens: ${response.usage?.total_tokens || 'unknown'}`);

            // Parse the response
            const content = response.choices[0]?.message?.content || "";

            try {
                logAnalysis("Parsing JSON response");
                const result = JSON.parse(content) as ImageAnalysisResult;
                logAnalysis("Successfully parsed JSON result", {
                    description: result.description.substring(0, 100) + (result.description.length > 100 ? "..." : ""),
                    attributeCount: result.attributes ? Object.keys(result.attributes).length : 0
                });
                return result;
            } catch (error) {
                logAnalysis("Error parsing JSON from response:", error);

                // Fallback: Try to extract JSON from the content
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const result = JSON.parse(jsonMatch[0]) as ImageAnalysisResult;
                        logAnalysis("Extracted JSON from response text", {
                            description: result.description.substring(0, 100) + (result.description.length > 100 ? "..." : ""),
                            attributeCount: result.attributes ? Object.keys(result.attributes).length : 0
                        });
                        return result;
                    }
                } catch (nestedError) {
                    logAnalysis("Failed to extract JSON from response text");
                }

                // Final fallback: return plain text as description
                logAnalysis("Using fallback: returning plain text as description");
                return {
                    description: content
                };
            }
        } catch (error) {
            logAnalysis("Error analyzing image:", error);
            throw error;
        }
    }
}

// Factory function to create image analysis service
export function createImageAnalysisService(apiKey: string): ImageAnalysisService {
    logAnalysis("Creating image analysis service");
    return new OpenAIImageAnalysisService(apiKey);
} 
