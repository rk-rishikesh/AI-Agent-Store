import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export async function preprocessImage(inputPath: string, outputPath?: string): Promise<string> {
    // If no output path provided, create one
    if (!outputPath) {
        const dir = path.dirname(inputPath);
        const filename = path.basename(inputPath, path.extname(inputPath));
        outputPath = path.join(dir, `${filename}_processed.png`);
    }

    // Ensure the directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // Process image: resize and normalize for AI
    await sharp(inputPath)
        .resize({
            width: 1024,
            height: 1024,
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);

    return outputPath;
}

export async function imageToBase64(imagePath: string): Promise<string> {
    const imageBuffer = await fs.readFile(imagePath);
    return `data:image/png;base64,${imageBuffer.toString("base64")}`;
}

export async function base64ToImage(base64Data: string, outputPath: string): Promise<string> {
    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Image, "base64");

    // Ensure the directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // Write the buffer to file
    await fs.writeFile(outputPath, imageBuffer);

    return outputPath;
}
