'use client'
import { useEffect, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

export default function AdminOrders() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [showTrash, setShowTrash] = useState(false)

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/orders/all${showTrash ? '?deleted=true' : ''}`, { credentials: 'same-origin' })
      if (res.ok) {
        const json = await res.json()
        setOrders(json.orders)
      } else {
        setOrders([])
      }
      setLoading(false)
    }
    setLoading(true)
    load()
  }, [showTrash])

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/orders/${id}/status`, { method: 'PUT', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) {
      const updated = await res.json()
      setOrders(o => o.map(x => x.id === updated.id ? updated : x))
    }
  }

  const softDelete = async (id) => {
    const res = await fetch(`/api/orders/${id}/delete`, { method: 'PUT', credentials: 'same-origin' })
    if (res.ok) {
      setOrders(o => o.filter(x => x.id !== id))
    }
  }

  const restore = async (id) => {
    const res = await fetch(`/api/orders/${id}/restore`, { method: 'PUT', credentials: 'same-origin' })
    if (res.ok) {
      setOrders(o => o.filter(x => x.id !== id))
    }
  }

  const destroy = async (id) => {
    const ok = confirm('Permanently delete this order? This cannot be undone.')
    if (!ok) return
    const res = await fetch(`/api/orders/${id}/destroy`, { method: 'DELETE', credentials: 'same-origin' })
    if (res.ok) {
      setOrders(o => o.filter(x => x.id !== id))
    }
  }

  const getOrderThumbnail = (order) => {
    const firstItem = order.orderItems?.[0]
    const product = firstItem?.product
    if (!product) return ''

    const rawImages = product.images
    if (Array.isArray(rawImages) && rawImages.length > 0) {
      return rawImages[0] || ''
    }

    if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages || '[]')
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0] || ''
      } catch (err) {
        return rawImages || ''
      }
    }

    return ''
  }

  if (loading) return <div className="p-4">Loading...</div>

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  return (
    <div className="text-slate-600 mb-28 p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold mb-2">All <span className="text-slate-800 font-bold">Orders</span></h1>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{orders.length} total {showTrash ? 'trashed' : 'active'} orders</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTrash(s => !s)} className="px-3 py-1 text-sm border rounded">
            {showTrash ? 'View Active' : 'View Trash'}
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No orders found</div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(o => (
            <div key={o.id} className="border border-slate-300 rounded-lg bg-white">
              {/* Summary Row */}
              <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition"
                onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
              >
                <div className="relative flex-1 pr-24 min-w-0">
                  <div className="font-semibold text-slate-800">Order {o.id.substring(0, 8)}...</div>
                  <div className="text-sm text-slate-500 mt-1">
                    {o.address?.name}{o.address?.email && o.address.email !== 'N/A' ? ` • ${o.address.email}` : ''} • {o.address?.phone} • {new Date(o.createdAt).toLocaleDateString()}
                  </div>
                  {getOrderThumbnail(o) && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-16 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                      <img src={getOrderThumbnail(o)} alt="Product thumbnail" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="text-right flex gap-4 items-center">
                  <div className="font-semibold text-slate-800">{currency}{o.total}</div>
                  <select 
                    value={o.status} 
                    onChange={(e) => {
                      e.stopPropagation()
                      updateStatus(o.id, e.target.value)
                    }}
                    className="px-2 py-1 text-xs border border-slate-300 rounded bg-white hover:bg-slate-50"
                  >
                    <option value="ORDER_PLACED">ORDER_PLACED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                  <div className="flex items-center gap-3">
                    {!showTrash && (
                      <button onClick={(e) => { e.stopPropagation(); softDelete(o.id) }} className="text-sm text-red-600 border px-2 py-1 rounded">Delete</button>
                    )}
                    {showTrash && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); restore(o.id) }} className="text-sm text-green-600 border px-2 py-1 rounded">Restore</button>
                        <button onClick={(e) => { e.stopPropagation(); destroy(o.id) }} className="text-sm text-red-800 border px-2 py-1 rounded">Delete Permanently</button>
                      </>
                    )}
                    <ChevronDownIcon 
                      size={20} 
                      className={`text-slate-400 transition-transform ${expandedId === o.id ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === o.id && (
                <div className="p-4 border-t border-slate-300 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">Customer Details</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-500">Name:</span>
                          <p className="font-medium">{o.address?.name || 'N/A'}</p>
                        </div>
                        {o.address?.email && o.address.email !== 'N/A' && (
                        <div>
                          <span className="text-slate-500">Email:</span>
                          <p className="font-medium">{o.address.email}</p>
                        </div>
                        )}
                        <div>
                          <span className="text-slate-500">Phone:</span>
                          <p className="font-medium">{o.address?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address Info */}
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">Delivery Address</h3>
                      <div className="space-y-1 text-sm text-slate-700">
                        <p>{o.address?.street}</p>
                        <p>{o.address?.city}, {o.address?.state} {o.address?.zip}</p>
                        <p>{o.address?.country}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-slate-800 mb-3">Order Items</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-200">
                          <tr>
                            <th className="text-left p-2">Product</th>
                            <th className="text-center p-2">Qty</th>
                            <th className="text-right p-2">Price</th>
                            <th className="text-right p-2">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.orderItems?.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-300">
                              <td className="p-2">{item.product?.name || `Product ${item.productId}`}</td>
                              <td className="text-center p-2">{item.quantity}</td>
                              <td className="text-right p-2">{currency}{item.price}</td>
                              <td className="text-right p-2 font-semibold">{currency}{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Order Info</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Payment Method:</span>
                          <span className="font-medium">{o.paymentMethod}</span>
                        </div>
                        {(() => {
                          try {
                            const c = JSON.parse(o.coupon || '{}')
                            return c.transactionId ? (
                              <div className="flex justify-between">
                                <span className="text-slate-500">TXN নম্বর:</span>
                                <span className="font-medium">{c.transactionId}</span>
                              </div>
                            ) : null
                          } catch { return null }
                        })()}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status:</span>
                          <span className="font-medium">{o.status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Paid:</span>
                          <span className="font-medium">{o.isPaid ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Total</h3>
                      <div className="space-y-2 text-sm">
                        {(() => {
                          try {
                            const c = JSON.parse(o.coupon || '{}')
                            return c.deliveryCharge ? (
                              <div className="flex justify-between">
                                <span className="text-slate-500">ডেলিভারি চার্জ:</span>
                                <span className="font-medium">{currency}{c.deliveryCharge}</span>
                              </div>
                            ) : null
                          } catch { return null }
                        })()}
                        <div className="flex justify-between text-lg font-bold text-slate-800">
                          <span>Order Total:</span>
                          <span>{currency}{o.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
