import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'development-nextauth-secret'

export async function GET(req) {
  try {
    const siteSetting = await prisma.siteSetting.findUnique({
      where: { id: 'site' },
    })

    if (!siteSetting) {
      // Return default values if record doesn't exist
      return new Response(JSON.stringify({
        settings: {
          dhakaInsideCharge: 70,
          dhakaOutsideCharge: 120,
          codActive: true,
          bkashActive: true,
          bkashNumber: '',
          nagadActive: true,
          nagadNumber: '',
          bkashInstruction: 'বিকাশ নম্বর: {number} — পার্সোনাল নম্বরে Send Money করুন এবং ট্রানজেকশন আইডি দিন।',
          nagadInstruction: 'নগদ নম্বর: {number} — পার্সোনাল নম্বরে Send Money করুন এবং ট্রানজেকশন আইডি দিন।',
        }
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    }

    // Return the fields relevant to orders
    const settings = {
      dhakaInsideCharge: siteSetting.dhakaInsideCharge ?? 70,
      dhakaOutsideCharge: siteSetting.dhakaOutsideCharge ?? 120,
      codActive: siteSetting.codActive ?? true,
      bkashActive: siteSetting.bkashActive ?? true,
      bkashNumber: siteSetting.bkashNumber ?? '',
      nagadActive: siteSetting.nagadActive ?? true,
      nagadNumber: siteSetting.nagadNumber ?? '',
      bkashInstruction: siteSetting.bkashInstruction || 'বিকাশ নম্বর: {number} — পার্সোনাল নম্বরে Send Money করুন এবং ট্রানজেকশন আইডি দিন।',
      nagadInstruction: siteSetting.nagadInstruction || 'নগদ নম্বর: {number} — পার্সোনাল নম্বরে Send Money করুন এবং ট্রানজেকশন আইডি দিন।',
    }

    return new Response(JSON.stringify({ settings }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('order-settings GET error', err)
    return new Response(JSON.stringify({ error: 'Failed to load order settings' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }

    const body = await req.json()
    
    // Validate/parse inputs
    const dhakaInsideCharge = parseFloat(body.dhakaInsideCharge) ?? 70
    const dhakaOutsideCharge = parseFloat(body.dhakaOutsideCharge) ?? 120
    const codActive = body.codActive !== undefined ? Boolean(body.codActive) : true
    const bkashActive = body.bkashActive !== undefined ? Boolean(body.bkashActive) : true
    const bkashNumber = body.bkashNumber !== undefined ? String(body.bkashNumber) : ''
    const nagadActive = body.nagadActive !== undefined ? Boolean(body.nagadActive) : true
    const nagadNumber = body.nagadNumber !== undefined ? String(body.nagadNumber) : ''
    const bkashInstruction = body.bkashInstruction !== undefined ? String(body.bkashInstruction) : ''
    const nagadInstruction = body.nagadInstruction !== undefined ? String(body.nagadInstruction) : ''

    const siteSetting = await prisma.siteSetting.upsert({
      where: { id: 'site' },
      update: {
        dhakaInsideCharge,
        dhakaOutsideCharge,
        codActive,
        bkashActive,
        bkashNumber,
        nagadActive,
        nagadNumber,
        bkashInstruction,
        nagadInstruction,
      },
      create: {
        id: 'site',
        dhakaInsideCharge,
        dhakaOutsideCharge,
        codActive,
        bkashActive,
        bkashNumber,
        nagadActive,
        nagadNumber,
        bkashInstruction,
        nagadInstruction,
      },
    })

    const settings = {
      dhakaInsideCharge: siteSetting.dhakaInsideCharge,
      dhakaOutsideCharge: siteSetting.dhakaOutsideCharge,
      codActive: siteSetting.codActive,
      bkashActive: siteSetting.bkashActive,
      bkashNumber: siteSetting.bkashNumber,
      nagadActive: siteSetting.nagadActive,
      nagadNumber: siteSetting.nagadNumber,
      bkashInstruction: siteSetting.bkashInstruction,
      nagadInstruction: siteSetting.nagadInstruction,
    }

    return new Response(JSON.stringify({ settings }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('order-settings PUT error', err)
    return new Response(JSON.stringify({ error: 'Failed to update order settings' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
