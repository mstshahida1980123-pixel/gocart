'use client'
import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'

export default function AdminMessagesPage() {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch('/api/contact-messages', { credentials: 'same-origin' })
        const data = await res.json()
        if (res.ok) {
          setMessages(data.messages)
          setSelected(data.messages[0] || null)
        }
      } catch (err) {
        console.error('Failed to load messages', err)
      } finally {
        setLoading(false)
      }
    }
    loadMessages()
  }, [])

  if (loading) {
    return <div className="p-6">Loading messages...</div>
  }

  return (
    <div className="text-slate-600 mb-28 p-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="text-emerald-500" size={24} />
        <div>
          <h1 className="text-3xl font-semibold">Contact <span className="text-slate-800">Messages</span></h1>
          <p className="text-sm text-slate-500">Review customer inquiries sent through the contact form.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-800">All messages</h2>
            <span className="text-sm text-slate-500">{messages.length} total</span>
          </div>
          {messages.length === 0 ? (
            <div className="p-6 text-slate-500">No contact messages yet.</div>
          ) : (
            messages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelected(message)}
                className={`w-full text-left rounded-3xl p-4 border ${selected?.id === message.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'} transition`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{message.name}</p>
                    <p className="text-sm text-slate-500">{message.email}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{new Date(message.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600 line-clamp-2">{message.message}</p>
              </button>
            ))
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Message details</h2>
                  <p className="text-sm text-slate-500">Read and manage customer inquiries.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const confirmed = confirm('Permanently delete this message? This cannot be undone.')
                    if (!confirmed) return

                    try {
                      const res = await fetch(`/api/contact-messages/${selected.id}`, { method: 'DELETE', credentials: 'same-origin' })
                      if (res.ok) {
                        const remaining = messages.filter((msg) => msg.id !== selected.id)
                        setMessages(remaining)
                        setSelected(remaining[0] || null)
                      } else {
                        const data = await res.json()
                        alert(data.error || 'Failed to delete message')
                      }
                    } catch (err) {
                      console.error(err)
                      alert('Failed to delete message')
                    }
                  }}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
              <div className="mt-4 space-y-4 text-slate-700">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">From</p>
                  <p className="mt-2 font-semibold text-slate-900">{selected.name}</p>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Received</p>
                  <p className="mt-2 text-slate-500">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Message</p>
                  <p className="mt-3 whitespace-pre-line rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-700">{selected.message}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-slate-500">Select a message to view details.</div>
          )}
        </div>
      </div>
    </div>
  )
}
