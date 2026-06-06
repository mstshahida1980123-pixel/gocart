import fs from 'fs/promises'
import path from 'path'
import { getToken } from 'next-auth/jwt'

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

    // Fallback only: save base64 data URL to public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    // accept data URLs or remote urls
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
