export enum AIServiceProvider {
    OPENAI = "openai"
    // Can add more providers like STABILITY, REPLICATE, etc.
}

export interface StudioPhotoSettings {
    prompt: string;
    enhanceDetails?: boolean;
    removeBackground?: boolean;
    style?: "product" | "lifestyle" | "minimalist" | "luxury";
}

export interface AIServiceResponse {
    success: boolean;
    imageData?: string;
    error?: string;
}

// New interface for image analysis service
export interface ImageAnalysisResult {
    description: string;
    attributes?: {
        color?: string;
        shape?: string;
        material?: string;
        category?: string;
        [key: string]: string | undefined;
    };
}

// Abstract class for image analysis
export abstract class ImageAnalysisService {
    abstract analyzeImage(imagePath: string): Promise<ImageAnalysisResult>;
}
