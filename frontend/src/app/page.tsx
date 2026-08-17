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
            L&apos;ARTISANAT MAROCAIN, SIMPLEMENT EN LIGNE
          </p>

          <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Découvrez, créez et partagez l&apos;artisanat marocain.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#756c62]">
            SOUKIFY rapproche artisans et clients autour de créations marocaines
            uniques. Publiez facilement vos produits, découvrez des savoir-faire
            authentiques et réalisez vos créations sur mesure.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/listing"
              className="rounded-lg bg-[#185347] px-6 py-3.5 text-center font-semibold text-white transition hover:bg-[#123f37]"
            >
              Publier un produit
            </Link>

            <Link
              href="/bespoke"
              className="rounded-lg border border-[#cabca8] bg-white px-6 py-3.5 text-center font-semibold transition hover:border-[#185347]"
            >
              Commander sur mesure
            </Link>

            <Link
              href="/products"
              className="rounded-lg border border-[#185347] bg-[#f6f0e5] px-6 py-3.5 text-center font-semibold text-[#185347] transition hover:bg-[#185347] hover:text-white"
            >
              Découvrir les créations
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-5 md:grid-cols-3">

          <FeatureCard
            title="Publiez votre création"
            description="Ajoutez simplement une photo de votre produit. SOUKIFY vous aide à préparer automatiquement votre annonce."
            href="/listing"
            action="Ajouter un produit"
          />

          <FeatureCard
            title="Créez sur mesure"
            description="Décrivez la création que vous recherchez et trouvez les artisans les plus adaptés à votre projet."
            href="/bespoke"
            action="Faire une demande"
          />

          <FeatureCard
            title="Publiez avec votre voix"
            description="Décrivez simplement votre produit en darija et laissez SOUKIFY préparer les informations de votre annonce."
            href="/voice"
            action="Utiliser ma voix"
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