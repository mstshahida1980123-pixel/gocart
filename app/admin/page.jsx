"use client"
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSignIcon, ShoppingBasketIcon, TagsIcon, StarIcon } from "lucide-react"

export default function AdminDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ products: 0, revenue: 0, orders: 0, allOrders: [], avgRating: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/dashboard', { credentials: 'same-origin' })
        if (res.ok) {
          const json = await res.json()
          setData(json)
        } else {
          console.error('Failed to load admin dashboard', res.status)
        }
      } catch (err) {
        console.error('Error loading admin dashboard', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loading />

  const cards = [
    { title: 'Total Products', value: data.products, icon: ShoppingBasketIcon },
    { title: 'Total Revenue', value: currency + data.revenue, icon: CircleDollarSignIcon },
    { title: 'Total Orders', value: data.orders, icon: TagsIcon },
    { title: 'Average Rating', value: data.avgRating.toFixed(2), icon: StarIcon },
  ]

  return (
    <div className="text-slate-500 mb-28">
      <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

      <div className="flex flex-wrap gap-5 my-10 mt-4">
        {cards.map((card, i) => (
          <div key={i} className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg">
            <div className="flex flex-col gap-3 text-xs">
              <p>{card.title}</p>
              <b className="text-2xl font-medium text-slate-700">{card.value}</b>
            </div>
            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>

      <OrdersAreaChart allOrders={data.allOrders || []} />
    </div>
  )
}