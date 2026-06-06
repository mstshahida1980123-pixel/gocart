import Link from 'next/link'

export default async function OrderSuccessPage({ params }) {
  const { orderId } = await params

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-3xl text-emerald-700">
            ✓
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-3">Order Successful!</h1>
          <p className="text-slate-500 mb-6">Your order has been placed successfully!</p>
          <div className="inline-flex rounded-2xl bg-slate-100 px-5 py-4 text-slate-700 mb-8">
            <span className="text-sm font-medium">Order ID:</span>
            <span className="ml-2 font-semibold">{orderId}</span>
          </div>
          <div className="flex justify-center gap-4">
            <Link href="/shop" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
