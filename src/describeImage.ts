import OpenAI from "openai";

const openai = new OpenAI();

export async function describeImage(url: string): Promise<string> {
  try {
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
              image_url: { url },
            },
          ],
        },
      ],
    });
    return result.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("describeImage error", err);
    return "";
  }
}
