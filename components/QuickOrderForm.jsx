'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Banknote, Smartphone, Wallet } from 'lucide-react'

const QuickOrderForm = ({ product, totalPrice, items }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'

    // Cart mode: totalPrice + items passed directly
    // Product mode: single product passed
    const isCartMode = totalPrice !== undefined && items !== undefined
    const subtotal = isCartMode ? totalPrice : (product?.price ?? 0)
    const totalQuantity = isCartMode
        ? items.reduce((acc, it) => acc + it.quantity, 0)
        : 1

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [delivery, setDelivery] = useState('dhaka_inside')
    const [payment, setPayment] = useState('COD')
    const [transactionId, setTransactionId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [settings, setSettings] = useState(null)

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch('/api/order-settings')
                const json = await res.json()
                if (res.ok && json.settings) {
                    setSettings(json.settings)
                    
                    const enabled = []
                    if (json.settings.codActive) enabled.push('COD')
                    if (json.settings.bkashActive) enabled.push('BKASH')
                    if (json.settings.nagadActive) enabled.push('NAGAD')
                    
                    if (enabled.length > 0) {
                        setPayment(enabled[0])
                    }
                }
            } catch (err) {
                console.error('Failed to load order settings', err)
            }
        }
        loadSettings()
    }, [])

    const dynamicDeliveryOptions = [
        { value: 'dhaka_inside', label: 'ঢাকার ভিতরে', charge: settings?.dhakaInsideCharge ?? 70, desc: 'দ্রুত ডেলিভারি' },
        { value: 'dhaka_outside', label: 'ঢাকার বাইরে', charge: settings?.dhakaOutsideCharge ?? 120, desc: 'কুরিয়ার সার্ভিস' },
    ]

    const enabledPayments = []
    if (settings) {
        if (settings.codActive) enabledPayments.push({ value: 'COD', label: 'ক্যাশ অন ডেলিভারি' })
        if (settings.bkashActive) enabledPayments.push({ value: 'BKASH', label: 'বিকাশ' })
        if (settings.nagadActive) enabledPayments.push({ value: 'NAGAD', label: 'নগদ' })
    } else {
        enabledPayments.push({ value: 'COD', label: 'ক্যাশ অন ডেলিভারি' })
        enabledPayments.push({ value: 'BKASH', label: 'বিকাশ' })
        enabledPayments.push({ value: 'NAGAD', label: 'নগদ' })
    }

    const selectedDelivery = dynamicDeliveryOptions.find(d => d.value === delivery)
    const deliveryCharge = selectedDelivery?.charge ?? 70
    const total = subtotal + deliveryCharge

    const getInstructionText = () => {
        if (payment === 'BKASH') {
            const inst = settings?.bkashInstruction || 'বিকাশ নম্বর: {number} — পার্সোনাল নম্বরে Send Money করুন এবং ট্রানজেকশন আইডি দিন।'
            const num = settings?.bkashNumber || '01XXXXXXXXX'
            return inst.replace('{number}', num)
        } else if (payment === 'NAGAD') {
            const inst = settings?.nagadInstruction || 'নগদ নম্বর: {number} — পার্সোনাল নম্বরে Send Money করুন এবং ট্রানজেকশন আইডি দিন।'
            const num = settings?.nagadNumber || '01XXXXXXXXX'
            return inst.replace('{number}', num)
        }
        return ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) { toast.error('আপনার নাম দিন'); return }
        if (!phone.trim()) { toast.error('ফোন নম্বর দিন'); return }
        if (!address.trim()) { toast.error('ঠিকানা দিন'); return }
        if ((payment === 'BKASH' || payment === 'NAGAD') && !transactionId.trim()) {
            toast.error('ট্রানজেকশন আইডি দিন')
            return
        }

        setIsSubmitting(true)
        try {
            // Step 1: Create address record
            const addrRes = await fetch('/api/address', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim(),
                    email: 'N/A',
                    street: address.trim(),
                    city: delivery === 'dhaka_inside' ? 'ঢাকা' : 'ঢাকার বাইরে',
                    state: delivery === 'dhaka_inside' ? 'ঢাকা' : 'অন্যান্য',
                    zip: '0000',
                    country: 'Bangladesh',
                }),
            })
            if (!addrRes.ok) {
                const addrErr = await addrRes.json().catch(() => ({}))
                toast.error(addrErr?.error || 'ঠিকানা সেভ করতে সমস্যা হয়েছে')
                setIsSubmitting(false)
                return
            }
            const addrData = await addrRes.json()
            const addressId = addrData.id

            // Step 2: Build order items
            let orderItems = []
            if (isCartMode && items && items.length > 0) {
                orderItems = items.map(it => ({ productId: it.productId || it.id, quantity: it.quantity }))
            } else if (product) {
                orderItems = [{ productId: product.id, quantity: 1 }]
            }

            if (orderItems.length === 0) {
                toast.error('কোনো পণ্য নেই')
                setIsSubmitting(false)
                return
            }

            // Step 3: Submit order
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    addressId,
                    items: orderItems,
                    paymentMethod: payment,
                    deliveryCharge,
                    deliveryZone: delivery,
                    transactionId: transactionId.trim() || undefined,
                    total,
                }),
            })
            if (!orderRes.ok) {
                const orderErr = await orderRes.json().catch(() => ({}))
                toast.error(orderErr?.error || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে')
                setIsSubmitting(false)
                return
            }

            toast.success('অর্ডার কনফার্ম হয়েছে! শীঘ্রই যোগাযোগ করা হবে।')
        } catch (err) {
            console.error('Order submit error:', err)
            toast.error('অর্ডার সাবমিট করতে সমস্যা হয়েছে')
        }
        setIsSubmitting(false)
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>

            {/* আপনার তথ্য */}
            <h2 className='text-xl font-medium text-slate-600 mb-4'>আপনার তথ্য</h2>

            <div className='flex flex-col gap-3 mb-5'>
                <div>
                    <label className='text-xs text-slate-400 mb-1 block'>আপনার নাম *</label>
                    <input
                        type='text'
                        placeholder='পুরো নাম'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className='border border-slate-400 p-1.5 rounded w-full outline-none text-slate-700'
                    />
                </div>
                <div>
                    <label className='text-xs text-slate-400 mb-1 block'>ফোন নম্বর *</label>
                    <input
                        type='tel'
                        placeholder='01XXXXXXXXX'
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className='border border-slate-400 p-1.5 rounded w-full outline-none text-slate-700'
                    />
                </div>
                <div>
                    <label className='text-xs text-slate-400 mb-1 block'>ঠিকানা *</label>
                    <textarea
                        placeholder='বিস্তারিত ঠিকানা লিখুন...'
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        rows={3}
                        className='border border-slate-400 p-1.5 rounded w-full outline-none text-slate-700 resize-none'
                    />
                </div>
            </div>

            {/* ডেলিভারি */}
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p className='mb-2'>🚚 ডেলিভারি</p>
                <div className='flex flex-col gap-2'>
                    {dynamicDeliveryOptions.map(opt => (
                        <div key={opt.value} className='flex gap-2 items-center'>
                            <input
                                type='radio'
                                id={`delivery_${opt.value}`}
                                name='delivery'
                                value={opt.value}
                                checked={delivery === opt.value}
                                onChange={() => setDelivery(opt.value)}
                                className='accent-gray-500'
                            />
                            <label htmlFor={`delivery_${opt.value}`} className='cursor-pointer text-slate-600'>
                                {opt.label} — <span className='font-medium'>{currency}{opt.charge}</span> — <span className='text-xs text-slate-400'>{opt.desc}</span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* পেমেন্ট */}
            <div className='my-4 py-4 border-b border-slate-200 text-slate-400'>
                <p className='mb-3'>💳 পেমেন্ট</p>
                <div className={`grid gap-2 ${
                    enabledPayments.length === 3 ? 'grid-cols-3' : enabledPayments.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
                }`}>
                    {enabledPayments.some(opt => opt.value === 'COD') && (
                        <div
                            onClick={() => setPayment('COD')}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${
                                payment === 'COD'
                                    ? 'border-slate-600 bg-slate-100 text-slate-800 font-medium'
                                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                        >
                            <Banknote size={20} className={payment === 'COD' ? 'text-slate-800' : 'text-slate-400'} />
                            <span className='text-[10px] sm:text-xs mt-1 text-center leading-tight'>ক্যাশ অন ডেলিভারি</span>
                        </div>
                    )}

                    {enabledPayments.some(opt => opt.value === 'BKASH') && (
                        <div
                            onClick={() => setPayment('BKASH')}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${
                                payment === 'BKASH'
                                    ? 'border-slate-600 bg-slate-100 text-slate-800 font-medium'
                                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                        >
                            <Smartphone size={20} className={payment === 'BKASH' ? 'text-slate-800' : 'text-slate-400'} />
                            <span className='text-[10px] sm:text-xs mt-1 text-center leading-tight'>বিকাশ</span>
                        </div>
                    )}

                    {enabledPayments.some(opt => opt.value === 'NAGAD') && (
                        <div
                            onClick={() => setPayment('NAGAD')}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${
                                payment === 'NAGAD'
                                    ? 'border-slate-600 bg-slate-100 text-slate-800 font-medium'
                                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                        >
                            <Wallet size={20} className={payment === 'NAGAD' ? 'text-slate-800' : 'text-slate-400'} />
                            <span className='text-[10px] sm:text-xs mt-1 text-center leading-tight'>নগদ</span>
                        </div>
                    )}
                </div>

                {/* Info Box and Input Field for BKASH / NAGAD */}
                {(payment === 'BKASH' || payment === 'NAGAD') && (
                    <div className='mt-3 flex flex-col gap-3'>
                        <div className='p-3 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed whitespace-pre-line'>
                            <span>{getInstructionText()}</span>
                        </div>
                        <div>
                            <label className='text-xs text-slate-400 mb-1 block'>ট্রানজেকশন আইডি *</label>
                            <input
                                type='text'
                                placeholder='TXN নম্বর'
                                value={transactionId}
                                onChange={e => setTransactionId(e.target.value)}
                                className='border border-slate-400 p-1.5 rounded w-full outline-none text-slate-700'
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* অর্ডার সারাংশ */}
            <div className='pb-4 border-b border-slate-200'>
                <p className='text-slate-400 mb-2'>🧾 অর্ডার সারাংশ</p>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>পণ্য মূল্য:</p>
                        <p>পরিমাণ:</p>
                        <p>ডেলিভারি চার্জ:</p>
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{subtotal.toLocaleString()}</p>
                        <p>{totalQuantity}টি</p>
                        <p>{currency}{deliveryCharge}</p>
                    </div>
                </div>
            </div>

            <div className='flex justify-between py-4'>
                <p>মোট:</p>
                <p className='font-medium text-right'>{currency}{total.toLocaleString()}</p>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-60'
            >
                {isSubmitting ? 'পাঠানো হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
            </button>
            <p className='text-center text-xs text-slate-400 mt-2'>অর্ডার দিলে আমরা শীঘ্রই যোগাযোগ করব</p>
        </div>
    )
}

export default QuickOrderForm
