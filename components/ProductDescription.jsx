'use client'
import { StarIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { getDemoReviews } from "@/lib/demoReviews"
import toast from "react-hot-toast"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description')
    const [reviews, setReviews] = useState(() => getDemoReviews(product?.id, product?.name))
    const [avgRating, setAvgRating] = useState(() => {
        if (!reviews || !reviews.length) return 0
        return +(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    })
    const [reviewCount, setReviewCount] = useState(() => reviews ? reviews.length : 0)

    // Form states
    const [formDataName, setFormDataName] = useState('')
    const [formDataRating, setFormDataRating] = useState(0)
    const [formDataReview, setFormDataReview] = useState('')
    const [isSubmitSuccess, setIsSubmitSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!product?.id) return
        fetch(`/api/ratings?productId=${product.id}`, { credentials: 'include', cache: 'no-store' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                // Only override demo reviews if API returns actual reviews
                if (data?.reviews && data.reviews.length > 0) setReviews(data.reviews)
                if (data?.averageRating != null) setAvgRating(+Number(data.averageRating).toFixed(1))
                if (data?.reviewCount != null) setReviewCount(data.reviewCount)
            })
            .catch(() => {})
    }, [product?.id])

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        if (formDataRating < 1 || formDataRating > 5) {
            toast.error('অনুগ্রহ করে একটি স্টার রেটিং নির্বাচন করুন।')
            return
        }
        setIsSubmitting(true)
        setIsSubmitSuccess(false)
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    name: formDataName,
                    rating: formDataRating,
                    review: formDataReview
                })
            })
            if (res.ok) {
                const data = await res.json()
                if (data.reviews) setReviews(data.reviews)
                if (data.averageRating != null) setAvgRating(+Number(data.averageRating).toFixed(1))
                if (data.reviewCount != null) setReviewCount(data.reviewCount)
                
                // Clear form
                setFormDataName('')
                setFormDataRating(0)
                setFormDataReview('')
                setIsSubmitSuccess(true)
                toast.success('Review submitted successfully!')
                
                // Automatically hide success message after 5 seconds
                setTimeout(() => {
                    setIsSubmitSuccess(false)
                }, 5000)
            } else {
                const errData = await res.json().catch(() => ({}))
                toast.error(errData.error || 'Failed to submit review')
                console.error('Failed to submit review')
            }
        } catch (err) {
            toast.error('Failed to submit review')
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-4 mt-6">
                    {/* Average Rating Summary */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                                <StarIcon key={i} size={18} className="text-transparent" fill={avgRating >= i + 1 ? "#00C950" : "#D1D5DB"} />
                            ))}
                        </div>
                        <span className="font-semibold text-slate-800">{avgRating}</span>
                        <span className="text-slate-400">({reviewCount}টি রিভিউ)</span>
                    </div>

                    {reviews.map((review, index) => (
                        <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-semibold text-slate-900">{review.user?.name || 'Customer'}</p>
                                    <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString('bn-BD', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }, (_, starIndex) => (
                                        <StarIcon key={starIndex} size={16} className='text-transparent mt-0.5' fill={review.rating > starIndex ? "#00C950" : "#D1D5DB"} />
                                    ))}
                                </div>
                            </div>
                            {review.review && <p className="mt-4 text-slate-600">{review.review}</p>}
                        </div>
                    ))}

                    {/* Add Review Form */}
                    <div className="mt-8 border-t border-slate-200 pt-8 max-w-xl">
                        <h3 className="text-base font-semibold text-slate-800 mb-4">রিভিউ যোগ করুন</h3>
                        
                        {isSubmitSuccess && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
                                ধন্যবাদ! আপনার রিভিউ সফলভাবে যোগ হয়েছে।
                            </div>
                        )}

                        <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">নাম *</label>
                                <input
                                    type="text"
                                    required
                                    value={formDataName}
                                    onChange={(e) => setFormDataName(e.target.value)}
                                    placeholder="আপনার নাম লিখুন"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">স্টার রেটিং *</label>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <button
                                            type="button"
                                            key={i}
                                            onClick={() => setFormDataRating(i + 1)}
                                            className="focus:outline-none cursor-pointer"
                                        >
                                            <StarIcon
                                                size={22}
                                                className="text-transparent"
                                                fill={formDataRating >= i + 1 ? "#00C950" : "#D1D5DB"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">রিভিউ টেক্সট *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formDataReview}
                                    onChange={(e) => setFormDataReview(e.target.value)}
                                    placeholder="আপনার মন্তব্য লিখুন..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-900 transition disabled:opacity-50 cursor-pointer self-start"
                            >
                                {isSubmitting ? "লোডিং..." : "রিভিউ দিন"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDescription