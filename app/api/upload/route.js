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

const sendError = (message, status = 500) =>
  NextResponse.json({ error: message }, { status });

const blobToDataUrl = async (blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${blob.type || "application/octet-stream"};base64,${base64}`;
};

export async function POST(request) {
  if (missingCloudinaryEnv.length) {
    return sendError(`Missing Cloudinary env vars: ${missingCloudinaryEnv.join(", ")}`);
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let uploadSource;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const image = body?.image;
      if (!image || typeof image !== "string") {
        return sendError("Invalid JSON payload: expected image string in body.image", 400);
      }
      uploadSource = image;
    } else {
      const formData = await request.formData();
      const file = formData.get("file") || formData.get("image");
      if (!file) {
        return sendError("No file provided in form data", 400);
      }

      if (typeof file === "string") {
        uploadSource = file;
      } else if (file && typeof file.arrayBuffer === "function") {
        uploadSource = await blobToDataUrl(file);
      } else {
        return sendError("Unsupported file upload type", 400);
      }
    }

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: "gocart",
    });

    if (!result?.secure_url) {
      return sendError("Cloudinary upload succeeded but no secure_url was returned", 500);
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    const message = err?.message || String(err) || "Unknown upload error";
    return sendError(`Upload failed: ${message}`);
  }
}
