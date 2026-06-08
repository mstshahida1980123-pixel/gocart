'use client'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import { useSiteSettings } from '@/context/SiteSettingsContext'

const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const { settings, isLoading } = useSiteSettings()
    const heroBanner = settings?.heroBanner ?? null

    if (isLoading) return null
    if (!heroBanner) return null

    const mainImg = heroBanner?.mainBanner?.image || null
    const mainImgProps = mainImg ? { width: 400, height: 400, unoptimized: true } : {}

    const topProductImg = heroBanner?.topRightBanner?.image || null
    const topProductImgProps = topProductImg ? { width: 140, height: 140, unoptimized: true } : {}

    const bottomProductImg = heroBanner?.bottomRightBanner?.image || null
    const bottomProductImgProps = bottomProductImg ? { width: 140, height: 140, unoptimized: true } : {}

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div 
                    style={heroBanner?.mainBanner?.bgColor ? { backgroundColor: heroBanner.mainBanner.bgColor } : {}}
                    className={`relative flex-1 flex flex-col rounded-3xl xl:min-h-100 group ${!heroBanner?.mainBanner?.bgColor ? 'bg-green-200' : ''}`}
                >
                    <div className='p-5 sm:p-16'>
                        <div className='inline-flex items-center gap-3 bg-green-300 text-green-600 pr-4 p-1 rounded-full text-xs sm:text-sm'>
                            <span className='bg-green-600 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>
                                {heroBanner?.mainBanner?.badgeText || 'NEWS'}
                            </span> 
                            {heroBanner?.mainBanner?.badgeSideText || 'Free Shipping on Orders Above $50!'} 
                            <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
                        </div>
                        <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium bg-gradient-to-r from-slate-600 to-[#A0FF74] bg-clip-text text-transparent max-w-xs  sm:max-w-md'>
                            {(heroBanner?.mainBanner?.largeHeadline || "Gadgets you'll love.") + " " + (heroBanner?.mainBanner?.smallHeadline || "Prices you'll trust.")}
                        </h2>
                        <div className='text-slate-800 text-sm font-medium mt-4 sm:mt-8'>
                            {heroBanner?.mainBanner?.startsFromToggle && <p>Starts from</p>}
                            <p className='text-3xl'>
                                {(() => {
                                    const p = heroBanner?.mainBanner?.price || '4.90';
                                    return p.startsWith('$') || p.startsWith('৳') ? p : `${currency}${p}`;
                                })()}
                            </p>
                        </div>
                        <Link href={heroBanner?.mainBanner?.buttonLink || '/'}>
                            <button className='bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-103 active:scale-95 transition'>
                                {heroBanner?.mainBanner?.buttonText || 'LEARN MORE'}
                            </button>
                        </Link>
                    </div>
                    {mainImg && <Image className='sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm' src={mainImg} alt="" {...mainImgProps} />}
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <Link
                        href={heroBanner?.topRightBanner?.link || '/'}
                        style={heroBanner?.topRightBanner?.bgColor ? { backgroundColor: heroBanner.topRightBanner.bgColor } : {}}
                        className={`flex-1 flex items-center justify-between w-full rounded-3xl p-6 px-8 group ${!heroBanner?.topRightBanner?.bgColor ? 'bg-orange-200' : ''}`}
                    >
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40'>
                                {heroBanner?.topRightBanner?.title || 'Best products'}
                            </p>
                            <p className='flex items-center gap-1 mt-4'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        {topProductImg && <Image className='w-35' src={topProductImg} alt="" {...topProductImgProps} />}
                    </Link>
                    <Link
                        href={heroBanner?.bottomRightBanner?.link || '/'}
                        style={heroBanner?.bottomRightBanner?.bgColor ? { backgroundColor: heroBanner.bottomRightBanner.bgColor } : {}}
                        className={`flex-1 flex items-center justify-between w-full rounded-3xl p-6 px-8 group ${!heroBanner?.bottomRightBanner?.bgColor ? 'bg-blue-200' : ''}`}
                    >
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#78B2FF] bg-clip-text text-transparent max-w-40'>
                                {heroBanner?.bottomRightBanner?.title || '20% discounts'}
                            </p>
                            <p className='flex items-center gap-1 mt-4'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        {bottomProductImg && <Image className='w-35' src={bottomProductImg} alt="" {...bottomProductImgProps} />}
                    </Link>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero