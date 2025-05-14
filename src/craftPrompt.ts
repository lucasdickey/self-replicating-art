const BRAND_RULES = `
Apes On Keys street-art; bold red/black/white; mid-century Hitchcock poster
vibe; stencil feel; high-contrast; print-ready.`; // single source of truth

export function makePrompt(descriptors: string[]) {
  return `${BRAND_RULES}\nInspiration snippets: ${descriptors
    .slice(0, 20)
    .join("; ")}\nGenerate 1 new graphic.`;
}
