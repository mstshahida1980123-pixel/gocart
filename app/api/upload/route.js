import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const missingCloudinaryEnv = [
  !process.env.CLOUDINARY_CLOUD_NAME && 'CLOUDINARY_CLOUD_NAME',
  !process.env.CLOUDINARY_API_KEY && 'CLOUDINARY_API_KEY',
  !process.env.CLOUDINARY_API_SECRET && 'CLOUDINARY_API_SECRET',
].filter(Boolean);

export async function POST(request) {
  try {
    if (missingCloudinaryEnv.length) {
      return NextResponse.json(
        { error: `Missing Cloudinary env vars: ${missingCloudinaryEnv.join(', ')}` },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let cloudinaryResult;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const image = body?.image;
      if (!image) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
      }
      cloudinaryResult = await cloudinary.uploader.upload(image, { folder: "gocart" });
    } else {
      const formData = await request.formData();
      const file = formData.get("file") || formData.get("image");
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      if (typeof file === "string") {
        cloudinaryResult = await cloudinary.uploader.upload(file, { folder: "gocart" });
      } else {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        cloudinaryResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({ folder: "gocart" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          uploadStream.end(buffer);
        });
      }
    }

    return NextResponse.json({ url: cloudinaryResult.secure_url });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed", details: String(err) }, { status: 500 });
  }
}
