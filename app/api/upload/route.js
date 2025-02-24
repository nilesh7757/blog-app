// app/api/upload/route.js
import { NextResponse } from 'next/server';
import aws from 'aws-sdk';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${Date.now()}-${file.name}`,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    ACL: 'public-read',
  };

  const data = await s3.upload(params).promise();
  return NextResponse.json({ url: data.Location, key: data.Key });
}