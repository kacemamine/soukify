'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function HomeButton() {
  const pathname = usePathname()

  if (pathname === '/') {
    return null
  }

  return (
    <Link 
      href="/"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-[#dfd5c5] bg-white px-4 py-2.5 text-sm font-semibold text-[#184f46] shadow-md transition hover:scale-105 hover:bg-[#dfece7]"
    >
      ← Retour à l'accueil
    </Link>
  )
}
