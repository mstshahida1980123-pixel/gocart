'use client'
import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminOrderSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    dhakaInsideCharge: 70,
    dhakaOutsideCharge: 120,
    codActive: true,
    bkashActive: true,
    bkashNumber: '',
    nagadActive: true,
    nagadNumber: '',
    bkashInstruction: '',
    nagadInstruction: '',
  })
  const [status, setStatus] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/order-settings', { credentials: 'include' })
        const json = await res.json()
        if (res.ok && json.settings) {
          setSettings({
            dhakaInsideCharge: json.settings.dhakaInsideCharge ?? 70,
            dhakaOutsideCharge: json.settings.dhakaOutsideCharge ?? 120,
            codActive: json.settings.codActive ?? true,
            bkashActive: json.settings.bkashActive ?? true,
            bkashNumber: json.settings.bkashNumber ?? '',
            nagadActive: json.settings.nagadActive ?? true,
            nagadNumber: json.settings.nagadNumber ?? '',
            bkashInstruction: json.settings.bkashInstruction ?? '',
            nagadInstruction: json.settings.nagadInstruction ?? '',
          })
        }
      } catch (err) {
        console.error('Failed to load order settings', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Saving settings...')
    try {
      const res = await fetch('/api/order-settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          dhakaInsideCharge: parseFloat(settings.dhakaInsideCharge) || 0,
          dhakaOutsideCharge: parseFloat(settings.dhakaOutsideCharge) || 0,
        }),
      })
      const json = await res.json()
      if (res.ok && json.settings) {
        setSettings({
          dhakaInsideCharge: json.settings.dhakaInsideCharge ?? 70,
          dhakaOutsideCharge: json.settings.dhakaOutsideCharge ?? 120,
          codActive: json.settings.codActive ?? true,
          bkashActive: json.settings.bkashActive ?? true,
          bkashNumber: json.settings.bkashNumber ?? '',
          nagadActive: json.settings.nagadActive ?? true,
          nagadNumber: json.settings.nagadNumber ?? '',
          bkashInstruction: json.settings.bkashInstruction ?? '',
          nagadInstruction: json.settings.nagadInstruction ?? '',
        })
        toast.success('অর্ডার সেটিংস সফলভাবে সেভ হয়েছে')
        setStatus('Order settings saved successfully.')
      } else {
        toast.error(json.error || 'সেটিংস সেভ করতে ব্যর্থ হয়েছে')
        setStatus(json.error || 'Failed to update settings')
      }
    } catch (err) {
      console.error(err)
      toast.error('সেটিংস সেভ করতে ব্যর্থ হয়েছে')
      setStatus('Failed to update settings')
    }
  }

  if (loading) {
    return <div className="p-6">Loading order settings...</div>
  }

  return (
    <div className="text-slate-600 mb-28 p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="text-emerald-500" size={24} />
        <div>
          <h1 className="text-3xl font-semibold">অর্ডার <span className="text-slate-800">সেটিংস</span></h1>
          <p className="text-sm text-slate-500">ডেলিভারি চার্জ এবং পেমেন্ট মেথড কন্ট্রোল করুন।</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Delivery Charge */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">ডেলিভারি চার্জ</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">ডেলিভারি চার্জ সেটিংস</h2>
              <p className="mt-2 text-sm text-slate-500">ঢাকার ভিতরে এবং বাইরে ডেলিভারি চার্জ নির্ধারণ করুন।</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              ঢাকার ভিতরে চার্জ (৳)
              <input
                type="number"
                name="dhakaInsideCharge"
                value={settings.dhakaInsideCharge}
                onChange={handleChange}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              ঢাকার বাইরে চার্জ (৳)
              <input
                type="number"
                name="dhakaOutsideCharge"
                value={settings.dhakaOutsideCharge}
                onChange={handleChange}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                required
              />
            </label>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">পেমেন্ট মেথড</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">পেমেন্ট মেথড সেটিংস</h2>
              <p className="mt-2 text-sm text-slate-500">বিভিন্ন পেমেন্ট অপশন অন/অফ এবং তাদের ডিটেইলস সেট করুন।</p>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Cash on Delivery */}
            <div className="pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">ক্যাশ অন ডেলিভারি</h3>
                  <p className="text-sm text-slate-400">গ্রাহকদের ক্যাশ অন ডেলিভারি সুবিধা দিতে এটি অন রাখুন।</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    name="codActive" 
                    checked={settings.codActive}
                    onChange={handleChange}
                  />
                  <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                </label>
              </div>
            </div>

            {/* bKash */}
            <div className="pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">বিকাশ (bKash)</h3>
                  <p className="text-sm text-slate-400">বিকাশ পেমেন্ট গেটওয়ে / নাম্বার এনেবল করুন।</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    name="bkashActive" 
                    checked={settings.bkashActive}
                    onChange={handleChange}
                  />
                  <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                </label>
              </div>

              {settings.bkashActive && (
                <div className="grid gap-6 mt-4 sm:grid-cols-2 animate-fadeIn">
                  <label className="block text-sm font-medium text-slate-700">
                    বিকাশ নম্বর
                    <input
                      type="text"
                      name="bkashNumber"
                      value={settings.bkashNumber}
                      onChange={handleChange}
                      placeholder="যেমন: 017XXXXXXXX"
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    বিকাশ পেমেন্ট ইনস্ট্রাকশন
                    <textarea
                      name="bkashInstruction"
                      value={settings.bkashInstruction}
                      onChange={handleChange}
                      rows={2}
                      placeholder="বিকাশ নম্বর: XXXXX — পার্সোনাল নম্বরে Send Money করুন এবং ট্রানজেকশন আইডি দিন।"
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 resize-none"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Nagad */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">নগদ (Nagad)</h3>
                  <p className="text-sm text-slate-400">নগদ পেমেন্ট গেটওয়ে / নাম্বার এনেবল করুন।</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    name="nagadActive" 
                    checked={settings.nagadActive}
                    onChange={handleChange}
                  />
                  <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                </label>
              </div>

              {settings.nagadActive && (
                <div className="grid gap-6 mt-4 sm:grid-cols-2 animate-fadeIn">
                  <label className="block text-sm font-medium text-slate-700">
                    নগদ নম্বর
                    <input
                      type="text"
                      name="nagadNumber"
                      value={settings.nagadNumber}
                      onChange={handleChange}
                      placeholder="যেমন: 017XXXXXXXX"
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    নগদ পেমেন্ট ইনস্ট্রাকশন
                    <textarea
                      name="nagadInstruction"
                      value={settings.nagadInstruction}
                      onChange={handleChange}
                      rows={2}
                      placeholder="নগদ নম্বর: XXXXX — পার্সোনাল নম্বরে Send Money করুন এবং ট্রানজেকশন আইডি দিন।"
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 resize-none"
                    />
                  </label>
                </div>
              )}
            </div>

          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400">
            Save changes
          </button>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </div>
      </form>
    </div>
  )
}
