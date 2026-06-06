'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { parseJsonArray } from '@/lib/utils'
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import toast from 'react-hot-toast';
import { getCombinedRatings } from '@/lib/demoReviews';

const ProductDetails = ({ product }) => {

    const productId = product?.id || '';
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const name = product?.name || 'Product'
    const price = product?.price ?? 0
    const mrp = product?.mrp ?? 0
    const inStock = product?.inStock ?? true
    const featured = product?.featured ?? false

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const router = useRouter()

    // normalize images field
    const images = parseJsonArray(product.images)

    const placeholderImage = '/uploads/placeholder.svg'
    const [mainImage, setMainImage] = useState(images[0] || placeholderImage);
    
    // Deterministic demo ratings initialization
    const initialDemo = getCombinedRatings(productId, name, [])
    const [ratingInfo, setRatingInfo] = useState({
        averageRating: initialDemo.averageRating,
        reviewCount: initialDemo.reviewCount,
        canRate: false,
        userRating: null,
        orderId: null,
    });
    const [selectedRating, setSelectedRating] = useState(0);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }))
        toast.success('Added to cart!')
    }

    const quickOrderHandler = () => {
        dispatch(addToCart({ productId }))
        toast.success('Added to cart!')
        router.push('/cart')
    }

    useEffect(() => {
        const fetchRatingInfo = async () => {
            try {
                const res = await fetch(`/api/ratings?productId=${productId}`, { credentials: 'include', cache: 'no-store' })
                if (!res.ok) {
                    console.error('Rating fetch failed', res.status)
                    return
                }
                const ratingEligibility = await res.json()
                setRatingInfo({
                    averageRating: ratingEligibility.averageRating ?? 0,
                    reviewCount: ratingEligibility.reviewCount ?? 0,
                    canRate: ratingEligibility.canRate ?? Boolean(ratingEligibility.orderId),
                    userRating: ratingEligibility.userRating ?? null,
                    orderId: ratingEligibility.orderId ?? null,
                })
            } catch (err) {
                console.error('Failed to load rating info', err)
            }
        }

        if (productId) {
            fetchRatingInfo()
        }
    }, [productId])

    const submitRating = async (value) => {
        if (!ratingInfo.canRate || !ratingInfo.orderId || isSubmittingRating) return
        setSelectedRating(value)
        setIsSubmittingRating(true)

        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                credentials: 'include',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ productId, orderId: ratingInfo.orderId, rating: value }),
            })

            if (!res.ok) {
                const json = await res.json().catch(() => ({}))
                throw new Error(json.error || 'Failed to submit rating')
            }

            const json = await res.json()
            setRatingInfo({
                averageRating: json.averageRating ?? ratingInfo.averageRating,
                reviewCount: json.reviewCount ?? ratingInfo.reviewCount,
                canRate: false,
                userRating: value,
                orderId: null,
            })
            toast.success('Rating submitted successfully')
        } catch (err) {
            toast.error(err.message || 'Unable to submit rating')
            console.error(err)
        } finally {
            setIsSubmittingRating(false)
        }
    }


    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {(images.length ? images : [placeholderImage]).map((image, index) => (
                        <div key={index} onClick={() => setMainImage(image || placeholderImage)} className="bg-slate-100 flex items-center justify-center rounded-lg group cursor-pointer" style={{width:56, height:56}}>
                            <div className="relative w-14 h-14">
                                <Image src={image || placeholderImage} alt={`thumb-${index}`} fill style={{objectFit:'cover'}} className="rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center rounded-lg overflow-hidden p-0 bg-white" style={{width:420, height:420}}>
                    <div className="relative w-full h-full">
                        <Image src={mainImage || placeholderImage} alt={name} fill style={{objectFit:'cover', objectPosition:'center'}} />
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 mb-1">
                    {inStock ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            In Stock
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 border border-red-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                            Out of Stock
                        </span>
                    )}
                    {featured && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                            ⭐ Featured
                        </span>
                    )}
                </div>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={ratingInfo.averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{ratingInfo.reviewCount} Reviews</p>
                </div>
                {ratingInfo.canRate && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700">Rate this product</p>
                        <p className="text-xs text-slate-500 mt-1">Only customers who ordered this item can submit a rating.</p>
                        <div className="flex items-center gap-2 mt-3">
                            {Array.from({ length: 5 }, (_, index) => (
                                <StarIcon
                                    key={index}
                                    size={20}
                                    className={`${selectedRating > index ? 'text-green-400' : 'text-slate-300'} cursor-pointer transition`}
                                    onClick={() => submitRating(index + 1)}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Tap a star to submit your rating.</p>
                    </div>
                )}
                {!ratingInfo.canRate && ratingInfo.userRating && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700">Your rating</p>
                        <div className="flex items-center gap-2 mt-2">
                            {Array.from({ length: 5 }, (_, index) => (
                                <StarIcon
                                    key={index}
                                    size={16}
                                    className={ratingInfo.userRating > index ? 'text-green-400' : 'text-slate-300'}
                                />
                            ))}
                            <span className="text-sm text-slate-500">{ratingInfo.userRating} Stars</span>
                        </div>
                    </div>
                )}
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{price} </p>
                    <p className="text-xl text-slate-500 line-through">{currency}{mrp}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>Save {mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0}% right now</p>
                </div>
                <div className="flex flex-wrap items-end gap-5 mt-10">
                    {
                        cart[productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                                <Counter productId={productId} />
                            </div>
                        )
                    }
                    <div className="flex flex-wrap gap-4">
                        {inStock ? (
                            <>
                                <button 
                                    onClick={addToCartHandler} 
                                    className="bg-slate-800 text-white px-6 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition flex items-center gap-2"
                                >
                                    <ShoppingCart size={18} />
                                    Add to Cart
                                </button>
                                <button 
                                    onClick={quickOrderHandler} 
                                    className="bg-green-600 text-white px-6 py-3 text-sm font-medium rounded hover:bg-green-700 active:scale-95 transition flex items-center gap-2"
                                >
                                    <Zap size={18} />
                                    Order now
                                </button>
                            </>
                        ) : (
                            <button
                                disabled
                                className="bg-slate-200 text-slate-400 px-6 py-3 text-sm font-medium rounded cursor-not-allowed flex items-center gap-2"
                            >
                                <ShoppingCart size={18} />
                                Out of Stock
                            </button>
                        )}
                    </div>
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Free shipping worldwide </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> 100% Secured Payment </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Trusted by top brands </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails