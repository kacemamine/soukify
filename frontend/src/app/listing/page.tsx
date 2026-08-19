'use client'

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type ListingData = {
  title: string
  description_fr: string
  description_ar: string
  category: string
  material: string
  style: string
  colors: string[]
  tags: string[]
}

type PriceSuggestion = {
  min_price: number | null
  max_price: number | null
  average_price: number | null
  similar_products_count: number
}

type ProductFormProps = {
  listing: ListingData
  setListing: Dispatch<SetStateAction<ListingData | null>>

  artisanId: string
  setArtisanId: Dispatch<SetStateAction<string>>

  artisanName: string

  price: string
  setPrice: Dispatch<SetStateAction<string>>

  priceSuggestion: PriceSuggestion | null

  onSave: () => Promise<void>
  saving: boolean
  saveMessage: string | null
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function createVoicePrefillListing(title: string, material: string): ListingData {
  return {
    title,
    description_fr: '',
    description_ar: '',
    category: '',
    material,
    style: '',
    colors: [],
    tags: [],
  }
}

const workflowSteps = [
  {
    title: 'Photo produit',
    description: 'Ajoutez une photo claire de votre création.',
  },
  {
    title: 'Analyse automatique',
    description: 'SOUKIFY prépare les informations de votre annonce.',
  },
  {
    title: 'Informations modifiables',
    description: 'Vérifiez et corrigez les informations avant validation.',
  },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function validateListingData(value: unknown): ListingData | null {
  if (!isRecord(value)) return null

  const {
    title,
    description_fr,
    description_ar,
    category,
    material,
    style,
    colors,
    tags,
  } = value

  if (
    typeof title !== 'string' ||
    typeof description_fr !== 'string' ||
    typeof description_ar !== 'string' ||
    typeof category !== 'string' ||
    typeof material !== 'string' ||
    typeof style !== 'string' ||
    !isStringArray(colors) ||
    !isStringArray(tags)
  ) {
    return null
  }

  return {
    title,
    description_fr,
    description_ar,
    category,
    material,
    style,
    colors,
    tags,
  }
}

async function readJsonResponse(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

function getApiErrorMessage(data: unknown): string {
  if (isRecord(data) && typeof data.detail === 'string') {
    return data.detail
  }

  return "Erreur lors de l'analyse."
}

function CameraIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6H9l1.5-2h3L15 6h2.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  )
}

function SparkleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5c.76 4.28 2.4 6.92 6.5 8.5-4.1 1.58-5.74 4.22-6.5 8.5-.76-4.28-2.4-6.92-6.5-8.5 4.1-1.58 5.74-4.22 6.5-8.5Z"
        fill="currentColor"
      />
      <path d="M19 15.5c.34 1.86 1.05 3.01 2.8 3.7-1.75.69-2.46 1.84-2.8 3.7-.34-1.86-1.05-3.01-2.8-3.7 1.75-.69 2.46-1.84 2.8-3.7Z" fill="currentColor" />
    </svg>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m5 12.5 4.4 4.4L19.5 6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SpinnerIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type VoicePrefill = {
  title: string
  price: string
  material: string
}

export default function ListingPage() {
  return (
    <Suspense fallback={null}>
      <ListingPageWithSearchParams />
    </Suspense>
  )
}

function ListingPageWithSearchParams() {
  const searchParams = useSearchParams()

  const voicePrefill: VoicePrefill = {
    title: searchParams.get('title')?.trim() ?? '',
    price: searchParams.get('price')?.trim() ?? '',
    material: searchParams.get('material')?.trim() ?? '',
  }

  return (
    <ListingPageContent
      key={searchParams.toString()}
      voicePrefill={voicePrefill}
    />
  )
}

function ListingPageContent({ voicePrefill }: { voicePrefill: VoicePrefill }) {
  const hasVoicePrefill = Boolean(
    voicePrefill.title || voicePrefill.price || voicePrefill.material
  )

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [listing, setListing] = useState<ListingData | null>(() =>
    hasVoicePrefill
      ? createVoicePrefillListing(voicePrefill.title, voicePrefill.material)
      : null
  )
  const [artisanId, setArtisanId] = useState('')
  const [artisanName, setArtisanName] = useState('')
  const [price, setPrice] = useState(voicePrefill.price)
  const [priceSuggestion, setPriceSuggestion] =
    useState<PriceSuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [profileChecked, setProfileChecked] = useState(false)

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  useEffect(() => {
    // Récupère le profil artisan créé précédemment dans ce navigateur.
    const savedArtisanId = localStorage.getItem('soukify_artisan_id')
    if (savedArtisanId) {
      setArtisanId(savedArtisanId)
    }
    const savedArtisanName = localStorage.getItem('soukify_artisan_name')
    if (savedArtisanName) {
      setArtisanName(savedArtisanName)
    }
    setProfileChecked(true)
  }, [])

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImage(null)
      setPreview(null)
      setImageUrl(null)
      setListing(
        voicePrefill.title || voicePrefill.price || voicePrefill.material
          ? createVoicePrefillListing(voicePrefill.title, voicePrefill.material)
          : null
      )
      setPrice(voicePrefill.price)
      setError('Format non supporté. Veuillez choisir une image JPEG, PNG ou WebP.')
      event.currentTarget.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImage(null)
      setPreview(null)
      setImageUrl(null)
      setListing(
        voicePrefill.title || voicePrefill.price || voicePrefill.material
          ? createVoicePrefillListing(voicePrefill.title, voicePrefill.material)
          : null
      )
      setPrice(voicePrefill.price)
      setError('Image trop volumineuse. Veuillez choisir un fichier de 10 MB maximum.')
      event.currentTarget.value = ''
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
    setImageUrl(null)
    setListing(
      voicePrefill.title || voicePrefill.price || voicePrefill.material
        ? createVoicePrefillListing(voicePrefill.title, voicePrefill.material)
        : null
    )
    setPrice(voicePrefill.price)
    setError(null)
  }

  async function getPriceSuggestion(
    category: string,
    material: string
  ): Promise<PriceSuggestion | null> {
    if (!category.trim() && !material.trim()) {
      return null
    }

    const params = new URLSearchParams()

    if (category.trim()) {
      params.set('category', category.trim())
    }

    if (material.trim()) {
      params.set('material', material.trim())
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/products/price-suggestion?${params.toString()}`
      )

      if (!response.ok) {
        return null
      }

      return (await response.json()) as PriceSuggestion
    } catch {
      return null
    }
  }

  async function handleAnalyze(event: FormEvent) {
    event.preventDefault()

    if (!image) {
      setError('Veuillez sélectionner une image.')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', image)

    try {
      // Analyse d'image : envoi de l'image au backend pour extraire les caractéristiques
      const response = await fetch('http://127.0.0.1:8000/api/listings/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await readJsonResponse(response)

      if (!response.ok) {
        throw new Error(getApiErrorMessage(data))
      }

      if (!isRecord(data)) {
        throw new Error('Réponse IA invalide.')
      }

      const analysis = validateListingData(data.analysis)

      if (!analysis) {
        throw new Error('Réponse IA invalide.')
      }

      const finalListing: ListingData = {
        ...analysis,
        title: voicePrefill.title || analysis.title,
        material: voicePrefill.material || analysis.material,
      }

      setListing(finalListing)
      if (typeof data.image_url === 'string') {
        setImageUrl(data.image_url)
      }

      if (voicePrefill.price) {
        setPrice(voicePrefill.price)
      }

      const suggestion = await getPriceSuggestion(
        finalListing.category,
        finalListing.material
      )

      setPriceSuggestion(suggestion)
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Impossible de contacter le service d’analyse.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Impossible de contacter le service d’analyse.')
      }
  } finally {
      setLoading(false)
    }
  }
  async function handleSaveProduct() {
  if (!listing) {
    setError('Aucune fiche produit à enregistrer.')
    return
  }

  if (!artisanId.trim()) {
    setError("Veuillez créer votre profil artisan avant d'enregistrer un produit.")
    return
  }

  const numericPrice = Number(price)

  if (!price.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) {
    setError('Veuillez renseigner un prix valide supérieur à 0.')
    return
  }

  setSaving(true)
  setError(null)
  setSaveMessage(null)

  // Publication d'un produit : préparation des données validées pour la création
  const productPayload = {
    artisan_id: artisanId.trim(),
    title: listing.title.trim(),
    description_fr: listing.description_fr.trim(),
    description_ar: listing.description_ar.trim(),
    category: listing.category.trim(),
    material: listing.material.trim(),
    style: listing.style.trim(),
    colors: listing.colors.filter(Boolean),
    tags: listing.tags.filter(Boolean),
    price: numericPrice,
    status: 'published',
    ...(imageUrl ? { image_url: imageUrl } : {}),
  }

  try {
    const response = await fetch(
      'http://127.0.0.1:8000/api/products',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productPayload),
      }
    )

    const data = await readJsonResponse(response)

    if (!response.ok) {
      throw new Error(getApiErrorMessage(data))
    }

    if (
      !isRecord(data) ||
      typeof data.id !== 'string'
    ) {
      throw new Error("Réponse d'enregistrement invalide.")
    }

    if (artisanName) {
      setSaveMessage(`Votre produit a été publié avec succès par ${artisanName}.`)
    } else {
      setSaveMessage('Votre produit a été publié avec succès.')
    }
  } catch (err) {
    if (err instanceof TypeError) {
      setError(
        "Impossible de contacter le service d'enregistrement."
      )
    } else if (err instanceof Error) {
      setError(err.message)
    } else {
      setError(
        "Une erreur est survenue lors de l'enregistrement."
      )
    }
} finally {
    setSaving(false)
  }
}

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

        .souk-scope .font-display {
          font-family: 'Fraunces', ui-serif, Georgia, serif;
          font-optical-sizing: auto;
        }

        .souk-scope .market-pattern {
          background-image:
            linear-gradient(rgba(25, 21, 17, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(25, 21, 17, 0.035) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .souk-scope .hero-vignette {
          background:
            radial-gradient(circle at 14% 18%, rgba(200, 132, 44, 0.2), transparent 28%),
            radial-gradient(circle at 76% 10%, rgba(41, 73, 102, 0.2), transparent 30%),
            linear-gradient(135deg, #fffaf2 0%, #f4eadb 54%, #e6d5c0 100%);
        }

        @keyframes souk-rise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .souk-scope .animate-souk-rise {
          animation: souk-rise 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .souk-scope * {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <section className="hero-vignette market-pattern overflow-hidden border-b border-[var(--line)]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--green)] text-white shadow-sm">
              <SparkleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold leading-none">Soukify</p>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Marketplace artisanale</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm font-semibold text-[var(--muted)] md:flex">
            <a href="#analyse" className="transition hover:text-[var(--green)]">Analyse automatique</a>
            <a href="#workflow" className="transition hover:text-[var(--green)]">Comment ça marche</a>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-16 lg:pt-10">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--green)] shadow-sm">
              <CheckIcon className="h-3.5 w-3.5" />
              Création assistée par IA
            </div>

            <h1 className="font-display mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] text-[var(--ink)] sm:text-6xl lg:text-7xl">
              Publiez votre création en quelques instants.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Ajoutez simplement une photo de votre création. SOUKIFY prépare
              automatiquement les informations de votre annonce, que vous pouvez
              ensuite vérifier et modifier avant de l&apos;enregistrer.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#analyse"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--green)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_-20px_rgba(24,79,70,0.9)] transition hover:bg-[var(--green-strong)]"
              >
                Ajouter mon produit
                <ArrowIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div id="workflow" className="relative">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_40px_100px_-55px_rgba(25,21,17,0.75)] backdrop-blur sm:p-6">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green)]">Comment ça marche</p>
                    <h2 className="font-display mt-2 text-3xl font-semibold">Créer une annonce</h2>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--green)] text-white">
                    <SparkleIcon className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {workflowSteps.map((step, index) => (
                    <div key={step.title} className="flex gap-4 rounded-xl border border-[var(--line)] bg-white p-4">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--green-soft)] text-sm font-bold text-[var(--green)]">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--ink)]">{step.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl bg-[var(--green)] p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Important</p>
                  <p className="mt-2 text-sm leading-6">
                    Les informations proposées restent entièrement modifiables.
                    Vous gardez toujours le contrôle avant l&apos;enregistrement de votre annonce.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="analyse" className="bg-[var(--canvas)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[420px_1fr] lg:px-8 lg:py-14">
          <section>
            {!profileChecked ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_24px_70px_-45px_rgba(25,21,17,0.65)]">
                <SpinnerIcon className="h-8 w-8 text-[var(--green)]" />
              </div>
            ) : !artisanId ? (
              <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_24px_70px_-45px_rgba(25,21,17,0.65)] sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
                    Créez d&apos;abord votre profil artisan
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                    Pour publier une création sur SOUKIFY, vous devez disposer d&apos;un profil artisan.
                  </p>
                  <Link
                    href="/artisan"
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--green)] px-6 py-3.5 font-bold text-white transition hover:bg-[var(--green-strong)]"
                  >
                    Créer mon profil artisan
                  </Link>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleAnalyze}
                aria-describedby={error ? 'listing-error' : undefined}
                className="sticky top-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_24px_70px_-45px_rgba(25,21,17,0.65)] sm:p-6"
              >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green)]">Nouveau produit</p>
                  <h2 className="font-display mt-2 text-2xl font-semibold">Ajouter un produit</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Ajoutez une photo nette de votre création. SOUKIFY vous aide à préparer le titre, la description et les principales informations de l&apos;annonce.</p>
                </div>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--green-soft)] text-[var(--green)]">
                  <CameraIcon className="h-5 w-5" />
                </div>
              </div>

              <label
                htmlFor="product-image"
                className="group mt-6 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-[var(--canvas)] px-4 text-center transition hover:border-[var(--green)] hover:bg-[var(--green-soft)] focus-within:border-[var(--green)] focus-within:ring-4 focus-within:ring-[var(--green)]/10"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Aperçu du produit" className="h-56 w-full rounded-lg object-contain" />
                ) : (
                  <>
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-[var(--green)] shadow-sm transition group-hover:scale-105">
                      <CameraIcon className="h-7 w-7" />
                    </span>
                    <span className="mt-4 text-base font-bold text-[var(--ink)]">Déposer une photo produit</span>
                    <span className="mt-1 text-sm text-[var(--muted)]">JPG, PNG ou WebP jusqu&apos;à 10 MB</span>
                  </>
                )}

                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>

              {image && (
                <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{image.name}</p>
                    <p className="text-xs text-[var(--muted)]">Image prête pour l&apos;analyse</p>
                  </div>
                  <CheckIcon className="h-5 w-5 shrink-0 text-[var(--green)]" />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !image}
                aria-busy={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--green)] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--green-strong)] disabled:cursor-not-allowed disabled:bg-[#c9c0b3] disabled:text-[#746b60]"
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="h-4 w-4" />
                    Analyse en cours
                  </>
                ) : (
                  <>
                    <SparkleIcon className="h-4 w-4" />
                    Préparer mon annonce
                  </>
                )}
              </button>

              {error && (
                <div
                  id="listing-error"
                  role="alert"
                  className="animate-souk-rise mt-4 rounded-lg border border-[var(--terracotta)]/30 bg-[var(--terracotta)]/[0.07] px-4 py-3 text-sm font-semibold text-[var(--terracotta)]"
                >
                  {error}
                </div>
              )}
            </form>
            )}
          </section>

          <section>
            {!listing ? (
              <div className="grid gap-5">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_24px_70px_-45px_rgba(25,21,17,0.65)] sm:p-8">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green)]">Aperçu de l&apos;annonce</p>
                      <h2 className="font-display mt-2 text-3xl font-semibold">Votre annonce apparaîtra ici.</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                        Après l&apos;analyse de votre photo, vous pourrez vérifier et modifier toutes les informations avant de les enregistrer.
                      </p>
                    </div>
                    <div className="grid h-16 w-16 place-items-center rounded-xl bg-[var(--green-soft)] text-[var(--green)]">
                      <SparkleIcon className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  {workflowSteps.map((step) => (
                    <article key={step.title} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
                      <CheckIcon className="h-5 w-5 text-[var(--green)]" />
                      <h3 className="font-display mt-4 text-xl font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <ProductForm
                listing={listing}
                setListing={setListing}
                artisanId={artisanId}
                setArtisanId={setArtisanId}
                artisanName={artisanName}
                price={price}
                setPrice={setPrice}
                priceSuggestion={priceSuggestion}
                onSave={handleSaveProduct}
                saving={saving}
                saveMessage={saveMessage}
              />
            )}
          </section>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            ['Analyse de votre photo', "SOUKIFY utilise votre photo pour préparer automatiquement les principales informations du produit."],
            ['Informations modifiables', 'Le titre, les descriptions, la catégorie, la matière, le style, les couleurs et les tags peuvent être modifiés.'],
            ['Vous gardez le contrôle', "Vérifiez les informations proposées avant d'enregistrer votre annonce."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <CheckIcon className="h-5 w-5 text-[var(--green)]" />
              <h2 className="font-display mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function ProductForm({
  listing,
  setListing,
  artisanId,
  setArtisanId,
  artisanName,
  price,
  setPrice,
  priceSuggestion,
  onSave,
  saving,
  saveMessage,
}: ProductFormProps) {
  function updateField(field: keyof ListingData, value: string | string[]) {
    setListing((currentListing) => {
      if (!currentListing) return currentListing

      return {
        ...currentListing,
        [field]: value,
      }
    })
  }

  const inputClass =
    'mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/60 focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[var(--green)]/10'

  const labelClass = 'text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]'

  return (
    <div className="animate-souk-rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_24px_70px_-45px_rgba(25,21,17,0.65)] sm:p-8">
      <div className="mb-7 flex flex-col gap-4 border-b border-[var(--line)] pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--green-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--green)]">
            <CheckIcon className="h-3.5 w-3.5" />
            Analyse IA terminée
          </div>
          <h2 className="font-display mt-4 text-3xl font-semibold">Fiche produit générée</h2>
          {artisanName && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--green)]/20 bg-[var(--green-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[var(--green)]">
              Artisan : {artisanName}
            </div>
          )}
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Vérifiez et modifiez les informations générées avant validation.</p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--muted)]">
          Aucune publication automatique.
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <label htmlFor="listing-title" className={labelClass}>Titre du produit</label>
          <input id="listing-title" value={listing.title} onChange={(e) => updateField('title', e.target.value)} className={inputClass} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {!artisanId && (
            <div>
              <div className="flex h-full flex-col justify-center rounded-xl border border-[var(--terracotta)]/30 bg-[var(--terracotta)]/[0.07] p-4 text-sm text-[var(--terracotta)]">
                <p className="font-semibold">
                  Aucun profil artisan n&apos;est associé à cet appareil.
                  Créez votre profil artisan avant d&apos;enregistrer un produit.
                </p>
                <Link href="/artisan" className="mt-2 font-bold hover:underline">
                  Créer mon profil artisan
                </Link>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="listing-price"
              className={labelClass}
            >
              Prix (MAD)
            </label>

            <input
              id="listing-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex. 450"
              className={inputClass}
            />

            {priceSuggestion && (
              <div className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
                {priceSuggestion.similar_products_count > 0 &&
                priceSuggestion.min_price !== null &&
                priceSuggestion.max_price !== null ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green)]">
                      Prix indicatif observé
                    </p>

                    <p className="mt-1 text-lg font-bold text-[var(--ink)]">
                      {priceSuggestion.min_price} – {priceSuggestion.max_price} MAD
                    </p>

                    {priceSuggestion.average_price !== null && (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Prix moyen : {priceSuggestion.average_price} MAD
                      </p>
                    )}

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Basé sur {priceSuggestion.similar_products_count}{' '}
                      produit
                      {priceSuggestion.similar_products_count > 1 ? 's' : ''}{' '}
                      similaire
                      {priceSuggestion.similar_products_count > 1 ? 's' : ''}.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    Aucun produit similaire disponible pour proposer une fourchette de prix.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="listing-category" className={labelClass}>Catégorie</label>
            <input id="listing-category" value={listing.category} onChange={(e) => updateField('category', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="listing-material" className={labelClass}>Matière</label>
            <input id="listing-material" value={listing.material} onChange={(e) => updateField('material', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="listing-style" className={labelClass}>Style</label>
            <input id="listing-style" value={listing.style} onChange={(e) => updateField('style', e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <label htmlFor="listing-description-fr" className={labelClass}>Description française</label>
            <textarea id="listing-description-fr" value={listing.description_fr} onChange={(e) => updateField('description_fr', e.target.value)} className={`${inputClass} min-h-40 resize-y leading-7`} />
          </div>

          <div>
            <label htmlFor="listing-description-ar" className={labelClass}>Description arabe</label>
            <textarea id="listing-description-ar" dir="rtl" value={listing.description_ar} onChange={(e) => updateField('description_ar', e.target.value)} className={`${inputClass} min-h-40 resize-y text-right leading-7`} />
          </div>
        </div>

        <EditableTags
          id="listing-colors"
          label="Couleurs dominantes"
          values={listing.colors}
          onChange={(values) => updateField('colors', values)}
          inputClass={inputClass}
          variant="color"
        />


        <div className="border-t border-[var(--line)] pt-6">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--green)] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--green-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <SpinnerIcon className="h-4 w-4" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                Publier mon produit
              </>
            )}
          </button>

          {saveMessage && (
            <div
              role="status"
              className="mt-4 rounded-lg border border-[var(--green)]/20 bg-[var(--green-soft)] px-4 py-3 text-sm font-semibold text-[var(--green)]"
            >
              <p>{saveMessage}</p>
              <Link href="/products" className="mt-2 inline-block font-bold underline hover:no-underline">
                Voir les créations →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EditableTags({
  id,
  label,
  values,
  onChange,
  inputClass,
  variant,
}: {
  id: string
  label: string
  values: string[]
  onChange: (values: string[]) => void
  inputClass: string
  variant: 'color' | 'tag'
}) {
  const cleanValues = values.filter(Boolean)

  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</label>
      <input
        id={id}
        value={values.join(', ')}
        onChange={(e) => onChange(e.target.value.split(',').map((item) => item.trim()))}
        className={inputClass}
      />

      {cleanValues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {cleanValues.map((value, i) => (
            <span
              key={`${value}-${i}`}
              className={
                variant === 'color'
                  ? 'rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--muted)]'
                  : 'rounded-full bg-[var(--green-soft)] px-3 py-1 text-xs font-bold text-[var(--green)]'
              }
            >
              {variant === 'tag' ? `#${value}` : value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}