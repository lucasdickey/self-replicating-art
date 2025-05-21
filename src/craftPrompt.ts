const BRAND_RULES = `
Apes On Keys street-art; bold red/black/white; mid-century horror film poster vibe; stencil feel; print-ready;
high-contrast; AGI themes; inspired by A-OK product descriptions and catalog imagery plus a-ok-shop project photos; streetwear and street art inspired`;

export function makePrompt(descriptors: string[]) {
  // Filter out empty descriptors
  const validDescriptors = descriptors.filter(
    (desc) => desc && desc.trim().length > 0
  );

  // Take the first 4 descriptors as priority (these will be from the priority images)
  const priorityDescriptors = validDescriptors.slice(0, 4);

  // Take the rest of the descriptors (up to 21 more for a total of 25)
  const otherDescriptors = validDescriptors.slice(4, 25);

  return `${BRAND_RULES}
Primary inspiration: ${priorityDescriptors.join("; ")};
Secondary inspiration: ${otherDescriptors.join("; ")};
Generate 1 graphic intended for t-shirt or poster printing. Focus on powerful iconography. Only include A-OK or APES ON KEYS as text. No other text.`;
}
