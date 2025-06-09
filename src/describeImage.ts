import OpenAI from "openai";
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const openai = new OpenAI();

async function getImageAsBase64(filePath: string): Promise<string> {
  try {
    // Handle file paths relative to the project root
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(process.cwd(), filePath);
    
    const imageBuffer = await fs.readFile(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = path.extname(filePath).toLowerCase().substring(1);
    
    return `data:image/${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error(`Error reading image file ${filePath}:`, error);
    throw error;
  }
}

export async function describeImage(url: string): Promise<string> {
  try {
    // Check if this is a local file path
    const isLocalFile = !url.startsWith('http') && !url.startsWith('data:');
    
    let imageUrl = url;
    // Encode only remote URLs (not data: or base64)
    if (!isLocalFile && (url.startsWith('http://') || url.startsWith('https://'))) {
      imageUrl = encodeURI(url);
    }
    
    if (isLocalFile) {
      try {
        imageUrl = await getImageAsBase64(url);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Skipping image analysis for ${url}:`, errorMessage);
        return "";
      }
    }

    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 20,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Briefly describe this image in under 8 words.",
            },
            {
              type: "image_url",
              image_url: { 
                url: imageUrl,
                detail: "low" // Use low detail for faster processing
              },
            },
          ],
        },
      ],
    });
    
    return result.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("describeImage error for URL:", url, "Error:", err);
    return "";
  }
}
