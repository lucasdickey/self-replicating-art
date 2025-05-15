const BRAND_RULES = `
Apes On Keys street-art; A-K; bold red/black/white; mid-century Hitchcock poster vibe; stencil feel; high-contrast; print-ready; large language models; agents; next token prediction; acceleration; deceleration; alignment; transformer; sycophant; hallucination; AGI; AI; optimism; pessimissm; human replacement; human augmentation; expressive primates; anthropomorphic apes; fitted caps; oversized headphones; logo repetition; cartoon realism; graphic tees; hoodie graphics; cyberpunk; poster art; printed-on-print (meta-graphics); layered satire; culture clash; AI mascots; simulated cognition; street uniformity vs. individual expression`; // single source of truth

export function makePrompt(descriptors: string[]) {
  // Filter out empty descriptions and limit to 20 items
  const validDescriptors = descriptors
    .filter((desc) => desc && desc.trim().length > 0)
    .slice(0, 20);

  return `${BRAND_RULES}\nInspiration snippets to draw from (not all need to be used for any given graphic): ${validDescriptors.join(
    "; "
  )}\nGenerate 1 new graphic assuming it'll be printed on a t-shirt or on a poster Please use the brand rules as inspiration, and limit the number of letters -- large letters only in all caps; no small letters or numbers unless intentionally abstractd. You are creating a street-art inspired graphic based on the inspiration snippets to inform a satirical, darkly humorous, and satirical graphic or a social commentary on AI.`;
}
