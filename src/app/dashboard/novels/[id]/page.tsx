"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { HiOutlineArrowLeft } from "react-icons/hi"

interface Novel {
  id: string
  title: string
  description: string
  price: number
  coverImage: string
  fileUrl: string
  published: boolean
}

export default function EditNovel() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    coverImage: "",
    fileUrl: "",
    published: true,
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [coverPreview, setCoverPreview] = useState("")

  useEffect(() => {
    async function loadNovel() {
      try {
        const res = await fetch(`/api/novels/${params.id}`)
        if (res.ok) {
          const data: Novel = await res.json()
          setForm({
            title: data.title,
            description: data.description,
            price: data.price.toString(),
            coverImage: data.coverImage,
            fileUrl: data.fileUrl,
            published: data.published,
          })
          setCoverPreview(data.coverImage)
        }
      } catch {
        alert("فشل تحميل الرواية")
      } finally {
        setLoading(false)
      }
    }
    loadNovel()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/novels/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        router.push("/dashboard/novels")
      } else {
        const data = await res.json()
        alert(data.error || "فشل تحديث الرواية")
      }
    } catch {
      alert("فشل تحديث الرواية")
    } finally {
      setSaving(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", "images")

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm((prev) => ({ ...prev, coverImage: data.url }))
        setCoverPreview(data.url)
      } else {
        alert("فشل رفع الصورة")
      }
    } catch {
      alert("فشل رفع الصورة")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", "files")

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm((prev) => ({ ...prev, fileUrl: data.url }))
      } else {
        alert("فشل رفع الملف")
      }
    } catch {
      alert("فشل رفع الملف")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          رجوع
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold">تعديل الرواية</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">عنوان الرواية</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
            className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right"
            dir="rtl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">وصف الرواية</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            required
            rows={5}
            className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right resize-none"
            dir="rtl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">السعر (بالدولار)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            required
            className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right"
            dir="rtl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">صورة الغلاف</label>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center px-4 py-8 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer transition-colors">
              <div className="text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">تغيير الصورة</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">PNG, JPG (حد أقصى 5MB)</p>
              </div>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
            {coverPreview && (
              <img src={coverPreview} alt="معاينة" className="w-20 h-24 rounded-xl object-cover" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">ملف الرواية (PDF)</label>
          <label className="flex items-center justify-center px-4 py-8 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer transition-colors">
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {form.fileUrl ? "✅ تم رفع الملف" : "اختر ملف الرواية (PDF)"}
              </p>
            </div>
            <input type="file" accept=".pdf,.epub" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">نشر الرواية</label>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, published: !prev.published }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              form.published ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-600"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.published ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-3.5 rounded-2xl text-base font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            "حفظ التغييرات"
          )}
        </button>
      </form>
    </div>
  )
}
