'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Product = {
  id: string
  title: string
  price: number
  category: string
  material: string
  tags: string[]
  status: string
  artisan_name?: string
  image_url?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Chargement du catalogue : récupération de tous les produits publiés
    fetch('http://127.0.0.1:8000/api/products')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data: Product[]) => {
        const published = data.filter((p) => p.status === 'published')
        setProducts(published)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="souk-scope min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap');

        .souk-scope {
          --ink: #191511;
          --muted: #665d53;
          --line: #dfd5c5;
          --canvas: #f7f1e7;
          --surface: #fffaf2;
          --surface-strong: #ffffff;
          --green: #184f46;
          --green-strong: #103c35;
          --green-soft: #dfece7;
          --terracotta: #a34931;

          font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif;
        }

        .souk-scope h1,
        .souk-scope h2,
        .souk-scope h3,
        .souk-scope .font-display {
          font-family: 'Fraunces', ui-serif, Georgia, serif;
        }
      `}</style>

      <header className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--green)]">
              SOUKIFY
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--green)] hover:underline"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:py-16">
        <div className="mb-10">
          <h2 className="font-display text-4xl font-bold text-[var(--ink)]">
            Découvrez les créations
          </h2>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Explorez les produits artisanaux publiés sur SOUKIFY.
          </p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <p className="font-semibold text-[var(--green)]">Chargement des créations...</p>
          </div>
        ) : error ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-[var(--terracotta)]/30 bg-[var(--terracotta)]/[0.07]">
            <p className="font-semibold text-[var(--terracotta)]">Impossible de charger les créations pour le moment.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] py-20 text-center">
            <p className="font-display text-xl font-bold text-[var(--ink)]">Aucune création publiée pour le moment.</p>
            <p className="mt-3 text-[var(--muted)]">Les nouvelles créations des artisans apparaîtront bientôt ici.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="flex flex-col rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm transition hover:shadow-md">
                {product.image_url ? (
                  <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-[var(--canvas)]">
                    <img
                      src={`http://127.0.0.1:8000${product.image_url}`}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex aspect-square items-center justify-center rounded-xl bg-[var(--canvas)] text-sm font-semibold text-[var(--muted)]">
                    Photo non disponible
                  </div>
                )}
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">
                  {product.title}
                </h3>
                <p className="mt-2 text-lg font-bold text-[var(--green)]">
                  {product.price} MAD
                </p>
                
                <div className="mt-4 space-y-1 text-sm text-[var(--muted)]">
                  {product.category && <p>{product.category}</p>}
                  {product.material && <p>{product.material}</p>}
                </div>

                {product.artisan_name && (
                  <p className="mt-4 font-semibold text-[var(--ink)]">
                    Par {product.artisan_name}
                  </p>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className="rounded bg-[var(--green-soft)] px-2 py-1 text-xs font-semibold text-[var(--green)]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
