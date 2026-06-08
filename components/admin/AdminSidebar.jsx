 'use client'

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useSiteSettings } from '@/context/SiteSettingsContext'
import { HomeIcon, ShieldCheckIcon, StoreIcon, TicketPercentIcon, MessageCircle, Settings, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const AdminSidebar = () => {

    const pathname = usePathname()
    const [siteName, setSiteName] = useState('gocart')
    const [logoImage, setLogoImage] = useState('')
    const { settings, isLoading } = useSiteSettings()

    useEffect(() => {
        if (!isLoading && settings) {
            setSiteName(settings.siteName || 'gocart')
            setLogoImage(settings.logoImage || '')
        }
    }, [isLoading, settings])

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Add Product', href: '/admin/add-product', icon: StoreIcon },
        { name: 'Manage Product', href: '/admin/products', icon: ShieldCheckIcon },
        { name: 'Categories', href: '/admin/categories', icon: StoreIcon },
        { name: 'Orders', href: '/admin/orders', icon: TicketPercentIcon  },
        { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
        { name: 'Messages', href: '/admin/messages', icon: MessageCircle },
        { name: 'Site Settings', href: '/admin/site-settings', icon: Settings },
        { name: 'Hero Banner Settings', href: '/admin/hero-banner', icon: Settings },
        { name: 'Order Settings', href: '/admin/order-settings', icon: Settings },
        { name: 'Marketing', href: '/admin/marketing', icon: Settings },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-6 border-r border-slate-200 sm:w-64 p-4 bg-white">
            <div className="flex flex-col gap-3 justify-center items-center pt-2 pb-4">
                {logoImage && <Image className="w-14 h-14 rounded-full" src={logoImage} alt="logo" width={80} height={80} unoptimized />}
                <p className="text-slate-700 font-medium">Hi, Admin</p>
                <p className="text-sm text-slate-500">{siteName}</p>
            </div>

            <nav className="mt-4 flex-1">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`group flex items-center gap-3 text-slate-600 hover:bg-slate-50 p-3 rounded-md transition ${pathname === link.href ? 'bg-green-50 text-green-700 font-semibold' : ''}`}>
                            <link.icon size={18} className="text-slate-400 group-hover:text-green-600" />
                            <span className="ml-2">{link.name}</span>
                        </Link>
                    ))
                }
            </nav>
        </div>
    )
}

export default AdminSidebar