"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  HiOutlineSave, HiOutlinePhotograph, HiOutlineBookOpen,
} from "react-icons/hi"
import {
  FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaLinkedin, FaYoutube,
} from "react-icons/fa"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface Novel {
  id: string
  title: string
  description: string
  coverImage: string
  sortOrder: number
}

const socialFields = [
  { key: "facebook", label: "فيسبوك", icon: FaFacebook },
  { key: "instagram", label: "إنستغرام", icon: FaInstagram },
  { key: "twitter", label: "X (تويتر)", icon: FaTwitter },
  { key: "tiktok", label: "تيك توك", icon: FaTiktok },
  { key: "linkedin", label: "لينكد إن", icon: FaLinkedin },
  { key: "youtube", label: "يوتيوب", icon: FaYoutube },
]

export default function AuthorSettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [authorName, setAuthorName] = useState("")
  const [authorRole, setAuthorRole] = useState("")
  const [authorBio, setAuthorBio] = useState("")
  const [authorImage, setAuthorImage] = useState("")
  const [contactEmail, setContactEmail] = useState("")

  const [social, setSocial] = useState<Record<string, string>>({})
  const [novels, setNovels] = useState<Novel[]>([])
  const [loadingNovels, setLoadingNovels] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [settingsRes, novelsRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/novels?all=true"),
      ])

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setAuthorName(data.authorName || "")
        setAuthorRole(data.authorRole || "كاتب وروائي")
        setAuthorBio(data.authorBio || "")
        setAuthorImage(data.authorImage || "")
        setContactEmail(data.contactEmail || "")
        const s: Record<string, string> = {}
        for (const f of socialFields) s[f.key] = data[f.key] || ""
        for (const [key, val] of Object.entries(data)) {
          if (key.startsWith("custom_") && val) s[key] = val as string
        }
        setSocial(s)
      }

      if (novelsRes.ok) {
        const data = await novelsRes.json()
        data.sort((a: Novel, b: Novel) => a.sortOrder - b.sortOrder)
        setNovels(data)
      }
    } catch {
      // ignore
    } finally {
      setLoadingNovels(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const { url } = await res.json()
        setAuthorImage(url)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    const body: Record<string, string> = {
      authorName,
      authorRole,
      authorBio,
      authorImage,
      contactEmail,
      ...social,
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return
    const items = Array.from(novels)
    const [moved] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, moved)
    setNovels(items)

    await fetch("/api/novels/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(n => n.id) }),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">إعدادات الكاتب</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">إدارة معلومات الكاتب وصفحة "عن الكاتب"</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
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
        {/* Author Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold mb-5">معلومات الكاتب</h2>
          <div className="grid gap-5">
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  {authorImage ? (
                    <img src={authorImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                      <HiOutlinePhotograph className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <label className="block mt-2 text-center">
                  <span className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                    {uploading ? "جاري الرفع..." : "تغيير الصورة"}
                  </span>
                  <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
                </label>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">اسم الكاتب</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={e => setAuthorName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                      placeholder="أحمد الراشد"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">اللقب/الدور</label>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={e => setAuthorRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                      placeholder="كاتب وروائي"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">السيرة الذاتية</label>
                  <textarea
                    rows={8}
                    value={authorBio}
                    onChange={e => setAuthorBio(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm resize-y"
                    placeholder="اكتب السيرة الذاتية للكاتب هنا..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Books */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">الروايات</h2>
            <Link
              href="/dashboard/novels"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              إدارة الروايات
            </Link>
          </div>

          {loadingNovels ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
            </div>
          ) : novels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <HiOutlineBookOpen className="w-12 h-12 mb-3" />
              <p className="text-sm">لا توجد روايات بعد</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-400 mb-4">اسحب وأفلت لترتيب ظهور الروايات في صفحة "عن الكاتب"</p>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="novels">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                      {novels.map((novel, index) => (
                        <Draggable key={novel.id} draggableId={novel.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                                snapshot.isDragging
                                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800 shadow-lg"
                                  : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                              }`}
                            >
                              <div className="w-10 h-14 rounded-lg bg-zinc-200 dark:bg-zinc-700 overflow-hidden shrink-0">
                                {novel.coverImage ? (
                                  <img src={novel.coverImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                    <HiOutlineBookOpen className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{novel.title}</p>
                                <p className="text-xs text-zinc-400 truncate">{novel.description}</p>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold mb-5">معلومات التواصل</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">البريد الإلكتروني</label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                placeholder="author@example.com"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {socialFields.map(f => {
                const Icon = f.icon
                return (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-zinc-400" />
                      {f.label}
                    </label>
                    <input
                      type="text"
                      value={social[f.key] || ""}
                      onChange={e => setSocial(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                      placeholder={`رابط ${f.label}`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
