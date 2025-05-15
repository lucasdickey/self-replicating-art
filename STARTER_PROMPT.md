## Coding‑Agent Instructions: A‑OK Daily Image Generator

You are an autonomous coding agent working inside Windsurf IDE. Your mission is to implement the detached micro‑service that powers the A‑OK daily image‑generation pipeline as described below.

---

### 1. Repository Bootstrap

1. Initialise a **Node v20 TypeScript** project (`npm init -y`, `tsc --init`).
2. Install dependencies:

   ```bash
   npm i openai graphql-request @aws-sdk/client-s3 dotenv
   npm i -D typescript ts-node @types/node
   ```
3. Create the folder structure:

   ```text
   src/
     fetchShopifyMedia.ts
     listS3GridImages.ts
     craftPrompt.ts
     generateImage.ts
     uploadToS3.ts
     index.ts
   .github/workflows/daily.yml
   manifest.json (seed with [])
   ```
4. Commit `.gitignore` for `node_modules/`, `dist/`, `.env`.

---

### 2. Implement Scripts

#### **fetchShopifyMedia.ts**

* GraphQL query against `https://$SHOPIFY_DOMAIN/api/2024-10/graphql.json`.
* Use env vars `SHOPIFY_DOMAIN` & `SHOPIFY_STOREFRONT_TOKEN`.
* Return `Array<{url:string, alt:string}>`.

#### **listS3GridImages.ts**

* AWS SDK v3: `ListObjectsV2` for prefix `grid/` in bucket `$S3_BUCKET`.
* Return the same array shape.

#### **craftPrompt.ts**

* Export constant `BRAND_RULES` (red/black/white, Hitchcock poster, stencil ape).
* `makePrompt(descriptors:string[]) => string`.

#### **generateImage.ts**

* Use OpenAI Images API (`model:"gpt-image-1"`, `size:"1024x1024"`).
* Accept prompt, return `Buffer`.

#### **uploadToS3.ts**

* Upload buffer as `daily/YYYY-MM-DD.png` to `$S3_BUCKET`.
* Return public URL.

#### **index.ts** (orchestrator)

1. Load `.env`.
2. Aggregate descriptors from Shopify + S3.
3. Build prompt; log to stdout.
4. Generate image; upload; receive URL.
5. Prepend `{date,prompt,url}` to `manifest.json` (ensure max 365 entries).
6. Commit changes only if `GITHUB_ACTIONS` env is true (guard for local runs).
7. POST `$VERCEL_DEPLOY_HOOK_URL`.

---

### 3. GitHub Actions Workflow

File: `.github/workflows/daily.yml`

```yaml
name: AOK_Daily_Image
on:
  schedule: [{ cron: '0 13 * * *' }]
  workflow_dispatch:
jobs:
  run:
    runs-on: ubuntu-latest
    permissions: { contents: write }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx ts-node src/index.ts
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          SHOPIFY_DOMAIN: ${{ secrets.SHOPIFY_DOMAIN }}
          SHOPIFY_STOREFRONT_TOKEN: ${{ secrets.SHOPIFY_STOREFRONT_TOKEN }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          S3_BUCKET: ${{ secrets.S3_BUCKET }}
          VERCEL_DEPLOY_HOOK_URL: ${{ secrets.VERCEL_DEPLOY_HOOK_URL }}
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore(auto-art): add $(date -I)"
```

---

### 4. Local Test Script

Add `npm start` alias:

```json
"scripts": {
  "start": "ts-node src/index.ts"
}
```

---

### 5. Done Criteria

* `npm start` outputs ✅ lines for upload, manifest update, deploy‑hook.
* GitHub Action passes on main.
* README.md exists with project overview.
