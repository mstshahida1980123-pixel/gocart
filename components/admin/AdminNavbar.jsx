 'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSiteSettings } from '@/context/SiteSettingsContext'

const AdminNavbar = ({ onToggleMobile }) => {
    const [siteName, setSiteName] = useState('gocart')
    const { settings, isLoading } = useSiteSettings()

    useEffect(() => {
        if (!isLoading && settings) setSiteName(settings.siteName || 'gocart')
    }, [isLoading, settings])

    return (
        <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm transition-all">
            <div className="md:hidden">
                <button onClick={onToggleMobile} className="p-2 rounded-md touch-target">☰</button>
            </div>
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">{siteName.charAt(0)}</span>{siteName.slice(1)}<span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Admin
                </p>
            </Link>
            <div className="flex items-center gap-3">
                <p>Hi, Admin</p>
            </div>
        </div>
    )
}

export default AdminNavbar