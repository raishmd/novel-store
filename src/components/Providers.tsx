"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <SessionProvider>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </SessionProvider>
    )
  }

  return <SessionProvider>{children}</SessionProvider>
}
