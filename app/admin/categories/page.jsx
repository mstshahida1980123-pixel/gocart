 'use client'

import { useEffect, useState } from 'react'

export default function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '' })
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const res = await fetch('/api/categories', { credentials: 'same-origin' })
    if (res.ok) {
      const data = await res.json()
      setCategories(data)
    }
    setLoading(false)
  }

  const resetForm = () => {
    setSelectedId('')
    setForm({ name: '', slug: '', description: '', image: '' })
    setSlugEdited(false)
  }

  const handleEdit = (category) => {
    setSelectedId(category.id)
    setForm({ name: category.name, slug: category.slug, description: category.description || '', image: category.image || '' })
    setShowModal(true)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image: reader.result }) })
      const json = await res.json()
      if (json.url) setForm(prev => ({ ...prev, image: json.url }))
    }
    reader.readAsDataURL(file)
  }

  const openNewCategory = () => {
    resetForm()
    setShowModal(true)
  }

  const handleNameChange = (e) => {
    const val = e.target.value
    setForm(prev => ({ ...prev, name: val, slug: (!slugEdited ? val.trim().toLowerCase().replace(/\s+/g, '-') : prev.slug) }))
  }

  const handleSlugChange = (e) => {
    setSlugEdited(true)
    setForm(prev => ({ ...prev, slug: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.slug) {
      alert('Name and slug are required')
      return
    }
    setSaving(true)
    const payload = { ...form }
    const method = selectedId ? 'PUT' : 'POST'
    const url = selectedId ? `/api/categories/${selectedId}` : '/api/categories'
    const res = await fetch(url, { method, credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert(body?.error || 'Failed to save category')
      setSaving(false)
      return
    }
    await loadCategories()
    resetForm()
    setShowModal(false)
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete category? This will remove the category from the admin list only.')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE', credentials: 'same-origin' })
    if (res.status === 204) {
      setCategories((prev) => prev.filter((category) => category.id !== id))
      if (selectedId === id) resetForm()
    } else {
      alert('Failed to delete category')
    }
  }

  if (loading) return <div>Loading categories...</div>

  return (
    <div className="text-slate-500 mb-28">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">Manage <span className="text-slate-800 font-medium">Categories</span></h1>
          <p className="max-w-2xl text-sm text-slate-500">Create, edit, and remove categories, and view how many products belong to each one.</p>
        </div>
        <div>
          <button onClick={openNewCategory} className="rounded-full bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Add New Category</button>
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        <div className="grid gap-4">
          {categories.map((category) => (
            <div key={category.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-20 w-20 overflow-hidden rounded-3xl bg-slate-100">
                  {category.image ? <img src={category.image} alt={category.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">No Image</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm uppercase tracking-[0.18em] text-emerald-600">{category.slug}</p>
                      <h2 className="truncate text-xl font-semibold text-slate-900">{category.name}</h2>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{category._count?.products || 0} products</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-2">{category.description || 'No description added yet.'}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <button onClick={() => handleEdit(category)} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 hover:bg-slate-100">Edit</button>
                <button onClick={() => handleDelete(category.id)} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-rose-700 hover:bg-rose-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative max-w-2xl w-full overflow-hidden rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">{selectedId ? 'Edit Category' : 'Create Category'}</h2>
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <input required placeholder="Name" value={form.name} onChange={handleNameChange} className="input" />
              <input required placeholder="Slug" value={form.slug} onChange={handleSlugChange} className="input" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" rows={4} />
              <div>
                <label className="text-sm font-medium text-slate-700">Category Image</label>
                <input type="file" accept="image/*" onChange={handleFile} className="mt-2" />
                {form.image && <img src={form.image} alt="Category" className="mt-3 h-24 w-full rounded-2xl object-cover" />}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="rounded-full bg-slate-800 px-5 py-2 text-white hover:bg-slate-900">{saving ? 'Saving...' : selectedId ? 'Update Category' : 'Create Category'}</button>
                <button type="button" onClick={() => { resetForm(); setShowModal(false) }} className="rounded-full border border-slate-200 bg-white px-5 py-2 text-slate-700">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
