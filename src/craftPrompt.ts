const BRAND_RULES = `
Apes On Keys street-art; bold red/black/white; mid-century Hitchcock poster vibe; stencil feel; print-ready;
large letters only; max 4 words; no paragraphs; no fake UI; high-contrast; AGI themes;
no lorem ipsum; no techno babble; no multiple text boxes; avoid filler text;
inspired by product copy, catalog imagery and a-ok-shop project photos;`;

export function makePrompt(descriptors: string[]) {
  // Filter out empty descriptors
  const validDescriptors = descriptors
    .filter((desc) => desc && desc.trim().length > 0);
  
  // Take the first 4 descriptors as priority (these will be from the priority images)
  const priorityDescriptors = validDescriptors.slice(0, 4);
  
  // Take the rest of the descriptors (up to 46 more for a total of 50)
  const otherDescriptors = validDescriptors.slice(4, 50);

  return `${BRAND_RULES}
Primary inspiration: ${priorityDescriptors.join("; ")};
Secondary inspiration: ${otherDescriptors.join("; ")};
Generate 1 graphic intended for t-shirt or poster printing. Focus on powerful iconography and 1–2 bold text phrases. Use large, centered, stencil-style lettering only. Only include A-OK or APES ON KEYS as text. No other text. Heavily emphasize the style and elements from the primary inspiration images.`;
}
