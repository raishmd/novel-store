"use client"

import { useEffect, useState } from "react"

export function Footer() {
  const [siteName, setSiteName] = useState("متجر الروايات")

  useEffect(() => {
    const stored = localStorage.getItem("siteName")
    if (stored) setSiteName(stored)
  }, [])

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} {siteName}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            موقع لبيع الروايات العربية
          </p>
        </div>
      </div>
    </footer>
  )
}
