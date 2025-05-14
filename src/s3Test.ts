import "dotenv/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucket = process.env.S3_BUCKET!;
const key = "test.txt";
const testContent = "Hello from S3 test script!";

async function uploadTestFile() {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: testContent,
      ContentType: "text/plain",
    })
  );
  console.log(`✅ Uploaded ${key} to S3`);
}

async function fetchTestFile() {
  const { Body } = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
  const stream = Body as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  const content = Buffer.concat(chunks).toString("utf-8");
  console.log(`✅ Fetched ${key} from S3:`, content);
}

(async () => {
  await uploadTestFile();
  await fetchTestFile();
})();
