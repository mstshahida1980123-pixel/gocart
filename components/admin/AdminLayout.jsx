'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"

const AdminLayout = ({ children }) => {

    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchIsAdmin = async () => {
        try {
            const res = await fetch('/api/admin/dashboard')
            if (res.ok) {
                setIsAdmin(true)
            } else {
                setIsAdmin(false)
            }
        } catch {
            setIsAdmin(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIsAdmin()
    }, [])

    const [mobileOpen, setMobileOpen] = useState(false)

    return loading ? (
        <Loading />
    ) : isAdmin ? (
        <div className="flex flex-col h-screen">
            <AdminNavbar onToggleMobile={() => setMobileOpen(v => !v)} />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                    <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
                    <div className="flex-1 h-full p-6 lg:pl-12 lg:pt-12 overflow-y-auto bg-slate-50">
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">You are not authorized to access this page</h1>
            <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
                Go to home <ArrowRightIcon size={18} />
            </Link>
        </div>
    )
}

export default AdminLayout