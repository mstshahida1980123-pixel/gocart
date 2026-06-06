import { ShieldCheck, Sparkles, Users, Leaf } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
    return (
        <main className="bg-white text-slate-800">
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.05),_transparent_45%)]" />
                <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                        <div className="space-y-6">
                            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm uppercase tracking-[0.2em] text-emerald-700">
                                <Leaf size={16} /> Trusted by modern shoppers
                            </p>
                            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                We make shopping smarter, faster, and more joyful.
                            </h1>
                            <p className="max-w-2xl text-slate-600 text-base sm:text-lg leading-8">
                                GoCart is the online destination for curated gadgets, essentials, and lifestyle finds. We combine seamless discovery, honest pricing, and exceptional support so every purchase feels like the right choice.
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <Link href="/shop" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-600/10 transition hover:bg-emerald-700">
                                    Start shopping
                                </Link>
                                <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3 text-sm text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600">
                                    Contact our team
                                </Link>
                            </div>
                        </div>
                        <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-8 shadow-xl shadow-slate-100/40">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.22em] text-emerald-600">Our mission</p>
                                        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Your everyday essentials, simplified.</h2>
                                    </div>
                                    <Sparkles size={36} className="text-emerald-500" />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Fast support</p>
                                        <p className="mt-3 text-lg font-semibold text-slate-900">Responsive help when you need it.</p>
                                    </div>
                                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Authentic catalog</p>
                                        <p className="mt-3 text-lg font-semibold text-slate-900">Products vetted for quality and value.</p>
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 text-slate-700">
                                    <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Community first</p>
                                    <p className="mt-3 text-lg leading-7">
                                        Every choice we make is guided by trust, transparency, and the goal of making shopping feel effortless.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-slate-100 py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Why choose us</p>
                        <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Built for people who expect more from shopping.</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                icon: ShieldCheck,
                                title: 'Secure checkout',
                                description: 'Modern payments, safe transactions, and fast confirmation.'
                            },
                            {
                                icon: Sparkles,
                                title: 'Curated quality',
                                description: 'Every item is picked for usefulness, reliability, and delight.'
                            },
                            {
                                icon: Users,
                                title: 'Friendly support',
                                description: 'Helpful experts ready to answer questions and resolve issues.'
                            },
                        ].map((item) => (
                            <div key={item.title} className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 shadow-sm transition hover:border-emerald-500/50 hover:bg-white">
                                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <item.icon size={24} />
                                </div>
                                <h3 className="mt-6 text-xl font-semibold text-slate-900">{item.title}</h3>
                                <p className="mt-3 text-slate-600 leading-7">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Our values</p>
                            <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Driven by transparency, value, and real customer care.</h2>
                            <p className="mt-6 text-slate-600 leading-8">We believe every shopper deserves fast shipping, honest pricing, and products they can rely on. Our team blends thoughtful curation with simple service, so every order feels like the best choice for daily living.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                { title: 'Honesty', description: 'Clear pricing, honest product details, and no surprises.' },
                                { title: 'Convenience', description: 'Easy browsing with checkout designed for speed and confidence.' },
                                { title: 'Quality', description: 'Products chosen for durability and everyday use.' },
                                { title: 'Community', description: 'Support and communication that keeps shoppers first.' },
                            ].map((item) => (
                                <div key={item.title} className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 shadow-sm">
                                    <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                                    <p className="mt-3 text-slate-600 leading-7">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
