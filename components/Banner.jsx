'use client'
import React from 'react'
import toast from 'react-hot-toast';
import { useSiteSettings } from '@/context/SiteSettingsContext'

export default function Banner() {

    const [isOpen, setIsOpen] = React.useState(true);
    const { settings, isLoading } = useSiteSettings()
    const announcement = settings?.announcement || ''

    React.useEffect(() => {
        // no-op: provider handles fetching
    }, [])

    const handleClaim = () => {
        setIsOpen(false);
        toast.success('Coupon copied to clipboard!');
        navigator.clipboard.writeText('NEW20');
    };

    if (isLoading) return null
    if (!announcement) return null

    return isOpen && (
        <div className="w-full px-4 py-2 font-medium text-sm text-white text-center bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A]">
            <div className='flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-3'>
                <p className="flex-1 text-sm">{announcement}</p>
                <div className="flex items-center space-x-3">
                    <button onClick={handleClaim} type="button" className="font-normal text-gray-800 bg-white px-4 py-2 rounded-full touch-target">Claim Offer</button>
                    <button onClick={() => setIsOpen(false)} type="button" className="font-normal text-gray-800 py-2 rounded-full touch-target">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="#fff" />
                            <rect x="12.533" y="13.915" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.533 13.915)" fill="#fff" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};