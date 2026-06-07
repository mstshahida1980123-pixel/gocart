import fs from 'fs/promises'
import path from 'path'
import { getToken } from 'next-auth/jwt'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary from env (if provided)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req) {
  try {
    // Only admins may upload files
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      })
    }

    const body = await req.json()
    const { image, folder } = body
    if (!image) return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400, headers: { 'content-type': 'application/json' } })

    const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET

    // If Cloudinary is configured, try uploading there
    if (useCloudinary) {
      // Accept base64 data URLs or remote URLs
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:(.+);base64,(.+)$/)
        if (!matches) return new Response(JSON.stringify({ error: 'Invalid data URL' }), { status: 400, headers: { 'content-type': 'application/json' } })
        const mime = matches[1]
        const data = matches[2]
        const dataUri = `data:${mime};base64,${data}`
        const res = await cloudinary.uploader.upload(dataUri, { folder: folder || 'uploads' })
        return new Response(JSON.stringify({ url: res.secure_url, provider: 'cloudinary' }), { status: 200, headers: { 'content-type': 'application/json' } })
      } else {
        // If it's a remote URL, tell Cloudinary to fetch it
        const res = await cloudinary.uploader.upload(image, { folder: folder || 'uploads', resource_type: 'image' })
        return new Response(JSON.stringify({ url: res.secure_url, provider: 'cloudinary' }), { status: 200, headers: { 'content-type': 'application/json' } })
      }
    }

    // Fallback: save base64 data URL to public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    if (image.startsWith('data:')) {
      const matches = image.match(/^data:(.+);base64,(.+)$/)
      if (!matches) return new Response(JSON.stringify({ error: 'Invalid data URL' }), { status: 400, headers: { 'content-type': 'application/json' } })
      const ext = matches[1].split('/')[1].split('+')[0] || 'png'
      const data = matches[2]
      const buf = Buffer.from(data, 'base64')
      const fileName = `upload-${Date.now()}.${ext}`
      const filePath = path.join(uploadsDir, fileName)
      await fs.writeFile(filePath, buf)
      const url = `/uploads/${fileName}`
      return new Response(JSON.stringify({ url, local: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    }

    // If it's a URL, return it as-is
    return new Response(JSON.stringify({ url: image }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Upload failed', details: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
