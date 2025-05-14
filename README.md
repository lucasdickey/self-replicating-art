# A‑OK Image Agent

Automated service that **pulls every product & grid image from Apes On Keys (Shopify + S3)**, distills them with GPT‑4o Vision, generates a fresh on‑brand graphic via OpenAI’s Image Generation API, stores the file in S3, updates a JSON manifest, and pings a Vercel Deploy Hook so the storefront grid self‑replicates daily.

---

## Architecture

```text
GitHub Actions (cron)
   └─▶ Node script (src/index.ts)
         ├─ fetchShopifyMedia.ts  ← Storefront GraphQL API
         ├─ listS3GridImages.ts  ← AWS S3 ListObjectsV2 (grid/ prefix)
         ├─ craftPrompt.ts       ← brand rules + descriptors
         ├─ generateImage.ts     ← OpenAI imagegen 1×1024 PNG
         ├─ uploadToS3.ts        ← S3 putObject (daily/2025‑05‑13.png)
         └─ manifest.json update + Vercel Deploy Hook
```

---

## Prerequisites

| Item                                     | Purpose                                      |
| ---------------------------------------- | -------------------------------------------- |
| **Node ≥ 20**                            | Runtime for the agent scripts                |
| **GitHub repo**                          | Hosts code & scheduled workflow              |
| **AWS S3 bucket** (e.g. `aok-artifacts`) | Stores generated images & grid assets        |
| **CloudFront/R2 CDN** _(optional)_       | Edge‑cache S3 files for faster delivery      |
| **Shopify Storefront API token**         | Read‑only access to product media            |
| **OpenAI API key**                       | GPT‑4o Vision + Image Generation             |
| **Vercel Deploy Hook URL**               | Triggers storefront rebuild after each image |

---

## Environment variables

Add these as **GitHub Secrets** (repo → Settings → Secrets → Actions):

```bash
OPENAI_API_KEY           = x‑sk‑...
SHOPIFY_DOMAIN           = a-ok.myshopify.com
SHOPIFY_STOREFRONT_TOKEN = shpat_...
AWS_ACCESS_KEY_ID        = ...
AWS_SECRET_ACCESS_KEY    = ...
S3_BUCKET                = aok-artifacts
VERCEL_DEPLOY_HOOK_URL   = https://api.vercel.com/...
```

---

## Setup & local test

```bash
# 1. clone & install
$ git clone https://github.com/your-org/aok-image-agent.git
$ cd aok-image-agent && npm ci

# 2. create .env (only for local runs)
$ cp .env.example .env

# 3. run once to verify end‑to‑end
$ npm start             # alias: node dist/index.js
```

If it succeeds you should see:

```
✅  Uploaded daily/2025‑05‑13.png (1024×1024)
✅  manifest.json updated (total 27 entries)
✅  Vercel deploy hook: 200 OK
```

---

## GitHub Actions schedule

Workflow: `.github/workflows/daily.yml`

```yaml
on:
  schedule: [{ cron: "0 13 * * *" }] # 06:00 PST daily
  workflow_dispatch: # manual run button
```

Edit the `cron` string if you need a different cadence.

---

## Customising brand behaviour

- **Brand rules** are a single string in `src/craftPrompt.ts`. Tweak typography, palette, or vibe there.
- **Image size** (`generateImage.ts`) defaults to 1024×1024; change to 1792×1024 if you want a banner.
- **Retention**: add an S3 lifecycle rule to transition files older than 90 days to Glacier.

---

## Error handling & cost guards

- Script aborts if OpenAI spend today ≥ \$0.20 (see `checkUsage()` helper).
- If Shopify or S3 APIs fail → the GitHub job exits **without** touching manifest or triggering deploy.
- Previous day’s art remains live—storefront never breaks.

---

## License

[MIT](LICENSE)
