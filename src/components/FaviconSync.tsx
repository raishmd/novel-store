"use client"

import { useEffect } from "react"

export function FaviconSync() {
  useEffect(() => {
    const updateFavicon = () => {
      const logoUrl = localStorage.getItem("siteLogo")
      if (!logoUrl) return

      const link = document.createElement("link")
      link.rel = "icon"
      link.href = `${logoUrl}?v=${Date.now()}`

      const ext = logoUrl.split(".").pop()?.toLowerCase()
      const mimeMap: Record<string, string> = {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
        svg: "image/svg+xml",
        ico: "image/x-icon",
      }
      if (ext && mimeMap[ext]) link.type = mimeMap[ext]

      document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((el) => el.remove())
      document.head.appendChild(link)
    }

    updateFavicon()

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") updateFavicon()
    })
  }, [])

  return null
}
