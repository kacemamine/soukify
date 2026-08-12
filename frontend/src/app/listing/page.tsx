'use client'

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

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

type ProductFormProps = {
  listing: ListingData
  setListing: Dispatch<SetStateAction<ListingData | null>>

  artisanId: string
  setArtisanId: Dispatch<SetStateAction<string>>

  price: string
  setPrice: Dispatch<SetStateAction<string>>

  onSave: () => Promise<void>
  saving: boolean
  saveMessage: string | null
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const workflowSteps = [
  {
    title: 'Photo produit',
    description: 'JPEG, PNG ou WebP',
  },
  {
    title: 'Analyse Gemini',
    description: 'Extraction des champs de fiche',
  },
  {
    title: 'Formulaire editable',
    description: 'Correction manuelle avant validation',
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

export default function ListingPage() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [listing, setListing] = useState<ListingData | null>(null)
  const [artisanId, setArtisanId] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImage(null)
      setPreview(null)
      setListing(null)
      setError('Format non supporté. Veuillez choisir une image JPEG, PNG ou WebP.')
      event.currentTarget.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImage(null)
      setPreview(null)
      setListing(null)
      setError('Image trop volumineuse. Veuillez choisir un fichier de 10 MB maximum.')
      event.currentTarget.value = ''
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
    setListing(null)
    setArtisanId('')
    setPrice('')
    setError(null)
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
      const response = await fetch('http://127.0.0.1:8000/api/listings/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await readJsonResponse(response)
      console.log('STATUS:', response.status)
      console.log('REPONSE BACKEND:', data)

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

      setListing(analysis)
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
    setError("Veuillez renseigner l'identifiant de l'artisan.")
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

    setSaveMessage(
      `Produit enregistré avec succès. ID : ${data.id}`
    )
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
            <a href="#analyse" className="transition hover:text-[var(--green)]">Analyse IA</a>
            <a href="#workflow" className="transition hover:text-[var(--green)]">Workflow</a>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-16 lg:pt-10">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--green)] shadow-sm">
              <CheckIcon className="h-3.5 w-3.5" />
              Création assistée par IA
            </div>

            <h1 className="font-display mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] text-[var(--ink)] sm:text-6xl lg:text-7xl">
              Création intelligente d&apos;une fiche produit.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              SOUKIFY est un PoC de marketplace dédiée à l&apos;artisanat marocain. Ajoutez une photo de votre produit artisanal: l&apos;IA génère une proposition structurée que vous pouvez vérifier et modifier.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#analyse"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--green)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_-20px_rgba(24,79,70,0.9)] transition hover:bg-[var(--green-strong)]"
              >
                Analyser le produit
                <ArrowIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div id="workflow" className="relative">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_40px_100px_-55px_rgba(25,21,17,0.75)] backdrop-blur sm:p-6">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green)]">Flux actuel</p>
                    <h2 className="font-display mt-2 text-3xl font-semibold">AI-Powered Listing</h2>
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
                    L&apos;IA propose le contenu de la fiche. La validation finale reste manuelle et aucune publication automatique n&apos;est effectuée depuis cette page.
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
            <form
              onSubmit={handleAnalyze}
              aria-describedby={error ? 'listing-error' : undefined}
              className="sticky top-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_24px_70px_-45px_rgba(25,21,17,0.65)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green)]">Studio listing</p>
                  <h2 className="font-display mt-2 text-2xl font-semibold">Générer une fiche produit</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Ajoutez une photo nette. L&apos;IA prépare le titre, les descriptions, les couleurs et les tags.</p>
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
                    Analyser le produit
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
          </section>

          <section>
            {!listing ? (
              <div className="grid gap-5">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_24px_70px_-45px_rgba(25,21,17,0.65)] sm:p-8">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green)]">Aperçu annonce</p>
                      <h2 className="font-display mt-2 text-3xl font-semibold">Votre fiche apparaîtra ici.</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                        Après l&apos;analyse, les informations générées s&apos;afficheront dans un formulaire entièrement modifiable.
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
                price={price}
                setPrice={setPrice}
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
            ['Analyse par image', "La page envoie uniquement la photo produit au service d'analyse IA configuré."],
            ['Champs modifiables', 'Le titre, les descriptions, la catégorie, la matière, le style, les couleurs et les tags restent éditables.'],
            ['Validation manuelle', 'La génération IA ne publie rien automatiquement. La validation finale reste séparée de cette page.'],
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
  price,
  setPrice,
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
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Vérifiez et modifiez les informations générées avant validation.</p>
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
          <div>
            <label
              htmlFor="listing-artisan"
              className={labelClass}
            >
              Identifiant artisan
            </label>

            <input
              id="listing-artisan"
              type="text"
              value={artisanId}
              onChange={(e) => setArtisanId(e.target.value)}
              placeholder="ID MongoDB de l'artisan"
              className={inputClass}
            />
          </div>

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

        <EditableTags
          id="listing-tags"
          label="Tags de recherche"
          values={listing.tags}
          onChange={(values) => updateField('tags', values)}
          inputClass={inputClass}
          variant="tag"
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
                Valider et enregistrer
              </>
            )}
          </button>

          {saveMessage && (
            <div
              role="status"
              className="mt-4 rounded-lg border border-[var(--green)]/20 bg-[var(--green-soft)] px-4 py-3 text-sm font-semibold text-[var(--green)]"
            >
              {saveMessage}
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
