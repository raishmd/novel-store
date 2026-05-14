"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { HiOutlineMail, HiOutlineEye, HiOutlineEyeOff, HiOutlineTrash, HiOutlineSearch, HiOutlineInbox, HiOutlineChevronLeft } from "react-icons/hi"

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (filter !== "all") params.set("status", filter)
      const res = await fetch(`/api/contact?${params}`)
      if (res.ok) setMessages(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [filter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchMessages()
  }

  const toggleRead = async (id: string, read: boolean) => {
    await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !read }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: !read } : m))
  }

  const deleteMessage = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return
    await fetch(`/api/contact/${id}`, { method: "DELETE" })
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("ar-SA-u-nu-latn", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">الرسائل</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">إدارة الرسائل الواردة من زوار الموقع</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <HiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث في الرسائل..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
              />
            </form>
            <div className="flex gap-1.5 sm:gap-2">
              {["all", "unread", "read"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === f
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {f === "all" ? "الكل" : f === "unread" ? "غير مقروء" : "مقروء"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <HiOutlineInbox className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">لا توجد رسائل</p>
            <p className="text-sm mt-1">
              {search ? "لا توجد نتائج للبحث" : "لم يصلك أي رسائل بعد"}
            </p>
          </div>
        ) : (
          <div>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-4 p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${!msg.read ? "bg-blue-50/50 dark:bg-blue-900/5" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.read ? "bg-zinc-100 dark:bg-zinc-800" : "bg-blue-100 dark:bg-blue-900/30"
                }`}>
                  <HiOutlineMail className={`w-5 h-5 ${msg.read ? "text-zinc-400" : "text-blue-600 dark:text-blue-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{msg.name}</span>
                    {!msg.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                    <span className="text-[10px] sm:text-xs text-zinc-400 mr-auto shrink-0">{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500 mb-0.5 truncate">{msg.subject}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 truncate">{msg.email}</p>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <Link
                    href={`/dashboard/messages/${msg.id}`}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    <HiOutlineChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>
                  <button
                    onClick={() => toggleRead(msg.id, msg.read)}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    title={msg.read ? "تحديد كغير مقروء" : "تحديد كمقروء"}
                  >
                    {msg.read ? <HiOutlineEyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <HiOutlineEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
                    title="حذف"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
