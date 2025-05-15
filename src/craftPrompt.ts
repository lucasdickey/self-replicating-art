const BRAND_RULES = `
Apes On Keys street-art; bold red/black/white; mid-century Hitchcock poster vibe; stencil feel; print-ready;
large letters only; max 4 words; no paragraphs; no fake UI; high-contrast; AGI themes;
no lorem ipsum; no techno babble; no multiple text boxes; avoid filler text;`;

export function makePrompt(descriptors: string[]) {
  const validDescriptors = descriptors
    .filter((desc) => desc && desc.trim().length > 0)
    .slice(0, 50);

  return `${BRAND_RULES}
Inspiration snippets: ${validDescriptors.join("; ")}
Generate 1 graphic intended for t-shirt or poster printing. Focus on powerful iconography and 1–2 bold text phrases. Use large, centered, stencil-style lettering only. Only include A-OK or APES ON KEYS as text. No other text.`;
}
