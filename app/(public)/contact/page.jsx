"use client"
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSiteSettings } from '@/context/SiteSettingsContext'

const parseSocialLinks = (value) => {
    if (Array.isArray(value)) return value
    if (!value) return []
    try {
        return JSON.parse(value)
    } catch {
        return []
    }
}

export default function ContactPage() {
    const { settings, isLoading } = useSiteSettings()
    const [localSettings, setLocalSettings] = useState({ phone: '+1 (800) 322-1384', email: 'support@gocart.com', address: '425 Market Street, San Francisco, CA', socialLinks: [] })
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [status, setStatus] = useState('')

    useEffect(() => {
        if (!isLoading && settings) {
            setLocalSettings(settings)
        }
    }, [isLoading, settings])

    if (isLoading) return null

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('Sending message...')
        try {
            const res = await fetch('/api/contact-messages', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (res.ok) {
                setStatus('Thanks for your message! We will get back to you soon.')
                setForm({ name: '', email: '', message: '' })
            } else {
                const error = await res.json()
                setStatus(error?.error || 'Failed to send message')
            }
        } catch (err) {
            console.error(err)
            setStatus('Failed to send message')
        }
    }

    const TiktokIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.81 5.85c-.13.17-.28.33-.43.48-.76.75-1.72 1.22-2.8 1.3v4.4c0 1.83-1.49 3.32-3.32 3.32-1.84 0-3.34-1.5-3.34-3.32 0-1.84 1.5-3.34 3.34-3.34.26 0 .51.03.75.08v2.3c-.18-.03-.37-.05-.56-.05-1.13 0-2.07.92-2.07 2.07 0 1.14.93 2.07 2.07 2.07 1.14 0 2.07-.93 2.07-2.07V7.38c.76-.1 1.48-.44 2.07-.99v4.99c0 1.95-1.58 3.53-3.53 3.53-1.95 0-3.53-1.58-3.53-3.53 0-1.95 1.58-3.53 3.53-3.53.55 0 1.07.12 1.54.34V5.85Z" fill="#90A1B9" />
        </svg>
    )

    return (
        <main className="bg-white text-slate-800">
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.05),_transparent_40%)]" />
                <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                        <div className="space-y-6">
                            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm uppercase tracking-[0.2em] text-emerald-700">
                                <Mail size={16} /> Let’s talk
                            </p>
                            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                Questions? feedback? Let’s connect.
                            </h1>
                            <p className="max-w-2xl text-slate-600 text-base sm:text-lg leading-8">
                                Reach out for support, partnerships, or product guidance. Our team is ready to help you find the right gear at the right price.
                            </p>
                        </div>
                        <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-8 shadow-xl shadow-slate-100/40">
                            <div className="space-y-6">
                                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Office hours</p>
                                    <p className="mt-3 text-xl font-semibold text-slate-900">Mon – Fri, 9am – 6pm</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                        <Phone size={24} className="text-emerald-600" />
                                        <div>
                                            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Phone</p>
                                                                    <p className="mt-2 text-lg text-slate-950 font-medium">{localSettings.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                        <Mail size={24} className="text-emerald-600" />
                                        <div>
                                            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Email</p>
                                            <p className="mt-2 text-lg text-slate-950 font-medium">{localSettings.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                        <MapPin size={24} className="text-emerald-600" />
                                        <div>
                                            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Address</p>
                                            <p className="mt-2 text-lg text-slate-950 font-medium">{localSettings.address}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Follow us</p>
                                    <div className="mt-4 flex flex-wrap gap-3 text-slate-600">
                                        {(parseSocialLinks(settings.socialLinks) || [])
                                            .filter((link) => link.url && link.url.trim())
                                            .map((link, index) => {
                                                const iconMap = {
                                                    Facebook: Facebook,
                                                    Instagram: Instagram,
                                                    Twitter: Twitter,
                                                    'Twitter / X': Twitter,
                                                    'X / Twitter': Twitter,
                                                    LinkedIn: Linkedin,
                                                    YouTube: Youtube,
                                                    TikTok: TiktokIcon,
                                                }
                                                const Icon = iconMap[link.platform] || Instagram
                                                return (
                                                    <a key={index} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-emerald-500 hover:text-emerald-600 shadow-sm">
                                                        <Icon size={18} className="text-slate-600" /> {link.platform}
                                                    </a>
                                                )
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-8 shadow-xl shadow-slate-100/40">
                            <h2 className="text-3xl font-semibold text-slate-900">Send us a message</h2>
                            <p className="mt-4 text-slate-600 leading-7">Have a question or a product request? Drop your details below and we’ll reply quickly.</p>
                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <label className="space-y-2 text-sm text-slate-600 flex flex-col">
                                        Name
                                        <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 shadow-sm" />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-600 flex flex-col">
                                        Email
                                        <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 shadow-sm" />
                                    </label>
                                </div>
                                <label className="space-y-2 text-sm text-slate-600 flex flex-col">
                                    Message
                                    <textarea name="message" value={form.message} onChange={handleChange} rows="6" required className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none transition focus:border-emerald-500 shadow-sm" />
                                </label>
                                <button type="submit" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-600/10 transition hover:bg-emerald-700">
                                    Send message
                                </button>
                                {status ? <p className="mt-4 text-sm text-emerald-600">{status}</p> : null}
                            </form>
                        </div>
                        <div className="space-y-6">
                            <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-8 shadow-xl shadow-slate-100/40">
                                <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Need help now?</p>
                                <h2 className="mt-4 text-3xl font-semibold text-slate-900">Chat with our support team.</h2>
                                <p className="mt-4 text-slate-600 leading-7">Our support specialists are available to help with orders, shipping, returns, and product questions.</p>
                                <div className="mt-6 space-y-4 text-slate-600">
                                    <p className="flex items-center gap-3"><Phone size={18} className="text-emerald-500" /> {settings.phone}</p>
                                    <p className="flex items-center gap-3"><Mail size={18} className="text-emerald-500" /> {settings.email}</p>
                                    <p className="flex items-center gap-3"><MapPin size={18} className="text-emerald-500" /> {settings.address}</p>
                                </div>
                            </div>
                            <div className="rounded-[2rem] border border-slate-100 bg-white p-8 text-slate-600 shadow-sm">
                                <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Our promise</p>
                                <p className="mt-4 leading-7">Fast replies, friendly advice, and clearly defined service terms. We work hard so every shopper feels heard and supported.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
