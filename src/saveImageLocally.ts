import { promises as fs } from "fs";
import path from "path";

export async function uploadToS3(imageBuffer: Buffer): Promise<string> {
  const dateStr = new Date().toISOString().split("T")[0];
  const filePath = path.join("public", "daily", `${dateStr}.png`);
  await fs.writeFile(filePath, imageBuffer);
  return filePath;
}
