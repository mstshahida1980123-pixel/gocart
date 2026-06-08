"use client"
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSession, signOut } from 'next-auth/react'
import { useSiteSettings } from '@/context/SiteSettingsContext'

const Navbar = () => {

    const router = useRouter();
    const pathname = usePathname();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)
    const { data: session } = useSession()
    const [navLinks, setNavLinks] = useState(null)
    const [logoImage, setLogoImage] = useState('')
    const [siteName, setSiteName] = useState('gocart')
    const { settings, isLoading } = useSiteSettings()

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    useEffect(() => {
        if (!isLoading && settings) {
            if (Array.isArray(settings.headerNav)) setNavLinks(settings.headerNav)
            setLogoImage(settings.logoImage || '')
            setSiteName(settings.siteName || 'gocart')
        }
    }, [isLoading, settings])

    if (isLoading) return null

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative flex items-center gap-3 text-slate-700">
                        {logoImage ? (
                            <img src={logoImage} alt="GoCart logo" className="h-10 w-auto rounded-2xl object-contain" />
                        ) : (
                            <span className="text-4xl font-semibold">
                                <span className="text-green-600">{siteName.charAt(0)}</span>{siteName.slice(1)}<span className="text-green-600 text-5xl leading-0">.</span>
                            </span>
                        )}
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-2 lg:gap-4 text-slate-600">
                        {(navLinks || [
                            { name: 'Home', url: '/' },
                            { name: 'Shop', url: '/shop' },
                            { name: 'Categories', url: '/categories' },
                            { name: 'About', url: '/about' },
                            { name: 'Contact', url: '/contact' },
                        ]).map((l, i) => {
                            const isLinkActive = l.url === '/' ? pathname === '/' : pathname?.startsWith(l.url)
                            return (
                                <Link 
                                    key={i} 
                                    href={l.url || '/'}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                        isLinkActive 
                                            ? 'bg-slate-200/50 border border-slate-300/30 text-slate-900 shadow-sm backdrop-blur-md' 
                                            : 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                                    }`}
                                >
                                    {l.name || l.text}
                                </Link>
                            )
                        })}

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {session?.user ? (
                            <div className="flex items-center gap-3">
                                {session.user.image
                                    ? <img src={session.user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    : <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">{(session.user.name || session.user.email || '?')[0].toUpperCase()}</div>
                                }
                                <span className="text-sm">{session.user.name || session.user.email}</span>
                                <button onClick={() => signOut()} className="px-3 py-1 bg-slate-200 rounded">Logout</button>
                            </div>
                        ) : (
                            <div />
                        )}

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden flex items-center gap-4">
                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>
                        {session?.user ? (
                            <div className="flex items-center gap-3">
                                {session.user.image
                                    ? <img src={session.user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    : <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">{(session.user.name || session.user.email || '?')[0].toUpperCase()}</div>
                                }
                            </div>
                        ) : (
                            <div />
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar