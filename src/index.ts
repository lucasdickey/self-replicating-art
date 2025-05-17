import "dotenv/config";
import { getProductMedia } from "./fetchShopifyMedia";
import { listGridImages } from "./listGridImages";
import { makePrompt } from "./craftPrompt";
import { generateImage } from "./generateImage";
import { describeImage } from "./describeImage";
import fs from "fs/promises";

function generateRandomHash(length: number = 4): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let hash = "";
  for (let i = 0; i < length; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
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

    // Combine the arrays with proper typing
    const combinedMedia: MediaWithUrl[] = [
      ...sampledShopify as ShopifyMedia[], 
      ...sampledGrid as GridImage[]
    ];
    
    const imageDescriptions = await Promise.all(
      combinedMedia.map((img) => describeImage(img.url))
    );

    const allDescriptors = [
      ...shopifyMedia.map((m: ShopifyMedia) => m.alt),
      ...shopifyMedia.map((m: ShopifyMedia) => m.description),
      ...gridMedia.map((m: GridImage) => m.alt),
      ...imageDescriptions,
    ];

    // 3. Build prompt
    const prompt = makePrompt(allDescriptors);
    console.log("Generated prompt:", prompt);

    // 4. Generate and save image
    const imageBuffer = await generateImage(prompt);
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const hourStr = now.getUTCHours().toString().padStart(2, "0");
    const randomHash = generateRandomHash();
    const filePath = `public/daily/${dateStr}-${hourStr}-${randomHash}.png`;
    await fs.writeFile(filePath, imageBuffer);
    console.log("✅ Image saved:", filePath);

    // 5. Update manifest
    const manifestPath = "manifest.json";
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    manifest.unshift({ date: Date.now(), prompt, url: filePath });
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log("✅ Manifest updated");

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

main();
