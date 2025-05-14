aok-image-agent/
├─ .github/workflows/daily.yml
├─ src/
│ ├─ fetchShopifyMedia.ts # Storefront API → product titles, media URLs, alt text
│ ├─ listS3GridImages.ts # a-ok.shop gallery API → grid images
│ ├─ craftPrompt.ts # brand rules + descriptors → final prompt
│ ├─ generateImage.ts # OpenAI imagegen call
│ ├─ uploadToS3.ts # writes new file to public/daily/ & updates manifest.json
│ └─ index.ts # orchestrator
├─ public/
│ ├─ daily/ # generated images
│ └─ grid/ # grid images (if needed)
└─ manifest.json # { date, prompt, imageUrl }[] (committed back)
