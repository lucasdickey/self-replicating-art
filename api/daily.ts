import { promises as fs } from "fs";
import path from "path";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const dailyDir = path.join(process.cwd(), "public/daily");
    const files = await fs.readdir(dailyDir);
    const images = files
      .filter((file) => file.endsWith(".png"))
      .map((file) => ({
        url: `/daily/${file}`,
        date: file.replace(".png", ""),
      }));
    res.status(200).json(images);
  } catch (error) {
    console.error("Error reading daily directory:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
}
