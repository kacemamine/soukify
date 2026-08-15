'use client'

import { ChangeEvent, FormEvent, useState } from 'react'

type BespokeForm = {
  category: string
  region: string
  description: string
  dimensions: string
  material: string
  colors: string
  inspiration: string
  budget: string
  deadline: string
}

type ArtisanMatch = {
  artisan_id: string
  name: string
  score: number
  reasons: string[]
}

export default function BespokePage() {
  const [form, setForm] = useState<BespokeForm>({
    category: '',
    region: '',
    description: '',
    dimensions: '',
    material: '',
    colors: '',
    inspiration: '',
    budget: '',
    deadline: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [matches, setMatches] = useState<ArtisanMatch[]>([])
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [matchingError, setMatchingError] = useState<string | null>(null)

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function loadMatching(bespokeId: string) {
    setMatchingLoading(true)
    setMatchingError(null)
    setMatches([])

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/matching/${bespokeId}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'Erreur lors du matching des artisans.'
        )
      }

      setMatches(data.matches || [])
    } catch (err) {
      if (err instanceof Error) {
        setMatchingError(err.message)
      } else {
        setMatchingError('Une erreur est survenue.')
      }
    } finally {
      setMatchingLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError(null)
    setSuccess(null)
    setMatchingError(null)
    setMatches([])

    const budget = Number(form.budget)

    if (
      !form.category.trim() ||
      !form.region.trim() ||
      !form.description.trim() ||
      !form.dimensions.trim() ||
      !form.material.trim() ||
      !form.inspiration.trim() ||
      !form.deadline.trim()
    ) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }

    if (!form.budget.trim() || Number.isNaN(budget) || budget <= 0) {
      setError('Veuillez renseigner un budget valide.')
      return
    }

    const colors = form.colors
      .split(',')
      .map((color) => color.trim())
      .filter(Boolean)

    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/bespoke',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: form.category.trim(),
            region: form.region.trim(),
            description: form.description.trim(),
            dimensions: form.dimensions.trim(),
            material: form.material.trim(),
            colors,
            inspiration: form.inspiration.trim(),
            budget,
            deadline: form.deadline.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : "Erreur lors de l'enregistrement."
        )
      }

      setSuccess(
        `Demande enregistrée avec succès. ID : ${data.id}`
      )

      await loadMatching(data.id)

      setForm({
        category: '',
        region: '',
        description: '',
        dimensions: '',
        material: '',
        colors: '',
        inspiration: '',
        budget: '',
        deadline: '',
      })
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Impossible de contacter le backend.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10'

  return (
    <main className="min-h-screen bg-[#f7f1e7] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
            SOUKIFY
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-stone-900">
            Demande sur-mesure
          </h1>

          <p className="mt-3 text-stone-600">
            Décrivez votre création et précisez vos besoins afin de
            transmettre une demande structurée à un artisan.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="space-y-6">

            {/* Catégorie + Région */}
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Catégorie
                </label>

                <input
                  id="category"
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Ex. Tapis"
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  htmlFor="region"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Région
                </label>

                <input
                  id="region"
                  name="region"
                  type="text"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="Ex. Marrakech"
                  className={fieldClass}
                />
              </div>

            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                Description de la demande
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Ex. Je souhaite un tapis amazigh personnalisé pour mon salon..."
                className={fieldClass}
              />
            </div>

            {/* Dimensions + Matière */}
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label
                  htmlFor="dimensions"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Dimensions
                </label>

                <input
                  id="dimensions"
                  name="dimensions"
                  value={form.dimensions}
                  onChange={handleChange}
                  placeholder="Ex. 200 x 300 cm"
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  htmlFor="material"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Matière
                </label>

                <input
                  id="material"
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  placeholder="Ex. Laine naturelle"
                  className={fieldClass}
                />
              </div>

            </div>

            {/* Couleurs */}
            <div>
              <label
                htmlFor="colors"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                Couleurs souhaitées
              </label>

              <input
                id="colors"
                name="colors"
                value={form.colors}
                onChange={handleChange}
                placeholder="Ex. Beige, Rouge, Noir"
                className={fieldClass}
              />

              <p className="mt-2 text-xs text-stone-500">
                Séparez les différentes couleurs par des virgules.
              </p>
            </div>

            {/* Inspiration */}
            <div>
              <label
                htmlFor="inspiration"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                Inspiration
              </label>

              <textarea
                id="inspiration"
                name="inspiration"
                value={form.inspiration}
                onChange={handleChange}
                rows={3}
                placeholder="Ex. Motifs géométriques amazigh traditionnels"
                className={fieldClass}
              />
            </div>

            {/* Budget + Délai */}
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label
                  htmlFor="budget"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Budget (MAD)
                </label>

                <input
                  id="budget"
                  type="number"
                  min="1"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="Ex. 2500"
                  className={fieldClass}
                />
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Délai souhaité
                </label>

                <input
                  id="deadline"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  placeholder="Ex. 30 jours"
                  className={fieldClass}
                />
              </div>

            </div>

            {/* Erreur */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Succès */}
            {success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              >
                {success}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-800 px-5 py-3 font-medium text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Enregistrement...'
                : 'Envoyer la demande'}
            </button>

          </div>
        </form>

        {/* Chargement du matching */}
        {matchingLoading && (
          <div className="mt-6 rounded-xl border border-[#dfd5c5] bg-white p-5 text-[#191511]">
            <p>Recherche des artisans adaptés...</p>
          </div>
        )}

        {/* Erreur du matching */}
        {matchingError && (
          <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-5 text-red-700">
            {matchingError}
          </div>
        )}

        {/* Résultats du matching */}
        {matches.length > 0 && (
          <section className="mt-8 text-[#191511]">
            <div className="mb-5">

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#184f46]">
                Matching
              </p>

              <h2 className="mt-2 text-3xl font-semibold text-[#191511]">
                Artisans recommandés
              </h2>

              <p className="mt-2 text-sm text-[#665d53]">
                Artisans classés selon leur compatibilité avec votre demande.
              </p>

            </div>

            <div className="grid gap-4">

              {matches.map((artisan, index) => (
                <article
                  key={artisan.artisan_id}
                  className="rounded-2xl border border-[#dfd5c5] bg-white p-5 text-[#191511]"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#dfece7] text-sm font-bold text-[#184f46]">
                        {index + 1}
                      </span>

                      <h3 className="text-xl font-semibold text-[#191511]">
                        {artisan.name}
                      </h3>

                    </div>

                    <div className="rounded-full bg-[#184f46] px-4 py-2 text-sm font-bold text-white">
                      {artisan.score}/100
                    </div>

                  </div>

                  {artisan.reasons.length > 0 && (
                    <div className="mt-5">

                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#665d53]">
                        Pourquoi cet artisan ?
                      </p>

                      <ul className="mt-3 space-y-2">

                        {artisan.reasons.map((reason) => (
                          <li
                            key={reason}
                            className="flex items-start gap-2 text-sm text-[#665d53]"
                          >

                            <span className="mt-0.5 font-bold text-[#184f46]">
                              ✓
                            </span>

                            <span>
                              {reason}
                            </span>

                          </li>
                        ))}

                      </ul>

                    </div>
                  )}

                </article>
              ))}

            </div>
          </section>
        )}

      </div>
    </main>
  )
}