import "dotenv/config";
import { getProductMedia } from "./fetchShopifyMedia";
import { listGridImages } from "./listGridImages";
import { makePrompt } from "./craftPrompt";
import { generateImage } from "./generateImage";
import { describeImage } from "./describeImage";
import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI();

function generateRandomHash(length: number = 4): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let hash = "";
  for (let i = 0; i < length; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Function to clean HTML from descriptions
function cleanDescription(html: string): string {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>?/gm, ' ');
  
  // Replace multiple spaces with a single space
  text = text.replace(/\s+/g, ' ').trim();
  
  // Truncate to a reasonable length
  return text.length > 200 ? text.substring(0, 200) + '...' : text;
}

// Define interfaces for our media types
interface MediaWithUrl {
  url: string;
  alt: string;
}

interface ShopifyMedia extends MediaWithUrl {
  description: string;
}

interface GridImage extends MediaWithUrl {
  // Any additional fields specific to grid images can be added here
}

async function main() {
  try {
    // 1. Load environment variables
    if (!process.env.SHOPIFY_DOMAIN || !process.env.SHOPIFY_STOREFRONT_TOKEN) {
      throw new Error("Missing Shopify credentials");
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }
    
    // Define priority images to use as primary inputs
    const priorityImages = [
      {
        url: path.join(process.cwd(), "public/inspo/a-ok-hat-expressive-face-circle.png"),
        alt: "A-OK expressive face with hat in circle"
      },
      {
        url: path.join(process.cwd(), "public/inspo/a-ok-face.jpg"),
        alt: "A-OK face illustration"
      }
    ];

    // 2. Aggregate descriptors from Shopify + grid images
    const [shopifyMedia, gridMedia] = await Promise.all([
      getProductMedia() as Promise<ShopifyMedia[]>,
      listGridImages() as Promise<GridImage[]>,
    ]);

    function sample<T>(arr: T[], count: number): T[] {
      const copy = [...arr];
      const out: T[] = [];
      for (let i = 0; i < count && copy.length; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
      }
      return out;
    }

    const sampledShopify = sample(shopifyMedia, 3);
    const sampledGrid = sample(gridMedia, 3);

    // First, get descriptions for priority images
    console.log("Getting descriptions for priority images...");
    const priorityImageDescriptions = await Promise.all(
      priorityImages.map((img) => describeImage(img.url))
    );
    
    // Then process the other images
    // Combine the arrays with proper typing
    const combinedMedia: MediaWithUrl[] = [
      ...sampledShopify as ShopifyMedia[], 
      ...sampledGrid as GridImage[]
    ];
    
    const otherImageDescriptions = await Promise.all(
      combinedMedia.map((img) => describeImage(img.url))
    );

    // Process shopify media descriptions
    const shopifyDescriptions = shopifyMedia.flatMap(m => [
      m.alt,
      ...cleanDescription(m.description).split(/[.,;!?]+/).map(s => s.trim()).filter(Boolean)
    ]);

    // Combine all descriptors with priority given to specific images
    const allDescriptors = [
      // Priority image descriptions come first
      ...priorityImages.map(img => img.alt),
      ...priorityImageDescriptions,
      // Then the rest of the descriptors
      ...shopifyDescriptions,
      ...gridMedia.map((m: GridImage) => m.alt),
      ...otherImageDescriptions,
    ].filter(desc => desc && desc.trim().length > 0); // Remove any empty strings

    // 3. Build prompt with priority given to the specific images
    const prompt = makePrompt(allDescriptors);
    console.log("Generated prompt:", prompt);

    // 4. Generate first draft image
    console.log("Generating first draft...");
    const draft1Buffer = await generateImage(prompt);
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const hourStr = now.getUTCHours().toString().padStart(2, "0");
    const randomHash = generateRandomHash();
    
    // Save first draft
    const draft1Path = `public/daily/${dateStr}-${hourStr}-${randomHash}-draft1.png`;
    await fs.writeFile(draft1Path, draft1Buffer);
    console.log("✅ First draft saved:", draft1Path);

    // 5. In local development, skip the review step and use the first draft as final
    let finalPath = draft1Path;
    let finalPrompt = prompt;
    
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_URL) {
      // 5a. In production, perform the review and generate improved version
      console.log("Reviewing first draft and generating improvements...");
      const improvementPrompt = await reviewAndImproveImage(draft1Path, prompt);
      
      // 6. Generate improved image
      console.log("Generating improved version...");
      const draft2Buffer = await generateImage(improvementPrompt);
      finalPath = `public/daily/${dateStr}-${hourStr}-${randomHash}-draft2.png`;
      await fs.writeFile(finalPath, draft2Buffer);
      console.log("✅ Improved version saved:", finalPath);
      finalPrompt = improvementPrompt;
    } else {
      console.log("Skipping review step in local development");
    }

    // 7. Update manifest with the final version(s)
    const manifestPath = "manifest.json";
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const timestamp = Date.now();
    manifest.unshift({ 
      date: timestamp, 
      prompt: finalPrompt, 
      originalPrompt: prompt,
      url: finalPath,
      ...(finalPath !== draft1Path && { draftUrl: draft1Path }) // Only include draftUrl if we have two versions
    });
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log("✅ Manifest updated with both versions");

    // 6. Trigger deploy hook if in GitHub Actions
    if (process.env.GITHUB_ACTIONS && process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" });
      console.log("✅ Deploy hook triggered");
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Function to review an image and suggest prompt improvements
async function reviewAndImproveImage(imagePath: string, originalPrompt: string): Promise<string> {
  try {
    // For local testing, use a file:// URL
    const isLocal = !process.env.VERCEL_URL;
    const imageUrl = isLocal 
      ? `file://${path.resolve(imagePath)}`
      : `${process.env.VERCEL_URL}/${imagePath}`;
    
    const reviewPrompt = `CRITICAL: This is a design for A-OK brand apparel. The ONLY text that should ever appear in the image is either "A-OK" or "APES ON KEYS" - absolutely no other text is allowed.

Please review this image and suggest improvements to the prompt. 
The original prompt was: "${originalPrompt}"

CRITICAL RULES FOR IMPROVEMENT:
1. The image MUST NOT contain any text EXCEPT "A-OK" or "APES ON KEYS"
2. If the image contains any other text, the improved prompt MUST explicitly state "NO TEXT EXCEPT 'A-OK' or 'APES ON KEYS'"
3. Focus on visual elements only - the design should communicate without relying on text
4. If the image has text, suggest removing it or replacing with brand-appropriate typography
5. Ensure the design works well for apparel printing

Return a new, improved prompt that would generate a better version of this image, following these rules strictly.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: reviewPrompt },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    let improvedPrompt = response.choices[0]?.message?.content?.trim() || originalPrompt;
    
    // Add a safety check to ensure the text restriction is included
    if (!improvedPrompt.includes('NO TEXT EXCEPT') && !improvedPrompt.includes('text') && !improvedPrompt.includes('typography')) {
      improvedPrompt = `NO TEXT EXCEPT 'A-OK' or 'APES ON KEYS'. ${improvedPrompt}`;
    }
    
    console.log("Improved prompt:", improvedPrompt);
    return improvedPrompt;
  } catch (error) {
    console.error("Error in reviewAndImproveImage:", error);
    // Fallback to original prompt but add the text restriction
    return `NO TEXT EXCEPT 'A-OK' or 'APES ON KEYS'. ${originalPrompt}`;
  }
}

main();
