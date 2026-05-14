"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { ThemeToggle } from "./ThemeToggle"
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi"
import { useState, useEffect } from "react"

export function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [siteName, setSiteName] = useState("متجر الروايات")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("siteName")
    if (stored) setSiteName(stored)

    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {siteName}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              الرئيسية
            </Link>
            <Link
              href="/#novels"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              الروايات
            </Link>
            <Link
              href="/about"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              عن الكاتب
            </Link>
            <Link
              href="/contact"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              اتصل بنا
            </Link>
            {session?.user && (
              <Link
                href="/dashboard"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                لوحة التحكم
              </Link>
            )}
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {menuOpen ? (
                <HiOutlineX className="w-5 h-5" />
              ) : (
                <HiOutlineMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block text-sm text-zinc-600 dark:text-zinc-400 py-2"
              onClick={() => setMenuOpen(false)}
            >
              الرئيسية
            </Link>
            <Link
              href="/#novels"
              className="block text-sm text-zinc-600 dark:text-zinc-400 py-2"
              onClick={() => setMenuOpen(false)}
            >
              الروايات
            </Link>
            <Link
              href="/about"
              className="block text-sm text-zinc-600 dark:text-zinc-400 py-2"
              onClick={() => setMenuOpen(false)}
            >
              عن الكاتب
            </Link>
            <Link
              href="/contact"
              className="block text-sm text-zinc-600 dark:text-zinc-400 py-2"
              onClick={() => setMenuOpen(false)}
            >
              اتصل بنا
            </Link>
            {session?.user && (
              <Link
                href="/dashboard"
                className="block text-sm text-zinc-600 dark:text-zinc-400 py-2"
                onClick={() => setMenuOpen(false)}
              >
                لوحة التحكم
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
