'use client'

import { FormEvent, useState } from 'react'

function SparkleIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2.5c.76 4.28 2.4 6.92 6.5 8.5-4.1 1.58-5.74 4.22-6.5 8.5-.76-4.28-2.4-6.92-6.5-8.5 4.1-1.58 5.74-4.22 6.5-8.5Z"
        fill="currentColor"
      />

      <path
        d="M19 15.5c.34 1.86 1.05 3.01 2.8 3.7-1.75.69-2.46 1.84-2.8 3.7-.34-1.86-1.05-3.01-2.8-3.7 1.75-.69 2.46-1.84 2.8-3.7Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="m5 12.5 4.4 4.4L19.5 6.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SpinnerIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
      />

      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ArtisanIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M4.5 21c.8-4.1 3.3-6.2 7.5-6.2s6.7 2.1 7.5 6.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function ArtisanPage() {
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [workshop, setWorkshop] = useState('')

  const [categories, setCategories] = useState('')
  const [skills, setSkills] = useState('')

  const [available, setAvailable] = useState(true)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setMessage(null)
    setError(null)

    const payload = {
      name: name.trim(),
      region: region.trim(),
      workshop: workshop.trim(),

      categories: categories
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),

      skills: skills
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),

      available,
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/artisans',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Erreur lors de la création de l'artisan."
        )
      }

      setMessage('Artisan enregistré avec succès.')

      setName('')
      setRegion('')
      setWorkshop('')
      setCategories('')
      setSkills('')
      setAvailable(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)]/60 focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[var(--green)]/10'

  const labelClass =
    'text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]'

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
            linear-gradient(
              rgba(25, 21, 17, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(25, 21, 17, 0.035) 1px,
              transparent 1px
            );

          background-size: 28px 28px;
        }

        .souk-scope .hero-vignette {
          background:
            radial-gradient(
              circle at 14% 18%,
              rgba(200, 132, 44, 0.2),
              transparent 28%
            ),
            radial-gradient(
              circle at 76% 10%,
              rgba(41, 73, 102, 0.2),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #fffaf2 0%,
              #f4eadb 54%,
              #e6d5c0 100%
            );
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
          animation: souk-rise 0.45s
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .souk-scope * {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="hero-vignette market-pattern overflow-hidden border-b border-[var(--line)]">

        {/* NAVBAR */}
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--green)] text-white shadow-sm">
              <SparkleIcon className="h-5 w-5" />
            </div>

            <div>
              <p className="font-display text-xl font-semibold leading-none">
                Soukify
              </p>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Marketplace artisanale
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm font-semibold text-[var(--muted)] md:flex">
            <a
              href="#artisan-form"
              className="transition hover:text-[var(--green)]"
            >
              Profil artisan
            </a>

            <a
              href="#matching"
              className="transition hover:text-[var(--green)]"
            >
              Matching
            </a>
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-16 lg:pt-10">

          <div className="flex flex-col justify-center">

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--green)] shadow-sm">
              <CheckIcon className="h-3.5 w-3.5" />

              Espace artisan
            </div>

            <h1 className="font-display mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] text-[var(--ink)] sm:text-6xl lg:text-7xl">
              Créez votre profil artisan.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Renseignez votre atelier, votre région, vos catégories
              et votre savoir-faire afin de permettre à SOUKIFY
              d&apos;identifier les artisans adaptés aux commandes
              sur-mesure.
            </p>

            <div className="mt-8">
              <a
                href="#artisan-form"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--green)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_-20px_rgba(24,79,70,0.9)] transition hover:bg-[var(--green-strong)]"
              >
                Créer le profil
              </a>
            </div>
          </div>

          {/* RIGHT HERO CARD */}
          <div className="relative">

            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_40px_100px_-55px_rgba(25,21,17,0.75)] backdrop-blur sm:p-6">

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green)]">
                      Profil artisan
                    </p>

                    <h2 className="font-display mt-2 text-3xl font-semibold">
                      Informations métier
                    </h2>
                  </div>

                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--green)] text-white">
                    <ArtisanIcon className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">

                  {[
                    ['Identité', 'Nom, région et atelier'],
                    ['Spécialité', 'Catégories de produits'],
                    ['Savoir-faire', 'Compétences artisanales'],
                    ['Disponibilité', 'État actuel de l’artisan'],
                  ].map(([title, description], index) => (

                    <div
                      key={title}
                      className="flex gap-4 rounded-xl border border-[var(--line)] bg-white p-4"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--green-soft)] text-sm font-bold text-[var(--green)]">
                        {index + 1}
                      </div>

                      <div>
                        <h3 className="font-bold text-[var(--ink)]">
                          {title}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                          {description}
                        </p>
                      </div>
                    </div>

                  ))}

                </div>

                <div
                  id="matching"
                  className="mt-6 rounded-xl bg-[var(--green)] p-4 text-white"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                    Matching
                  </p>

                  <p className="mt-2 text-sm leading-6">
                    Les catégories, le savoir-faire, la région et la
                    disponibilité pourront être utilisés pour comparer
                    l&apos;artisan aux demandes Bespoke.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section
        id="artisan-form"
        className="bg-[var(--canvas)]"
      >
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

          <form
            onSubmit={handleSubmit}
            className="animate-souk-rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_24px_70px_-45px_rgba(25,21,17,0.65)] sm:p-8"
          >

            {/* FORM HEADER */}
            <div className="mb-7 flex flex-col gap-4 border-b border-[var(--line)] pb-6 md:flex-row md:items-start md:justify-between">

              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--green-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--green)]">

                  <ArtisanIcon className="h-4 w-4" />

                  Nouveau profil
                </div>

                <h2 className="font-display mt-4 text-3xl font-semibold">
                  Informations de l&apos;artisan
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Renseignez les informations nécessaires au profil
                  professionnel.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--muted)]">
                Les informations restent modifiables.
              </div>
            </div>

            <div className="grid gap-6">

              {/* NAME */}
              <div>
                <label
                  htmlFor="artisan-name"
                  className={labelClass}
                >
                  Nom de l&apos;artisan
                </label>

                <input
                  id="artisan-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Kacem Amine"
                  required
                  className={inputClass}
                />
              </div>

              {/* REGION + WORKSHOP */}
              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label
                    htmlFor="artisan-region"
                    className={labelClass}
                  >
                    Région
                  </label>

                  <input
                    id="artisan-region"
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Ex. Sidi Kacem"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="artisan-workshop"
                    className={labelClass}
                  >
                    Atelier
                  </label>

                  <input
                    id="artisan-workshop"
                    type="text"
                    value={workshop}
                    onChange={(e) => setWorkshop(e.target.value)}
                    placeholder="Ex. Atelier de poterie traditionnelle"
                    required
                    className={inputClass}
                  />
                </div>

              </div>

              {/* CATEGORY */}
              <div>
                <label
                  htmlFor="artisan-categories"
                  className={labelClass}
                >
                  Catégories
                </label>

                <input
                  id="artisan-categories"
                  type="text"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  placeholder="Ex. Poterie, Céramique"
                  required
                  className={inputClass}
                />

                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  Séparez plusieurs catégories par une virgule.
                </p>
              </div>

              {/* SKILLS */}
              <div>
                <label
                  htmlFor="artisan-skills"
                  className={labelClass}
                >
                  Savoir-faire
                </label>

                <input
                  id="artisan-skills"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Ex. poterie traditionnelle, argile, décoration"
                  required
                  className={inputClass}
                />

                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  Séparez plusieurs savoir-faire par une virgule.
                </p>
              </div>

              {/* AVAILABLE */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">

                <div className="flex items-center justify-between gap-6">

                  <div>
                    <p className={labelClass}>
                      Disponibilité
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Indique si l&apos;artisan est actuellement
                      disponible pour recevoir des demandes.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-center gap-3">

                    <input
                      id="artisan-available"
                      type="checkbox"
                      checked={available}
                      onChange={(e) =>
                        setAvailable(e.target.checked)
                      }
                      className="h-5 w-5 accent-[var(--green)]"
                    />

                    <span className="font-bold text-[var(--green)]">
                      {available
                        ? 'Disponible'
                        : 'Indisponible'}
                    </span>

                  </label>

                </div>
              </div>

              {/* SUBMIT */}
              <div className="border-t border-[var(--line)] pt-6">

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--green)] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--green-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {loading ? (
                    <>
                      <SpinnerIcon className="h-4 w-4" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Enregistrer l&apos;artisan
                    </>
                  )}

                </button>

                {message && (
                  <div
                    role="status"
                    className="animate-souk-rise mt-4 rounded-lg border border-[var(--green)]/20 bg-[var(--green-soft)] px-4 py-3 text-sm font-semibold text-[var(--green)]"
                  >
                    {message}
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="animate-souk-rise mt-4 rounded-lg border border-[var(--terracotta)]/30 bg-[var(--terracotta)]/[0.07] px-4 py-3 text-sm font-semibold text-[var(--terracotta)]"
                  >
                    {error}
                  </div>
                )}

              </div>

            </div>
          </form>
        </div>
      </section>

      {/* FOOTER CARDS */}
      <section className="border-t border-[var(--line)] bg-[var(--surface)]">

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">

          {[
            [
              'Catégories',
              'Indiquent les types de produits réalisés par l’artisan.',
            ],
            [
              'Savoir-faire',
              'Décrit les compétences utilisées pour les commandes sur-mesure.',
            ],
            [
              'Disponibilité',
              'Permet de savoir si l’artisan peut actuellement recevoir une demande.',
            ],
          ].map(([title, text]) => (

            <div
              key={title}
              className="rounded-2xl border border-[var(--line)] bg-white p-5"
            >

              <CheckIcon className="h-5 w-5 text-[var(--green)]" />

              <h2 className="font-display mt-4 text-xl font-semibold">
                {title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {text}
              </p>

            </div>

          ))}

        </div>
      </section>

    </main>
  )
}