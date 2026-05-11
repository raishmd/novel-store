"use client"

import { useEffect, useState } from "react"
import { HiOutlineSave, HiOutlineInformationCircle, HiOutlinePhotograph } from "react-icons/hi"

export default function SettingsPage() {
  const [form, setForm] = useState({
    siteName: "متجر الروايات",
    authorName: "اسم الكاتب",
    authorBio: "",
    logo: "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const siteName = localStorage.getItem("siteName")
    const authorName = localStorage.getItem("authorName")
    const authorBio = localStorage.getItem("authorBio")
    const logo = localStorage.getItem("siteLogo")
    if (siteName) setForm((prev) => ({ ...prev, siteName }))
    if (authorName) setForm((prev) => ({ ...prev, authorName }))
    if (authorBio) setForm((prev) => ({ ...prev, authorBio }))
    if (logo) setForm((prev) => ({ ...prev, logo }))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    localStorage.setItem("siteName", form.siteName)
    localStorage.setItem("authorName", form.authorName)
    localStorage.setItem("authorBio", form.authorBio)
    if (form.logo) localStorage.setItem("siteLogo", form.logo)

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">الإعدادات</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          تخصيص إعدادات الموقع
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <HiOutlineInformationCircle className="w-5 h-5 text-zinc-400" />
            معلومات الموقع
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2">اسم الموقع</label>
            <input
              type="text"
              value={form.siteName}
              onChange={(e) => setForm((prev) => ({ ...prev, siteName: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">اسم الكاتب</label>
            <input
              type="text"
              value={form.authorName}
              onChange={(e) => setForm((prev) => ({ ...prev, authorName: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">نبذة عن الكاتب</label>
            <textarea
              value={form.authorBio}
              onChange={(e) => setForm((prev) => ({ ...prev, authorBio: e.target.value }))}
              rows={4}
              placeholder="اكتب نبذة قصيرة عن الكاتب"
              className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right resize-none"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">شعار الموقع</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center px-4 py-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer transition-colors">
                <div className="text-center">
                  <HiOutlinePhotograph className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {form.logo ? "تغيير الشعار" : "اختر شعار الموقع"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const formData = new FormData()
                    formData.append("file", file)
                    formData.append("type", "images")
                    try {
                      const res = await fetch("/api/upload", { method: "POST", body: formData })
                      if (res.ok) {
                        const data = await res.json()
                        setForm((prev) => ({ ...prev, logo: data.url }))
                      }
                    } catch {}
                  }}
                  className="hidden"
                />
              </label>
              {form.logo && (
                <img src={form.logo} alt="الشعار" className="w-16 h-16 rounded-xl object-cover" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold">المظهر</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">الوضع الليلي</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                تغيير مظهر الموقع بين الفاتح والداكن
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const isDark = document.documentElement.classList.contains("dark")
                if (isDark) {
                  document.documentElement.classList.remove("dark")
                  localStorage.setItem("theme", "light")
                } else {
                  document.documentElement.classList.add("dark")
                  localStorage.setItem("theme", "dark")
                }
              }}
              className="relative w-12 h-6 rounded-full bg-zinc-300 dark:bg-green-500 transition-colors"
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  document.documentElement.classList.contains("dark")
                    ? "translate-x-6"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-3.5 rounded-2xl text-base font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <HiOutlineSave className="w-5 h-5" />
              حفظ الإعدادات
            </>
          )}
        </button>

        {saved && (
          <p className="text-center text-sm text-green-600 dark:text-green-400 animate-fade-in">
            ✅ تم حفظ الإعدادات بنجاح
          </p>
        )}
      </form>
    </div>
  )
}
