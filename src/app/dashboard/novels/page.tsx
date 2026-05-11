"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBookOpen } from "react-icons/hi"

interface Novel {
  id: string
  title: string
  description: string
  price: number
  coverImage: string
  published: boolean
  createdAt: string
}

export default function NovelsManagement() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)

  const loadNovels = async () => {
    try {
      const res = await fetch("/api/novels")
      if (res.ok) {
        const data = await res.json()
        setNovels(data)
      }
    } catch {
      console.error("فشل تحميل الروايات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNovels()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الرواية؟")) return

    try {
      const res = await fetch(`/api/novels/${id}`, { method: "DELETE" })
      if (res.ok) {
        setNovels((prev) => prev.filter((n) => n.id !== id))
      }
    } catch {
      alert("فشل حذف الرواية")
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">إدارة الروايات</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {novels.length} رواية
          </p>
        </div>
        <Link
          href="/dashboard/novels/new"
          className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-3 rounded-2xl text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
        >
          <HiOutlinePlus className="w-4 h-4" />
          إضافة رواية
        </Link>
      </div>

      {novels.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <HiOutlineBookOpen className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">لا توجد روايات بعد</p>
          <Link
            href="/dashboard/novels/new"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-3 rounded-2xl text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
          >
            <HiOutlinePlus className="w-4 h-4" />
            أضف أول رواية
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {novels.map((novel) => (
            <div
              key={novel.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 animate-fade-in"
            >
              <div className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                {novel.coverImage ? (
                  <img
                    src={novel.coverImage}
                    alt={novel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                    <HiOutlineBookOpen className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{novel.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {novel.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-medium">{formatPrice(novel.price)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    novel.published
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  }`}>
                    {novel.published ? "منشور" : "مسودة"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/novels/${novel.id}`}
                  className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <HiOutlinePencil className="w-4 h-4 text-zinc-500" />
                </Link>
                <button
                  onClick={() => handleDelete(novel.id)}
                  className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
