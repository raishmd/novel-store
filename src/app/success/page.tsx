"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { HiOutlineCheckCircle, HiOutlineArrowLeft } from "react-icons/hi"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const novelId = searchParams.get("novel_id")

  useEffect(() => {
    if (novelId) {
      const purchased = JSON.parse(localStorage.getItem("purchased") || "[]")
      if (!purchased.includes(novelId)) {
        purchased.push(novelId)
        localStorage.setItem("purchased", JSON.stringify(purchased))
      }
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(novelId ? `/novels/${novelId}` : "/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [novelId, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <HiOutlineCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">تم الدفع بنجاح!</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
          شكراً لشرائك. يمكنك الآن تحميل الرواية والاستمتاع بقراءتها.
        </p>
        <button
          onClick={() => router.push(novelId ? `/novels/${novelId}` : "/")}
          className="inline-flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-3.5 rounded-2xl text-base font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          العودة إلى الرواية
        </button>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-4">
          سيتم توجيهك تلقائياً خلال {countdown} ثوانٍ
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
