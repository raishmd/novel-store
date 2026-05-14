"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HiOutlineMail, HiOutlineChevronRight, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff, HiOutlineArrowRight } from "react-icons/hi"

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

export default function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    fetch(`/api/contact/${id}`)
      .then(r => r.json())
      .then(data => {
        setMessage(data)
        if (!data.read) {
          fetch(`/api/contact/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
          setMessage(prev => prev ? { ...prev, read: true } : prev)
        }
      })
      .catch(() => router.push("/dashboard/messages"))
      .finally(() => setLoading(false))
  }, [id, router])

  const toggleRead = async () => {
    if (!message) return
    await fetch(`/api/contact/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !message.read }),
    })
    setMessage(prev => prev ? { ...prev, read: !prev.read } : prev)
  }

  const deleteMessage = async () => {
    if (!message || !confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return
    await fetch(`/api/contact/${message.id}`, { method: "DELETE" })
    router.push("/dashboard/messages")
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("ar-SA-u-nu-latn", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
      </div>
    )
  }

  if (!message) return null

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/messages"
          className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <HiOutlineArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{message.subject}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{formatDate(message.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">الاسم</label>
              <p className="text-sm font-medium">{message.name}</p>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">البريد الإلكتروني</label>
              <a href={`mailto:${message.email}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                {message.email}
              </a>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">الموضوع</label>
              <p className="text-sm font-medium">{message.subject}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2">الرسالة</label>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleRead}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {message.read ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
            {message.read ? "تحديد كغير مقروء" : "تحديد كمقروء"}
          </button>
          <button
            onClick={deleteMessage}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
            حذف
          </button>
        </div>
      </div>
    </div>
  )
}
