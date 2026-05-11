"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { formatPrice, formatDate } from "@/lib/utils"
import { loadStripe } from "@stripe/stripe-js"
import { HiOutlineArrowRight, HiOutlineDownload, HiOutlineCheckCircle } from "react-icons/hi"

interface Novel {
  id: string
  title: string
  description: string
  price: number
  coverImage: string
  fileUrl: string
  createdAt: string
}

export default function NovelDetail() {
  const params = useParams()
  const [novel, setNovel] = useState<Novel | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [email, setEmail] = useState("")
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadNovel() {
      try {
        const res = await fetch(`/api/novels/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setNovel(data)
        }
      } catch {
        setError("فشل تحميل الرواية")
      } finally {
        setLoading(false)
      }
    }
    loadNovel()

    const purchasedIds = JSON.parse(localStorage.getItem("purchased") || "[]")
    if (purchasedIds.includes(params.id)) {
      setPurchased(true)
    }
  }, [params.id])

  const handlePurchase = async () => {
    if (!novel || !email) return
    setPurchasing(true)
    setError("")

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId: novel.id, email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "فشل الدفع")
      }

      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء الدفع")
    } finally {
      setPurchasing(false)
    }
  }

  const handleDownload = () => {
    if (novel?.fileUrl) {
      const a = document.createElement("a")
      a.href = novel.fileUrl
      a.download = novel.fileUrl.split("/").pop() || "رواية"
      a.click()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-zinc-500">الرواية غير موجودة</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="animate-fade-in">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
              {novel.coverImage ? (
                <img
                  src={novel.coverImage}
                  alt={novel.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="animate-fade-in animate-delay-1">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              {novel.title}
            </h1>

            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 text-base sm:text-lg">
              {novel.description}
            </p>

            <div className="text-sm text-zinc-400 dark:text-zinc-500 mb-8">
              تاريخ النشر: {formatDate(new Date(novel.createdAt))}
            </div>

            <div className="text-3xl font-bold mb-8">
              {formatPrice(novel.price)}
            </div>

            {purchased ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl">
                  <HiOutlineCheckCircle className="w-5 h-5" />
                  <span className="font-medium">تم الشراء بنجاح</span>
                </div>
                {novel.fileUrl && (
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-4 rounded-2xl text-base font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <HiOutlineDownload className="w-5 h-5" />
                    تحميل الرواية
                  </button>
                )}
              </div>
            ) : showEmailForm ? (
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right"
                  dir="rtl"
                />
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !email}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-4 rounded-2xl text-base font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? (
                    <div className="w-5 h-5 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <HiOutlineArrowRight className="w-5 h-5" />
                      اشترِ الآن
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-4 rounded-2xl text-base font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <HiOutlineArrowRight className="w-5 h-5" />
                اشترِ الآن
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
