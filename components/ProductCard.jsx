'use client'
import { StarIcon, ShoppingCart, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { parseJsonArray } from '@/lib/utils'
import { getCombinedRatings } from '@/lib/demoReviews'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const dispatch = useDispatch()
    const router = useRouter()

    const { averageRating } = getCombinedRatings(product.id, product.name, product.ratings || [])
    const rating = Math.round(averageRating)
    const inStock = product?.inStock ?? true

    // normalize images: support JSON string or array
    const images = parseJsonArray(product.images)
    const placeholderImage = '/uploads/placeholder.svg'
    const coverImage = images[0] || placeholderImage

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!inStock) return
        dispatch(addToCart({ productId: product.id }))
        toast.success('Added to cart!')
    }

    const handleQuickOrder = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!inStock) return
        dispatch(addToCart({ productId: product.id }))
        router.push('/cart')
    }

    return (
        <Link href={`/product/${product.id}`} className='group mx-auto'>
                <div className='bg-[#F5F5F5] w-full sm:w-60 rounded-lg overflow-hidden relative h-56 sm:h-60'>
                    <div className='relative w-full h-full'>
                        <Image src={coverImage} alt={product.name || 'product image'} fill style={{objectFit: 'cover', objectPosition: 'center'}} className={`transition-transform duration-300 ${inStock ? 'group-hover:scale-105' : 'opacity-60'}`} />
                    </div>
                    {/* Out of Stock Overlay */}
                    {!inStock && (
                        <div className='absolute inset-0 flex items-center justify-center bg-black/30 z-10'>
                            <span className='bg-white/90 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow'>
                                Out of Stock
                            </span>
                        </div>
                    )}
                    {/* Buttons Overlay — only shown when in stock */}
                    {inStock && (
                        <div className='absolute bottom-3 right-3 flex gap-2 z-10'>
                            <button 
                                onClick={handleAddToCart} 
                                className='bg-white/90 hover:bg-slate-800 text-slate-800 hover:text-white p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 active:scale-90 flex items-center justify-center touch-target' 
                                title="Add to Cart"
                            >
                                <ShoppingCart size={16} />
                            </button>
                            <button 
                                onClick={handleQuickOrder} 
                                className='bg-[#00C950]/90 hover:bg-[#00B040] text-white p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 active:scale-90 flex items-center justify-center touch-target' 
                                title="Order now"
                            >
                                <Zap size={16} />
                            </button>
                        </div>
                    )}
                </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 w-full sm:max-w-60'>
                <div>
                    <p>{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p>{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard