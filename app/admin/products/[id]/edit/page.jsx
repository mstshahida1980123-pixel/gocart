'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { X } from 'lucide-react'

const inputCls = 'w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500'

export default function EditProduct() {
  const { id } = useParams()
  const [form, setForm] = useState({
    name: '', description: '', mrp: '', price: '',
    category: '', categoryId: '', images: [],
    inStock: true, featured: false, latest: false, bestSelling: false,
  })
  const [categories, setCategories] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const imagesRef = useRef([])
  const router = useRouter()

  // Keep ref in sync so async image handlers see latest images
  useEffect(() => { imagesRef.current = form.images }, [form.images])

  useEffect(() => {
    const load = async () => {
      const [categoriesRes, productRes] = await Promise.all([
        fetch('/api/categories', { credentials: 'include' }),
        fetch(`/api/products/${id}`, { credentials: 'include' }),
      ])
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data)
      }
      if (!productRes.ok) {
        alert('Failed to load product')
        router.push('/admin/products')
        return
      }
      const p = await productRes.json()
      const imgs = Array.isArray(p.images) ? p.images : []
      imagesRef.current = imgs
      setForm({
        name: p.name || '',
        description: p.description || '',
        mrp: p.mrp != null ? String(p.mrp) : '',
        price: p.price != null ? String(p.price) : '',
        category: p.category || '',
        categoryId: p.categoryId || '',
        images: imgs,
        inStock: p.inStock ?? true,
        featured: p.featured ?? false,
        latest: p.latest ?? false,
        bestSelling: p.bestSelling ?? false,
      })
      setPageLoading(false)
    }
    load()
  }, [id])

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value
    const selected = categories.find(c => c.id === selectedId)
    setForm(prev => ({
      ...prev,
      categoryId: selectedId,
      category: selected ? selected.name : '',
    }))
  }

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const currentCount = imagesRef.current.length
    const toUpload = files.slice(0, 4 - currentCount)
    if (!toUpload.length) {
      alert('Maximum 4 images allowed.')
      return
    }
    setUploading(true)
    for (const file of toUpload) {
      const reader = new FileReader()
      await new Promise((resolve) => {
        reader.onload = async () => {
          const dataUrl = reader.result
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              credentials: 'include',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ image: dataUrl }),
            })
            const json = await res.json()
            if (json.url) {
              setForm(prev => {
                const updated = [...prev.images, json.url]
                imagesRef.current = updated
                return { ...prev, images: updated }
              })
            } else {
              alert('Image upload failed: ' + (json.error || 'Unknown error'))
            }
          } catch (err) {
            alert('Image upload error: ' + err.message)
          }
          resolve(null)
        }
        reader.readAsDataURL(file)
      })
    }
    setUploading(false)
    e.target.value = ''
  }

  const removeImage = (index) => {
    setForm(prev => {
      const updated = prev.images.filter((_, i) => i !== index)
      imagesRef.current = updated
      return { ...prev, images: updated }
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.categoryId) {
      alert('Please select a category.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert('Failed to update product: ' + (err.error || res.statusText))
        return
      }
      router.push('/admin/products')
    } catch (err) {
      alert('Error updating product: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (pageLoading) return (
    <div className="flex items-center justify-center h-40 text-slate-500">Loading product...</div>
  )

  return (
    <div className="text-slate-600 mb-20 p-4 max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Edit <span className="text-slate-800">Product</span></h1>
        <p className="mt-1 text-sm text-slate-500">Update product details, images, category, and inventory status.</p>
      </div>

      <form onSubmit={onSubmit} className="mt-2">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm divide-y divide-slate-200">

          {/* Basic Info */}
          <div className="px-4 py-3">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-600">Basic Info</p>
              <h2 className="mt-1 text-[15px] font-semibold text-slate-900">Product details</h2>
            </div>
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Name
                <input
                  required
                  placeholder="Product name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={'mt-2 ' + inputCls}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  required
                  placeholder="Product description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={'mt-2 h-20 ' + inputCls}
                />
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="px-4 py-3">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-600">Pricing</p>
              <h2 className="mt-1 text-[15px] font-semibold text-slate-900">Price details</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                MRP
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  placeholder="MRP"
                  value={form.mrp}
                  onChange={e => setForm({ ...form, mrp: e.target.value })}
                  className={'mt-2 ' + inputCls}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Price
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Sale price"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className={'mt-2 ' + inputCls}
                />
              </label>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="px-4 py-3">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-600">Category &amp; Tags</p>
              <h2 className="mt-1 text-[15px] font-semibold text-slate-900">Organize your product</h2>
            </div>
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Category <span className="text-red-500">*</span>
                <select
                  required
                  value={form.categoryId}
                  onChange={handleCategoryChange}
                  className={'mt-2 ' + inputCls}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-300" style={{ color: form.latest ? '#059669' : undefined }}>
                  <input type="checkbox" checked={form.latest} onChange={e => setForm({ ...form, latest: e.target.checked })} />
                  Latest Products
                </label>
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-300" style={{ color: form.bestSelling ? '#059669' : undefined }}>
                  <input type="checkbox" checked={form.bestSelling} onChange={e => setForm({ ...form, bestSelling: e.target.checked })} />
                  Best Selling
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="px-4 py-3">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-600">Images</p>
              <h2 className="mt-1 text-[15px] font-semibold text-slate-900">Upload photos</h2>
            </div>
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Images (up to 4) {uploading && <span className="text-emerald-600 text-xs ml-2">Uploading...</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                multiple
                disabled={uploading || form.images.length >= 4}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none disabled:opacity-50"
              />
              <div className="flex flex-wrap gap-2">
                {form.images.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt={`Product ${i + 1}`} className="h-20 w-20 rounded-2xl object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {form.images.length < 4 && (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs">
                    {uploading ? '...' : 'Add'}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400">{form.images.length}/4 images. Hover over an image to remove it.</p>
            </div>
          </div>

          {/* Stock Options */}
          <div className="px-4 py-3">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-600">Stock options</p>
              <h2 className="mt-1 text-[15px] font-semibold text-slate-900">Inventory status</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} />
                In stock
              </label>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="px-4 py-3">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
