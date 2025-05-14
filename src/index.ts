import "dotenv/config";
import { getProductMedia } from "./fetchShopifyMedia";
import { listGridImages } from "./listGridImages";
import { makePrompt } from "./craftPrompt";
import { generateImage } from "./generateImage";
import fs from "fs/promises";

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
      getProductMedia(),
      listGridImages(),
    ]);

    const allDescriptors = [...shopifyMedia, ...gridMedia].map((m) => m.alt);

    // 3. Build prompt
    const prompt = makePrompt(allDescriptors);
    console.log("Generated prompt:", prompt);

    // 4. Generate and save image
    const imageBuffer = await generateImage(prompt);
    const dateStr = new Date().toISOString().split("T")[0];
    const filePath = `public/daily/${dateStr}.png`;
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
