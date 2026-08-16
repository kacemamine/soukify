import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f0e5] text-[#211d18]">

      <header className="border-b border-[#ddd1bf] bg-white/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <h1 className="text-2xl font-bold text-[#185347]">
              SOUKIFY
            </h1>

            <p className="text-xs uppercase tracking-[0.18em] text-[#756c62]">
              Marketplace artisanale intelligente
            </p>
          </div>

          <Link
            href="/artisan"
            className="rounded-lg border border-[#185347] px-4 py-2 text-sm font-semibold text-[#185347] transition hover:bg-[#185347] hover:text-white"
          >
            Espace artisan
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-24">
        <div className="max-w-3xl">

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#185347]">
            Artisanat marocain × Intelligence artificielle
          </p>

          <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Digitaliser l&apos;artisanat marocain grâce à l&apos;IA.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#756c62]">
            SOUKIFY est un prototype de marketplace permettant aux artisans
            de créer leurs annonces à partir d&apos;une photo ou de leur voix,
            et aux clients de soumettre des demandes de créations sur mesure.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/listing"
              className="rounded-lg bg-[#185347] px-6 py-3.5 text-center font-semibold text-white transition hover:bg-[#123f37]"
            >
              Créer une fiche produit
            </Link>

            <Link
              href="/bespoke"
              className="rounded-lg border border-[#cabca8] bg-white px-6 py-3.5 text-center font-semibold transition hover:border-[#185347]"
            >
              Demande sur mesure
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-5 md:grid-cols-3">

          <FeatureCard
            title="AI-Powered Listing"
            description="Ajoutez une photo et laissez l'IA générer le titre, les descriptions, la catégorie et les tags."
            href="/listing"
            action="Analyser un produit"
          />

          <FeatureCard
            title="Bespoke Commissions"
            description="Structurez une demande de création personnalisée et identifiez les artisans les plus pertinents."
            href="/bespoke"
            action="Créer une demande"
          />

          <FeatureCard
            title="Darija Voice"
            description="Décrivez oralement le produit en darija pour pré-remplir automatiquement la fiche."
            href="/voice"
            action="Utiliser la voix"
          />

        </div>
      </section>

    </main>
  )
}

type FeatureCardProps = {
  title: string
  description: string
  href: string
  action: string
}

function FeatureCard({
  title,
  description,
  href,
  action,
}: FeatureCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#ddd1bf] bg-white p-6 shadow-sm">

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 flex-1 leading-7 text-[#756c62]">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 font-semibold text-[#185347] hover:underline"
      >
        {action} →
      </Link>

    </article>
  )
}