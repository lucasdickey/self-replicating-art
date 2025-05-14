# A-OK Daily Image Generator

An automated service that generates daily on-brand graphics for Apes On Keys by:

1. Pulling product & grid images from Shopify and the a-ok.shop gallery API
2. Generating fresh graphics using OpenAI's DALL-E 3
3. Storing the results in the local repo under `public/daily/`
4. Updating a manifest of generated images
5. Triggering a Vercel deployment

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

3. Required environment variables:
   - `SHOPIFY_DOMAIN`: Your Shopify store domain
   - `SHOPIFY_STOREFRONT_TOKEN`: Shopify Storefront API token
   - `OPENAI_API_KEY`: OpenAI API key
   - `VERCEL_DEPLOY_HOOK_URL`: Vercel deployment webhook URL

## Development

Run the generator locally:

```bash
npm start
```

## GitHub Actions

The service runs automatically at 13:00 UTC daily via GitHub Actions. You can also trigger it manually from the Actions tab.

## Output

Generated images are stored in the repo under `public/daily/` with filenames in the format `YYYY-MM-DD.png`. The `manifest.json` file keeps track of all generated images with their prompts and URLs.

---

## Architecture

```text
GitHub Actions (cron)
   └─▶ Node script (src/index.ts)
         ├─ fetchShopifyMedia.ts  ← Storefront GraphQL API
         ├─ listS3GridImages.ts  ← a-ok.shop gallery API
         ├─ craftPrompt.ts       ← brand rules + descriptors
         ├─ generateImage.ts     ← OpenAI imagegen 1×1024 PNG
         ├─ uploadToS3.ts        ← local file write (daily/YYYY-MM-DD.png)
         └─ manifest.json update + Vercel Deploy Hook
```

---

## Prerequisites

| Item                             | Purpose                                      |
| -------------------------------- | -------------------------------------------- |
| **Node ≥ 20**                    | Runtime for the agent scripts                |
| **GitHub repo**                  | Hosts code & scheduled workflow              |
| **Shopify Storefront API token** | Read-only access to product media            |
| **OpenAI API key**               | GPT-4o Vision + Image Generation             |
| **Vercel Deploy Hook URL**       | Triggers storefront rebuild after each image |

---

## Environment variables

Add these as **GitHub Secrets** (repo → Settings → Secrets → Actions):

```bash
OPENAI_API_KEY           = x-sk-...
SHOPIFY_DOMAIN           = a-ok.myshopify.com
SHOPIFY_STOREFRONT_TOKEN = shpat_...
VERCEL_DEPLOY_HOOK_URL   = https://api.vercel.com/...
```

---

## Customising brand behaviour

- **Brand rules** are a single string in `src/craftPrompt.ts`. Tweak typography, palette, or vibe there.
- **Image size** (`generateImage.ts`) defaults to 1024×1024; change to 1792×1024 if you want a banner.

---

## Error handling & cost guards

- Script aborts if OpenAI spend today ≥ $0.20 (see `checkUsage()` helper).
- If Shopify or the gallery API fails → the GitHub job exits **without** touching manifest or triggering deploy.
- Previous day's art remains live—storefront never breaks.

---

## License

[MIT](LICENSE)
