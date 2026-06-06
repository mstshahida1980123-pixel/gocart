import Link from 'next/link'
import prisma from '@/lib/prisma'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="mx-6 mb-28">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-emerald-600">Categories</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Explore products by category and discover collections curated for every need.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="h-52 overflow-hidden bg-slate-100">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                )}
              </div>
              <div className="p-5">
                <p className="text-sm uppercase tracking-[0.22em] text-emerald-600">{category.slug}</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{category.name}</h2>
                <p className="mt-3 text-sm text-slate-500 line-clamp-3">{category.description || 'Shop products in this category.'}</p>
                <div className="mt-4 text-sm font-semibold text-slate-700">{category._count?.products || 0} products</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
