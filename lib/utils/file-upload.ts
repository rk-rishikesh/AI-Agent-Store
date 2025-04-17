import { IncomingForm, Fields, Files } from "formidable";
import { NextApiRequest } from "next";
import fs from "fs/promises";
import path from "path";

export const config = {
    api: {
        bodyParser: false
    }
};

export async function parseForm(req: NextApiRequest) {
    return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
        const form = new IncomingForm({
            keepExtensions: true,
            multiples: false
        });

        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
}

export async function readFileAsBase64(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    return buffer.toString("base64");
}

export async function saveBase64Image(base64Data: string, outputPath: string): Promise<string> {
    const data = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(data, "base64");

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(outputPath, buffer);
    return outputPath;
}
