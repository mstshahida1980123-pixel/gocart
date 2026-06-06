'use client'
import { useEffect, useState } from 'react'
import { Star, StarIcon } from 'lucide-react'

export default function AdminReviewsPage() {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews', { credentials: 'same-origin' })
      const data = await res.json()
      if (res.ok) {
        setReviews(data.reviews)
      }
    } catch (err) {
      console.error('Failed to load reviews', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleDelete = async (id) => {
    const confirmed = confirm('Permanently delete this review? This will update the product ratings instantly.')
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      if (res.ok) {
        setReviews(reviews.filter((review) => review.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete review')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete review')
    }
  }

  if (loading) {
    return <div className="p-6">Loading reviews...</div>
  }

  return (
    <div className="text-slate-600 mb-28 p-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Star className="text-emerald-500 fill-emerald-500" size={24} />
        <div>
          <h1 className="text-3xl font-semibold">Product <span className="text-slate-800">Reviews</span></h1>
          <p className="text-sm text-slate-500">Manage all product ratings and customer feedback from this section.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 font-medium">All Reviews ({reviews.length})</h2>
        </div>

        {reviews.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No product reviews in database yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Reviewer</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Review</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/55 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-[200px] truncate">
                      {review.product?.name || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4">
                      {review.name || review.user?.name || 'গ্রাহক'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, starIndex) => (
                          <StarIcon
                            key={starIndex}
                            size={14}
                            className="text-transparent"
                            fill={review.rating > starIndex ? "#00C950" : "#D1D5DB"}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm whitespace-pre-wrap text-slate-600">
                      {review.review}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
