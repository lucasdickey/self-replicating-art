# Coding Agent Guide

This repo contains the A-OK Daily Image Generator. It is a Node 20 + TypeScript project that creates a new graphic every day.

## Setup
1. Run `npm install` to install dependencies.
2. Provide the following environment variables before running the script: `OPENAI_API_KEY`, `SHOPIFY_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `VERCEL_DEPLOY_HOOK_URL`.

## Usage
- Execute `npm start` to generate an image locally. The result is saved under `public/daily/` and recorded in `manifest.json`.
- Generated files should be committed when the script succeeds.

## Checks
- Run `npm run build` to compile TypeScript and ensure there are no errors before committing.
- There are currently no automated tests.

## Automation
- `.github/workflows/daily.yml` runs the generator twice per day on GitHub Actions.

