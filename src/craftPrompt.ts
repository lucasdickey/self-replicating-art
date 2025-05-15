const BRAND_RULES = `
Apes On Keys street-art; A-K; bold red/black/white; mid-century Hitchcock poster vibe; stencil feel; high-contrast; print-ready; large letters only in all caps; no small letters or numbers unless intentionally abstractd; large language models; agents; next token prediction; acceleration; deceleration; alignment; transformer; sycophant; hallucination; AGI; AI; optimism; pessimissm; human replacement; human augmentation`; // single source of truth

export function makePrompt(descriptors: string[]) {
  // Filter out empty descriptions and limit to 20 items
  const validDescriptors = descriptors
    .filter((desc) => desc && desc.trim().length > 0)
    .slice(0, 20);

  return `${BRAND_RULES}\nInspiration snippets: ${validDescriptors.join(
    "; "
  )}\nGenerate 1 new graphic assuming it'll be printed on a t-shirt or on a poster.`;
}
