"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [authorName, setAuthorName] = useState("اسم الكاتب")
  const [authorBio, setAuthorBio] = useState("")

  useEffect(() => {
    const storedName = localStorage.getItem("authorName")
    const storedBio = localStorage.getItem("authorBio")
    if (storedName) setAuthorName(storedName)
    if (storedBio) setAuthorBio(storedBio)
  }, [])

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-200/50 via-transparent to-transparent dark:from-zinc-800/20" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center py-24">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
          {authorName}
        </h1>
        {authorBio && (
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-10 animate-fade-in animate-delay-1 max-w-2xl mx-auto">
            {authorBio}
          </p>
        )}
        <div className="animate-fade-in animate-delay-2">
          <Link
            href="#novels"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-8 py-4 rounded-2xl text-base font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            تصفح الروايات
          </Link>
        </div>
      </div>
    </section>
  )
}
