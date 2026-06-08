 'use client'
import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import { clearSiteSettingsCache } from '@/lib/siteSettings'
import { useSiteSettings } from '@/context/SiteSettingsContext'

export default function AdminSiteSettingsPage() {
  const [loading, setLoading] = useState(true)
  const { settings: ctxSettings, isLoading } = useSiteSettings()
  const [settings, setSettings] = useState({
    siteName: '',
    announcement: '',
    headerNav: [],
    footerProducts: [],
    footerWebsite: [],
    copyrightText: '',
    phone: '',
    email: '',
    address: '',
    logoImage: '',
    socialLinks: [],
  })
  const [status, setStatus] = useState('')

  const parseJsonOrArray = (value) => {
    if (Array.isArray(value)) return value
    if (!value) return []
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }

  const normalizeSiteSettings = (siteSetting) => ({
    siteName: siteSetting.siteName || 'gocart',
    announcement: siteSetting.announcement || '',
    headerNav: parseJsonOrArray(siteSetting.headerNav),
    footerProducts: parseJsonOrArray(siteSetting.footerProducts),
    footerWebsite: parseJsonOrArray(siteSetting.footerWebsite),
    copyrightText: siteSetting.copyrightText || '',
    phone: siteSetting.phone || '',
    email: siteSetting.email || '',
    address: siteSetting.address || '',
    logoImage: siteSetting.logoImage || '',
    socialLinks: parseJsonOrArray(siteSetting.socialLinks),
  })

  useEffect(() => {
    if (!isLoading && ctxSettings) {
      setSettings(normalizeSiteSettings(ctxSettings))
      setLoading(false)
    }
  }, [isLoading, ctxSettings])

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ image: reader.result }),
        })
        const json = await res.json()
        if (json.url) {
          setSettings((prev) => ({ ...prev, logoImage: json.url }))
        }
      } catch (err) {
        console.error('Logo upload failed', err)
      }
    }
    reader.readAsDataURL(file)
  }

  const platformOptions = [
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'Twitter', label: 'Twitter / X' },
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'YouTube', label: 'YouTube' },
    { value: 'TikTok', label: 'TikTok' },
  ]

  const updateArrayItem = (field, index, key, value) => {
    const arr = Array.isArray(settings[field]) ? [...settings[field]] : []
    arr[index] = { ...arr[index], [key]: value }
    setSettings({ ...settings, [field]: arr })
  }

  const addArrayItem = (field, item = { text: '', url: '' }) => {
    const arr = Array.isArray(settings[field]) ? [...settings[field]] : []
    arr.push(item)
    setSettings({ ...settings, [field]: arr })
  }

  const removeArrayItem = (field, index) => {
    const arr = Array.isArray(settings[field]) ? [...settings[field]] : []
    arr.splice(index, 1)
    setSettings({ ...settings, [field]: arr })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Saving settings...')
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const json = await res.json()
      if (res.ok) {
        clearSiteSettingsCache()
        setSettings(normalizeSiteSettings(json.siteSetting))
        setStatus('Site settings saved successfully.')
      } else {
        setStatus(json.error || 'Failed to update settings')
      }
    } catch (err) {
      console.error(err)
      setStatus('Failed to update settings')
    }
  }

  if (loading) {
    return <div className="p-6">Loading site settings...</div>
  }

  return (
    <div className="text-slate-600 mb-28 p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="text-emerald-500" size={24} />
        <div>
          <h1 className="text-3xl font-semibold">Site <span className="text-slate-800">Settings</span></h1>
          <p className="text-sm text-slate-500">Manage header, contact, and footer content shown across the public site.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">General</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Site Name</h2>
              <p className="mt-2 text-sm text-slate-500">Update your store name displayed in the header and footer.</p>
            </div>
          </div>
          <div className="grid gap-6">
            <label className="block text-sm font-medium text-slate-700">
              Site Name
              <input
                name="siteName"
                value={settings.siteName || ''}
                onChange={handleChange}
                placeholder="gocart"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                required
              />
            </label>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Header Settings</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Announcement & Navigation</h2>
              <p className="mt-2 text-sm text-slate-500">Edit the announcement bar text and header navigation links.</p>
            </div>
          </div>
          <div className="grid gap-6">
            <label className="block text-sm font-medium text-slate-700">
              Announcement text
              <input
                name="announcement"
                value={settings.announcement || ''}
                onChange={handleChange}
                placeholder="Short announcement text"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>
            <div>
              <p className="text-sm font-medium text-slate-700">Header Navigation Links</p>
              <p className="text-xs text-slate-500 mb-2">Edit link name and URL shown in the header.</p>
              <div className="space-y-3">
                {(settings.headerNav || []).map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={link.name || link.text || ''} onChange={(e) => updateArrayItem('headerNav', i, 'name', e.target.value)} placeholder="Label" className="w-1/3 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-2" />
                    <input value={link.url || ''} onChange={(e) => updateArrayItem('headerNav', i, 'url', e.target.value)} placeholder="/path or https://..." className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-2" />
                    <button type="button" onClick={() => removeArrayItem('headerNav', i)} className="px-3 py-2 bg-red-50 text-red-600 rounded">Remove</button>
                  </div>
                ))}
                <div>
                  <button type="button" onClick={() => addArrayItem('headerNav', { name: '', url: '' })} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded">Add link</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Branding</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Logo image</h2>
              <p className="mt-2 text-sm text-slate-500">Upload a logo to display in the header and footer when available.</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Site logo</label>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500" />
              {settings.logoImage ? (
                <img src={settings.logoImage} alt="Site logo preview" className="mt-4 h-28 w-full rounded-3xl border border-slate-200 object-contain bg-white" />
              ) : (
                <div className="mt-4 flex h-28 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">No logo uploaded</div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-3">
            <label className="block text-sm font-medium text-slate-700">
              Phone
              <input
                name="phone"
                value={settings.phone || ''}
                onChange={handleChange}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                name="email"
                type="email"
                value={settings.email || ''}
                onChange={handleChange}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Address
              <textarea
                name="address"
                value={settings.address || ''}
                onChange={handleChange}
                rows={3}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                required
              />
            </label>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Social Media Links</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Social media</h2>
              <p className="mt-2 text-sm text-slate-500">Add or remove public social profiles used in the footer and contact page.</p>
            </div>
          </div>
          <div className="space-y-4">
            {(settings.socialLinks || []).map((link, i) => (
              <div key={i} className="grid gap-4 sm:grid-cols-[1fr_2fr_auto] items-end">
                <label className="block text-sm font-medium text-slate-700">
                  Platform
                  <select
                    value={link.platform || ''}
                    onChange={(e) => updateArrayItem('socialLinks', i, 'platform', e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                  >
                    <option value="" disabled>Select platform</option>
                    {platformOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  URL
                  <input
                    value={link.url || ''}
                    onChange={(e) => updateArrayItem('socialLinks', i, 'url', e.target.value)}
                    placeholder="https://"
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                  />
                </label>
                <button type="button" onClick={() => removeArrayItem('socialLinks', i)} className="inline-flex items-center justify-center rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100">
                  Remove
                </button>
              </div>
            ))}
            <div>
              <button type="button" onClick={() => addArrayItem('socialLinks', { platform: 'Facebook', url: '' })} className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100">
                Add social link
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6">
            <div>
              <p className="text-sm font-medium text-slate-700">Products Links</p>
              <div className="space-y-3 mt-2">
                {(settings.footerProducts || []).map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={link.text || ''} onChange={(e) => updateArrayItem('footerProducts', i, 'text', e.target.value)} placeholder="Text" className="w-1/3 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-2" />
                    <input value={link.url || ''} onChange={(e) => updateArrayItem('footerProducts', i, 'url', e.target.value)} placeholder="/path" className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-2" />
                    <button type="button" onClick={() => removeArrayItem('footerProducts', i)} className="px-3 py-2 bg-red-50 text-red-600 rounded">Remove</button>
                  </div>
                ))}
                <div>
                  <button type="button" onClick={() => addArrayItem('footerProducts', { text: '', url: '' })} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded">Add product link</button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">Website Links</p>
              <div className="space-y-3 mt-2">
                {(settings.footerWebsite || []).map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={link.text || ''} onChange={(e) => updateArrayItem('footerWebsite', i, 'text', e.target.value)} placeholder="Text" className="w-1/3 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-2" />
                    <input value={link.url || ''} onChange={(e) => updateArrayItem('footerWebsite', i, 'url', e.target.value)} placeholder="/path" className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-2" />
                    <button type="button" onClick={() => removeArrayItem('footerWebsite', i)} className="px-3 py-2 bg-red-50 text-red-600 rounded">Remove</button>
                  </div>
                ))}
                <div>
                  <button type="button" onClick={() => addArrayItem('footerWebsite', { text: '', url: '' })} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded">Add website link</button>
                </div>
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Copyright text
              <input
                name="copyrightText"
                value={settings.copyrightText || ''}
                onChange={handleChange}
                placeholder="Copyright text shown in footer"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400">
            Save changes
          </button>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </div>
      </form>
    </div>
  )
}
