aok-image-agent/
├─ .github/workflows/daily.yml
├─ src/
│ ├─ fetchShopifyMedia.ts # Storefront API → product titles, media URLs, alt text
│ ├─ listS3GridImages.ts # AWS SDK v3 → listObjectsV2(prefix="grid/")
│ ├─ craftPrompt.ts # brand rules + descriptors → final prompt
│ ├─ generateImage.ts # OpenAI imagegen call
│ ├─ uploadToS3.ts # puts new file & updates manifest.json
│ └─ index.ts # orchestrator
└─ manifest.json # { date, prompt, imageUrl }[] (committed back)
