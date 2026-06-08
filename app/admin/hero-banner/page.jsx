 'use client'
import { useEffect, useState } from 'react'
import { Sliders, UploadCloud, Check, X, Download, Trash2 } from 'lucide-react'
import { assets } from '@/assets/assets'
import { clearSiteSettingsCache } from '@/lib/siteSettings'
import { useSiteSettings } from '@/context/SiteSettingsContext'

export default function AdminHeroBannerPage() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  
  const [bannerData, setBannerData] = useState({
    mainBanner: {
      badgeText: '',
      badgeSideText: '',
      largeHeadline: '',
      smallHeadline: '',
      startsFromToggle: true,
      price: '',
      buttonText: '',
      buttonLink: '',
      image: '',
      bgColor: '',
    },
    topRightBanner: {
      title: '',
      link: '',
      image: '',
      bgColor: '',
    },
    bottomRightBanner: {
      title: '',
      link: '',
      image: '',
      bgColor: '',
    }
  })

  const { settings: ctxSettings, isLoading } = useSiteSettings()

  useEffect(() => {
    if (!isLoading && ctxSettings) {
      const fetchedHero = ctxSettings.heroBanner
      if (fetchedHero) {
        setBannerData({
          mainBanner: {
            badgeText: fetchedHero.mainBanner?.badgeText || '',
            badgeSideText: fetchedHero.mainBanner?.badgeSideText || '',
            largeHeadline: fetchedHero.mainBanner?.largeHeadline || '',
            smallHeadline: fetchedHero.mainBanner?.smallHeadline || '',
            startsFromToggle: fetchedHero.mainBanner?.startsFromToggle ?? true,
            price: fetchedHero.mainBanner?.price || '',
            buttonText: fetchedHero.mainBanner?.buttonText || '',
            buttonLink: fetchedHero.mainBanner?.buttonLink || '',
            image: fetchedHero.mainBanner?.image || '',
            bgColor: fetchedHero.mainBanner?.bgColor || '',
          },
          topRightBanner: {
            title: fetchedHero.topRightBanner?.title || '',
            link: fetchedHero.topRightBanner?.link || '',
            image: fetchedHero.topRightBanner?.image || '',
            bgColor: fetchedHero.topRightBanner?.bgColor || '',
          },
          bottomRightBanner: {
            title: fetchedHero.bottomRightBanner?.title || '',
            link: fetchedHero.bottomRightBanner?.link || '',
            image: fetchedHero.bottomRightBanner?.image || '',
            bgColor: fetchedHero.bottomRightBanner?.bgColor || '',
          }
        })
      }
      setLoading(false)
    }
  }, [isLoading, ctxSettings])

  const handleFieldChange = (bannerKey, fieldName, value) => {
    setBannerData(prev => ({
      ...prev,
      [bannerKey]: {
        ...prev[bannerKey],
        [fieldName]: value
      }
    }))
  }

  const handleImageUpload = async (e, bannerKey) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        setStatus('Uploading image...')
        const res = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ image: reader.result }),
        })
        const json = await res.json()
        if (res.ok && json.url) {
          handleFieldChange(bannerKey, 'image', json.url)
          setStatus('Image uploaded successfully.')
        } else {
          setStatus(json.error || 'Failed to upload image')
        }
      } catch (err) {
        console.error('Upload error', err)
        setStatus('Failed to upload image')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteImage = async (bannerKey) => {
    const prevData = bannerData
    const updated = {
      ...bannerData,
      [bannerKey]: { ...bannerData[bannerKey], image: '' }
    }
    // Immediately update local state so UI reflects deletion
    setBannerData(updated)
    setStatus('Deleting image...')
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ heroBanner: updated }),
      })
      const json = await res.json()
      if (res.ok) {
        clearSiteSettingsCache()
        setStatus('Image deleted successfully.')
      } else {
        // Rollback local state if API failed
        setBannerData(prevData)
        setStatus(json.error || 'Failed to delete image')
      }
    } catch (err) {
      console.error(err)
      // Rollback local state on error
      setBannerData(prevData)
      setStatus('Failed to delete image')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Saving changes...')
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ heroBanner: bannerData }),
      })
      const json = await res.json()
      if (res.ok) {
        clearSiteSettingsCache()
        setStatus('Hero Banner settings saved successfully.')
      } else {
        setStatus(json.error || 'Failed to update settings')
      }
    } catch (err) {
      console.error(err)
      setStatus('Failed to update settings')
    }
  }

  if (loading) {
    return <div className="p-6">Loading Hero Banner settings...</div>
  }

  return (
    <div className="text-slate-600 mb-28 p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Sliders className="text-emerald-500" size={24} />
        <div>
          <h1 className="text-3xl font-semibold">Hero Banner <span className="text-slate-800">Settings</span></h1>
          <p className="text-sm text-slate-500">Customize text, images, buttons, and colors for the homepage hero banners.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Main Banner (Left Large Banner) */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Left Side Banner</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Main Banner Settings</h2>
              <p className="mt-2 text-sm text-slate-500">Edit elements inside the primary left-hand side banner.</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Badge Text (যেমন: NEWS)
              <input
                type="text"
                value={bannerData.mainBanner.badgeText}
                onChange={(e) => handleFieldChange('mainBanner', 'badgeText', e.target.value)}
                placeholder="NEWS"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Badge Side Text
              <input
                type="text"
                value={bannerData.mainBanner.badgeSideText}
                onChange={(e) => handleFieldChange('mainBanner', 'badgeSideText', e.target.value)}
                placeholder="Free Shipping on Orders Above $50!"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Large Headline
              <input
                type="text"
                value={bannerData.mainBanner.largeHeadline}
                onChange={(e) => handleFieldChange('mainBanner', 'largeHeadline', e.target.value)}
                placeholder="Gadgets you'll love."
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Small Headline
              <input
                type="text"
                value={bannerData.mainBanner.smallHeadline}
                onChange={(e) => handleFieldChange('mainBanner', 'smallHeadline', e.target.value)}
                placeholder="Prices you'll trust."
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <div className="block text-sm font-medium text-slate-700">
              "Starts from" Text Toggle
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleFieldChange('mainBanner', 'startsFromToggle', !bannerData.mainBanner.startsFromToggle)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${bannerData.mainBanner.startsFromToggle ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${bannerData.mainBanner.startsFromToggle ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-slate-500">{bannerData.mainBanner.startsFromToggle ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Price (যেমন: ৳4.90)
              <input
                type="text"
                value={bannerData.mainBanner.price}
                onChange={(e) => handleFieldChange('mainBanner', 'price', e.target.value)}
                placeholder="৳4.90"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Button Text
              <input
                type="text"
                value={bannerData.mainBanner.buttonText}
                onChange={(e) => handleFieldChange('mainBanner', 'buttonText', e.target.value)}
                placeholder="LEARN MORE"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Button Link
              <input
                type="text"
                value={bannerData.mainBanner.buttonLink}
                onChange={(e) => handleFieldChange('mainBanner', 'buttonLink', e.target.value)}
                placeholder="/shop"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <div className="block text-sm font-medium text-slate-700">
              Background Color
              <div className="mt-2 flex gap-3 items-center">
                <input
                  type="color"
                  value={bannerData.mainBanner.bgColor || '#d1fae5'}
                  onChange={(e) => handleFieldChange('mainBanner', 'bgColor', e.target.value)}
                  className="w-12 h-12 rounded-full border border-slate-300 cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  value={bannerData.mainBanner.bgColor}
                  onChange={(e) => handleFieldChange('mainBanner', 'bgColor', e.target.value)}
                  placeholder="HEX Color (e.g. #d1fae5)"
                  className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                />
                {bannerData.mainBanner.bgColor && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('mainBanner', 'bgColor', '')}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-3xl hover:bg-red-100 text-xs"
                  >
                    Reset Default
                  </button>
                )}
              </div>
            </div>

            <div className="block text-sm font-medium text-slate-700">
              Banner Image
              <div className="mt-2 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer rounded-3xl bg-slate-100 hover:bg-slate-200 px-4 py-3 text-slate-700 transition">
                  <UploadCloud size={18} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'mainBanner')}
                    className="hidden"
                  />
                </label>
                {(() => {
                  const hasCustom = Boolean(bannerData.mainBanner.image);
                  const imgUrl = bannerData.mainBanner.image;
                  return (
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 h-20 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
                        {imgUrl ? (
                          <img src={imgUrl} className="w-full h-full object-contain" alt="Main Banner Preview" />
                        ) : (
                          <span className="text-[10px] text-slate-400">No Image</span>
                        )}
                        <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          hasCustom ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                        }`}>
                          {hasCustom ? 'Custom' : 'None'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {imgUrl && (
                          <a
                            href={imgUrl}
                            download="main_banner_image.png"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition"
                          >
                            <Download size={12} />
                            <span>Download</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage('mainBanner')}
                          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* Top Right Small Banner */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Right Side - Top Banner</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Best Products Banner Settings</h2>
              <p className="mt-2 text-sm text-slate-500">Edit the title, link, background, and image of the top right small banner.</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Title
              <input
                type="text"
                value={bannerData.topRightBanner.title}
                onChange={(e) => handleFieldChange('topRightBanner', 'title', e.target.value)}
                placeholder="Best products"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              "View more" Link
              <input
                type="text"
                value={bannerData.topRightBanner.link}
                onChange={(e) => handleFieldChange('topRightBanner', 'link', e.target.value)}
                placeholder="/shop"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <div className="block text-sm font-medium text-slate-700">
              Background Color
              <div className="mt-2 flex gap-3 items-center">
                <input
                  type="color"
                  value={bannerData.topRightBanner.bgColor || '#fed7aa'}
                  onChange={(e) => handleFieldChange('topRightBanner', 'bgColor', e.target.value)}
                  className="w-12 h-12 rounded-full border border-slate-300 cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  value={bannerData.topRightBanner.bgColor}
                  onChange={(e) => handleFieldChange('topRightBanner', 'bgColor', e.target.value)}
                  placeholder="HEX Color (e.g. #fed7aa)"
                  className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                />
                {bannerData.topRightBanner.bgColor && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('topRightBanner', 'bgColor', '')}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-3xl hover:bg-red-100 text-xs"
                  >
                    Reset Default
                  </button>
                )}
              </div>
            </div>

            <div className="block text-sm font-medium text-slate-700">
              Banner Image
              <div className="mt-2 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer rounded-3xl bg-slate-100 hover:bg-slate-200 px-4 py-3 text-slate-700 transition">
                  <UploadCloud size={18} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'topRightBanner')}
                    className="hidden"
                  />
                </label>
                {(() => {
                  const hasCustom = Boolean(bannerData.topRightBanner.image);
                  const imgUrl = bannerData.topRightBanner.image;
                  return (
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 h-20 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
                        {imgUrl ? (
                          <img src={imgUrl} className="w-full h-full object-contain" alt="Top Right Banner Preview" />
                        ) : (
                          <span className="text-[10px] text-slate-400">No Image</span>
                        )}
                        <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          hasCustom ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                        }`}>
                          {hasCustom ? 'Custom' : 'None'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {imgUrl && (
                          <a
                            href={imgUrl}
                            download="best_products_image.png"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition"
                          >
                            <Download size={12} />
                            <span>Download</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage('topRightBanner')}
                          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Right Small Banner */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Right Side - Bottom Banner</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Discount Banner Settings</h2>
              <p className="mt-2 text-sm text-slate-500">Edit the title, link, background, and image of the bottom right small banner.</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Title
              <input
                type="text"
                value={bannerData.bottomRightBanner.title}
                onChange={(e) => handleFieldChange('bottomRightBanner', 'title', e.target.value)}
                placeholder="20% discounts"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              "View more" Link
              <input
                type="text"
                value={bannerData.bottomRightBanner.link}
                onChange={(e) => handleFieldChange('bottomRightBanner', 'link', e.target.value)}
                placeholder="/shop"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <div className="block text-sm font-medium text-slate-700">
              Background Color
              <div className="mt-2 flex gap-3 items-center">
                <input
                  type="color"
                  value={bannerData.bottomRightBanner.bgColor || '#bfdbfe'}
                  onChange={(e) => handleFieldChange('bottomRightBanner', 'bgColor', e.target.value)}
                  className="w-12 h-12 rounded-full border border-slate-300 cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  value={bannerData.bottomRightBanner.bgColor}
                  onChange={(e) => handleFieldChange('bottomRightBanner', 'bgColor', e.target.value)}
                  placeholder="HEX Color (e.g. #bfdbfe)"
                  className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                />
                {bannerData.bottomRightBanner.bgColor && (
                  <button
                    type="button"
                    onClick={() => handleFieldChange('bottomRightBanner', 'bgColor', '')}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-3xl hover:bg-red-100 text-xs"
                  >
                    Reset Default
                  </button>
                )}
              </div>
            </div>

            <div className="block text-sm font-medium text-slate-700">
              Banner Image
              <div className="mt-2 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer rounded-3xl bg-slate-100 hover:bg-slate-200 px-4 py-3 text-slate-700 transition">
                  <UploadCloud size={18} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'bottomRightBanner')}
                    className="hidden"
                  />
                </label>
                {(() => {
                  const hasCustom = Boolean(bannerData.bottomRightBanner.image);
                  const imgUrl = bannerData.bottomRightBanner.image;
                  return (
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 h-20 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
                        {imgUrl ? (
                          <img src={imgUrl} className="w-full h-full object-contain" alt="Bottom Right Banner Preview" />
                        ) : (
                          <span className="text-[10px] text-slate-400">No Image</span>
                        )}
                        <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          hasCustom ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                        }`}>
                          {hasCustom ? 'Custom' : 'None'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {imgUrl && (
                          <a
                            href={imgUrl}
                            download="discount_banner_image.png"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition"
                          >
                            <Download size={12} />
                            <span>Download</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage('bottomRightBanner')}
                          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
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
