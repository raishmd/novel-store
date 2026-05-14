"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HiOutlineSave, HiOutlinePlus, HiOutlineX } from "react-icons/hi"
import {
  FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaLinkedin, FaYoutube, FaLink,
} from "react-icons/fa"

const defaultFields = [
  { key: "contactEmail", label: "البريد الإلكتروني", placeholder: "contact@example.com" },
  { key: "facebook", label: "فيسبوك", placeholder: "https://facebook.com/..." },
  { key: "instagram", label: "إنستغرام", placeholder: "https://instagram.com/..." },
  { key: "twitter", label: "X (تويتر)", placeholder: "https://x.com/..." },
  { key: "tiktok", label: "تيك توك", placeholder: "https://tiktok.com/@..." },
  { key: "linkedin", label: "لينكد إن", placeholder: "https://linkedin.com/in/..." },
  { key: "youtube", label: "يوتيوب", placeholder: "https://youtube.com/..." },
]

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <FaFacebook className="w-4 h-4" />,
  instagram: <FaInstagram className="w-4 h-4" />,
  twitter: <FaTwitter className="w-4 h-4" />,
  tiktok: <FaTiktok className="w-4 h-4" />,
  linkedin: <FaLinkedin className="w-4 h-4" />,
  youtube: <FaYoutube className="w-4 h-4" />,
}

export default function ContactSettingsPage() {
  const router = useRouter()
  const [fields, setFields] = useState(defaultFields.map(f => ({ ...f, value: "" })))
  const [customLinks, setCustomLinks] = useState<{ label: string; url: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        setFields(prev => prev.map(f => ({ ...f, value: data[f.key] || "" })))
        const custom: { label: string; url: string }[] = []
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("custom_") && value) {
            custom.push({ label: key.replace("custom_", ""), url: value as string })
          }
        }
        setCustomLinks(custom)
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    const body: Record<string, string> = {}
    for (const f of fields) body[f.key] = f.value
    for (const c of customLinks) {
      if (c.label && c.url) body[`custom_${c.label}`] = c.url
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  const addCustomLink = () => {
    setCustomLinks(prev => [...prev, { label: "", url: "" }])
  }

  const removeCustomLink = (i: number) => {
    setCustomLinks(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateCustomLink = (i: number, field: "label" | "url", value: string) => {
    setCustomLinks(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">إعدادات التواصل</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">إدارة معلومات التواصل وروابط التواصل الاجتماعي</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiOutlineSave className="w-4 h-4" />
          )}
          {saved ? "تم الحفظ" : "حفظ التغييرات"}
        </button>
      </div>

      <div className="grid gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-5">معلومات التواصل الأساسية</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  {platformIcons[f.key] && (
                    <span className="text-zinc-400">{platformIcons[f.key]}</span>
                  )}
                  {f.label}
                </label>
                <input
                  type="text"
                  value={f.value}
                  onChange={e => setFields(prev => prev.map(p => p.key === f.key ? { ...p, value: e.target.value } : p))}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-bold">روابط مخصصة</h2>
            <button
              onClick={addCustomLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <HiOutlinePlus className="w-4 h-4" />
              إضافة رابط
            </button>
          </div>

          {customLinks.length === 0 ? (
            <p className="text-sm text-zinc-400 py-6 text-center">لا توجد روابط مخصصة. أضف رابطاً جديداً</p>
          ) : (
            <div className="space-y-3">
              {customLinks.map((link, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="hidden sm:flex text-zinc-400 shrink-0">
                    <FaLink className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={link.label}
                    onChange={e => updateCustomLink(i, "label", e.target.value)}
                    placeholder="اسم المنصة"
                    className="w-full sm:flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={e => updateCustomLink(i, "url", e.target.value)}
                    placeholder="https://..."
                    className="w-full sm:flex-[2] px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                  />
                  <button
                    onClick={() => removeCustomLink(i)}
                    className="w-full sm:w-auto p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <HiOutlineX className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
