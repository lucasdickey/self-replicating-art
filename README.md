# A-OK Daily Image Generator

An automated service that generates daily on-brand graphics for Apes On Keys by:

1. Pulling product & grid images from Shopify and S3
2. Generating fresh graphics using OpenAI's DALL-E 3
3. Storing the results in S3
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
   - `AWS_ACCESS_KEY_ID`: AWS access key
   - `AWS_SECRET_ACCESS_KEY`: AWS secret key
   - `S3_BUCKET`: S3 bucket name (default: aok-artifacts)
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

Generated images are stored in the S3 bucket under the `daily/` prefix with filenames in the format `YYYY-MM-DD.png`. The `manifest.json` file keeps track of all generated images with their prompts and URLs.

---

## Architecture

```text
GitHub Actions (cron)
   └─▶ Node script (src/index.ts)
         ├─ fetchShopifyMedia.ts  ← Storefront GraphQL API
         ├─ listS3GridImages.ts  ← AWS S3 ListObjectsV2 (grid/ prefix)
         ├─ craftPrompt.ts       ← brand rules + descriptors
         ├─ generateImage.ts     ← OpenAI imagegen 1×1024 PNG
         ├─ uploadToS3.ts        ← S3 putObject (daily/2025-05-13.png)
         └─ manifest.json update + Vercel Deploy Hook
```

---

## Prerequisites

| Item                                     | Purpose                                      |
| ---------------------------------------- | -------------------------------------------- |
| **Node ≥ 20**                            | Runtime for the agent scripts                |
| **GitHub repo**                          | Hosts code & scheduled workflow              |
| **AWS S3 bucket** (e.g. `aok-artifacts`) | Stores generated images & grid assets        |
| **CloudFront/R2 CDN** _(optional)_       | Edge-cache S3 files for faster delivery      |
| **Shopify Storefront API token**         | Read-only access to product media            |
| **OpenAI API key**                       | GPT-4o Vision + Image Generation             |
| **Vercel Deploy Hook URL**               | Triggers storefront rebuild after each image |

---

## Environment variables

Add these as **GitHub Secrets** (repo → Settings → Secrets → Actions):

```bash
OPENAI_API_KEY           = x-sk-...
SHOPIFY_DOMAIN           = a-ok.myshopify.com
SHOPIFY_STOREFRONT_TOKEN = shpat_...
AWS_ACCESS_KEY_ID        = ...
AWS_SECRET_ACCESS_KEY    = ...
S3_BUCKET                = aok-artifacts
VERCEL_DEPLOY_HOOK_URL   = https://api.vercel.com/...
```

---

## Customising brand behaviour

- **Brand rules** are a single string in `src/craftPrompt.ts`. Tweak typography, palette, or vibe there.
- **Image size** (`generateImage.ts`) defaults to 1024×1024; change to 1792×1024 if you want a banner.
- **Retention**: add an S3 lifecycle rule to transition files older than 90 days to Glacier.

---

## Error handling & cost guards

- Script aborts if OpenAI spend today ≥ $0.20 (see `checkUsage()` helper).
- If Shopify or S3 APIs fail → the GitHub job exits **without** touching manifest or triggering deploy.
- Previous day's art remains live—storefront never breaks.

---

## License

[MIT](LICENSE)
