"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBookOpen,
  HiOutlineViewGrid, HiOutlineViewList,
} from "react-icons/hi"

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
  const [gridView, setGridView] = useState(false)

  const loadNovels = async () => {
    try {
      const res = await fetch("/api/novels?all=true")
      if (res.ok) {
        const data = await res.json()
        data.sort((a: Novel, b: Novel) => b.createdAt.localeCompare(a.createdAt))
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

  const publishedCount = novels.filter(n => n.published).length
  const draftCount = novels.length - publishedCount

  const NovelCard = ({ novel, compact }: { novel: Novel; compact?: boolean }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 animate-fade-in group">
      <div className={`${compact ? "flex items-center" : ""}`}>
        <div className={`${compact ? "w-20 h-24 shrink-0" : "w-full aspect-[3/2]"} bg-zinc-100 dark:bg-zinc-800 overflow-hidden`}>
          {novel.coverImage ? (
            <img
              src={novel.coverImage}
              alt={novel.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
              <HiOutlineBookOpen className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className={`flex-1 min-w-0 ${compact ? "p-3" : "p-4"}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-base truncate">{novel.title}</h3>
              <p className={`text-zinc-500 dark:text-zinc-400 leading-relaxed ${compact ? "text-xs mt-0.5 line-clamp-1" : "text-sm mt-1 line-clamp-2"}`}>
                {novel.description}
              </p>
            </div>
            <span className={`shrink-0 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${
              novel.published
                ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            }`}>
              {novel.published ? "منشور" : "مسودة"}
            </span>
          </div>
          <div className={`flex items-center justify-between gap-2 ${compact ? "mt-2" : "mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800"}`}>
            <span className="text-sm font-bold">{formatPrice(novel.price)}</span>
            <div className="flex items-center gap-1">
              <Link
                href={`/dashboard/novels/${novel.id}`}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                title="تعديل"
              >
                <HiOutlinePencil className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(novel.id)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
                title="حذف"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">إدارة الروايات</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{novels.length} رواية</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-green-600 dark:text-green-400">{publishedCount} منشور</span>
            {draftCount > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-zinc-500">{draftCount} مسودة</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridView(false)}
            className={`p-2.5 rounded-xl transition-colors ${
              !gridView
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
            title="عرض قائمة"
          >
            <HiOutlineViewList className="w-5 h-5" />
          </button>
          <button
            onClick={() => setGridView(true)}
            className={`p-2.5 rounded-xl transition-colors ${
              gridView
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
            title="عرض شبكي"
          >
            <HiOutlineViewGrid className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />
          <Link
            href="/dashboard/novels/new"
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all whitespace-nowrap"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة رواية</span>
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {novels.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
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
      ) : gridView ? (
        /* Grid view */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {novels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="grid gap-3">
          {novels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} compact />
          ))}
        </div>
      )}
    </div>
  )
}
