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
                max_tokens: 300, // Keep token usage low to reduce costs
                messages: [
                    {
                        role: "system",
                        content: "You are a product photography expert. Describe the product in detail, focusing on its visual characteristics that would be important for creating a professional studio photo."
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Describe this product in detail for a photo studio. Include color, shape, material, key features, and type of product. Format your response as a JSON object with 'description' (a concise paragraph) and 'attributes' (with keys for color, shape, material, category)."
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
            let jsonMatch;

            try {
                logAnalysis("Attempting to parse JSON response");
                // Try to extract JSON from the response
                jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]) as ImageAnalysisResult;
                    logAnalysis("Successfully parsed JSON result", {
                        description: result.description.substring(0, 100) + (result.description.length > 100 ? "..." : ""),
                        attributeCount: result.attributes ? Object.keys(result.attributes).length : 0
                    });
                    return result;
                } else {
                    logAnalysis("Failed to find JSON in response, response starts with:", content.substring(0, 100));
                }
            } catch (error) {
                logAnalysis("Error parsing JSON from response:", error);
            }

            // Fallback: return plain text as description
            logAnalysis("Using fallback: returning plain text as description");
            return {
                description: content
            };
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
