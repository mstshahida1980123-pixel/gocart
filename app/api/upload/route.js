import fs from 'fs/promises'
import path from 'path'
import { getToken } from 'next-auth/jwt'
import { v2 as cloudinary } from 'cloudinary'

export async function POST(req) {
  try {
    // Only admins may upload files
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      })
    }

    const body = await req.json()
    const { image, folder } = body
    if (!image) return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400, headers: { 'content-type': 'application/json' } })

    const useCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    
    // Configure Cloudinary at request time (not module load time)
    if (useCloudinary) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
    }

    // If Cloudinary is configured, try uploading there
    if (useCloudinary) {
      try {
        // Accept base64 data URLs or remote URLs
        if (image.startsWith('data:')) {
          const matches = image.match(/^data:(.+);base64,(.+)$/)
          if (!matches) return new Response(JSON.stringify({ error: 'Invalid data URL format' }), { status: 400, headers: { 'content-type': 'application/json' } })
          const mime = matches[1]
          const data = matches[2]
          const dataUri = `data:${mime};base64,${data}`
          
          // Validate base64 size (max ~20MB)
          if (data.length > 20 * 1024 * 1024) {
            return new Response(JSON.stringify({ error: 'Image file too large (max 20MB)' }), { status: 400, headers: { 'content-type': 'application/json' } })
          }
          
          console.log('upload: uploading base64 image to cloudinary', { folder, mime, size: data.length })
          const res = await cloudinary.uploader.upload(dataUri, { 
            folder: folder || 'uploads',
            resource_type: 'auto',
            timeout: 60000,
          })
          console.log('upload: cloudinary upload success', { url: res.secure_url, public_id: res.public_id })
          return new Response(JSON.stringify({ url: res.secure_url, provider: 'cloudinary', public_id: res.public_id }), { status: 200, headers: { 'content-type': 'application/json' } })
        } else {
          // If it's a remote URL, tell Cloudinary to fetch it
          console.log('upload: uploading remote URL to cloudinary', { image: image.substring(0, 50), folder })
          const res = await cloudinary.uploader.upload(image, { 
            folder: folder || 'uploads', 
            resource_type: 'auto',
            timeout: 60000,
          })
          console.log('upload: cloudinary upload success', { url: res.secure_url, public_id: res.public_id })
          return new Response(JSON.stringify({ url: res.secure_url, provider: 'cloudinary', public_id: res.public_id }), { status: 200, headers: { 'content-type': 'application/json' } })
        }
      } catch (cloudinaryErr) {
        console.error('upload: cloudinary upload failed', { 
          error: cloudinaryErr.message, 
          code: cloudinaryErr.code,
          status: cloudinaryErr.status,
          http_code: cloudinaryErr.http_code,
        })
        // Only fall through to local if not a configuration error
        if (cloudinaryErr.message && (cloudinaryErr.message.includes('signature') || cloudinaryErr.message.includes('unauthorized'))) {
          return new Response(JSON.stringify({ error: 'Cloudinary authentication failed', details: cloudinaryErr.message }), { status: 500, headers: { 'content-type': 'application/json' } })
        }
        console.log('upload: falling back to local storage')
      }
    } else {
      console.log('upload: cloudinary not configured', { 
        hasCloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME), 
        hasApiKey: Boolean(process.env.CLOUDINARY_API_KEY), 
        hasApiSecret: Boolean(process.env.CLOUDINARY_API_SECRET) 
      })
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
    console.error('upload: POST error', { message: err.message, stack: err.stack })
    return new Response(JSON.stringify({ error: 'Upload failed', details: process.env.NODE_ENV === 'development' ? String(err) : undefined }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
