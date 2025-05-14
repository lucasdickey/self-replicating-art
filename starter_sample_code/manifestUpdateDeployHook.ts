const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
manifest.unshift({ date: Date.now(), prompt, url });
fs.writeFileSync("manifest.json", JSON.stringify(manifest, null, 2));
await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" });
