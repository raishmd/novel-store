"use client"

import { useEffect, useState } from "react"
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDark = document.documentElement.classList.contains("dark")
    setDark(isDark)
  }, [])

  const toggle = () => {
    const newDark = !dark
    setDark(newDark)
    if (newDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label={dark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
    >
      {dark ? (
        <HiOutlineSun className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
      ) : (
        <HiOutlineMoon className="w-5 h-5 text-zinc-600" />
      )}
    </button>
  )
}
