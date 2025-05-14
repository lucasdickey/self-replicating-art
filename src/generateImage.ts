import OpenAI from "openai";

const openai = new OpenAI();

export async function generateImage(prompt: string): Promise<Buffer> {
  const result = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
  });
  const data = result?.data;
  if (!data || !data[0]?.b64_json) {
    throw new Error("No image data received from OpenAI");
  }
  return Buffer.from(data[0].b64_json, "base64");
}
