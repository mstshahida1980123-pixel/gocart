'use client'
import React, { useState } from 'react'
import Title from './Title'
import toast from 'react-hot-toast'

const Newsletter = () => {
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email.trim()) return
        setSubmitting(true)
        try {
            const res = await fetch('/api/contact-messages', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: 'Newsletter Subscriber', email: email.trim(), message: 'Newsletter subscription request.' })
            })
            if (res.ok) {
                toast.success('Subscribed successfully!')
                setEmail('')
            } else {
                toast.error('Failed to subscribe. Please try again.')
            }
        } catch {
            toast.error('Something went wrong.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='flex flex-col items-center mx-4 my-36'>
            <Title title="Join Newsletter" description="Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week." visibleButton={false} />
            <form onSubmit={handleSubmit} className='flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200'>
                <input
                    className='flex-1 pl-5 outline-none bg-transparent'
                    type="email"
                    placeholder='Enter your email address'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className='font-medium bg-green-500 text-white px-7 py-3 rounded-full hover:scale-103 active:scale-95 transition disabled:opacity-60'
                >
                    {submitting ? 'Sending...' : 'Get Updates'}
                </button>
            </form>
        </div>
    )
}

export default Newsletter