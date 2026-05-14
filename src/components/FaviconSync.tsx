"use client"

import { useEffect } from "react"

export function FaviconSync() {
  useEffect(() => {
    const updateFavicon = () => {
      const logoUrl = localStorage.getItem("siteLogo")
      if (!logoUrl) return

      let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"][data-custom]')
      if (!link) {
        link = document.createElement("link")
        link.rel = "icon"
        link.dataset.custom = "true"
        document.head.appendChild(link)
      }
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
    }

    updateFavicon()
  }, [])

  return null
}
