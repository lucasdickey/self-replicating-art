const openai = new OpenAI();
const { data } = await openai.images.generate({
  prompt,
  n: 1,
  size: "1024x1024",
});
const buf = Buffer.from(data[0].b64_json, "base64");

const key = `daily/${new Date().toISOString().split("T")[0]}.png`;
await s3.send(
  new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buf,
    ContentType: "image/png",
  })
);
const url = `https://${bucket}.s3.amazonaws.com/${key}`;
