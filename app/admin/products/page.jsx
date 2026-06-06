'use client'
import { useEffect, useState } from 'react'

export default function ManageProducts() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/products', { credentials: 'same-origin' })
      if (res.ok) {
        const json = await res.json()
        setProducts(json.products)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete product?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'same-origin' })
    if (res.status === 204 || res.status === 200) setProducts(p => p.filter(x => x.id !== id))
  }

  if (loading) return <div>Loading...</div>

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  return (
    <div className="text-slate-500 mb-28">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-slate-900">Manage <span className="text-slate-800 font-medium">Products</span></h1>
        <p className="max-w-2xl text-sm text-slate-500">Review and manage inventory with premium product cards showing image, category, and pricing.</p>
      </div>
      <div className="mt-6 grid gap-4">
        {products.map((p) => {
          let imageUrl = '/uploads/placeholder.svg'
          const extractImages = () => {
            if (Array.isArray(p.images) && p.images.length) return p.images
            if (typeof p.images === 'string') {
              try {
                const parsed = JSON.parse(p.images || '[]')
                if (Array.isArray(parsed)) return parsed
              } catch (err) {
                return []
              }
            }
            return []
          }
          const images = extractImages()
          if (images[0]) imageUrl = images[0]

          return (
            <div key={p.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 overflow-hidden rounded-3xl bg-slate-100 w-24 h-24">
                  <img src={imageUrl} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">{p.category}</p>
                      <h2 className="truncate text-lg font-semibold text-slate-900">{p.name}</h2>
                    </div>
                    <div className="mt-3 sm:mt-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{currency}{p.price}</div>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-500 line-clamp-2">{p.description || 'No description available.'}</p>
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <a href={`/product/${p.id}`} className="text-sm text-slate-600 hover:text-slate-900">View</a>
                  <a href={`/admin/products/${p.id}/edit`} className="text-sm text-slate-600 hover:text-slate-900">Edit</a>
                  <button onClick={() => handleDelete(p.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
