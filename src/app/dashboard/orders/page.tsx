"use client"

import { useState, useEffect, useCallback } from "react"
import { formatPrice, formatDate } from "@/lib/utils"
import {
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlineExclamation,
} from "react-icons/hi"

interface Order {
  id: string
  email: string
  amount: number
  status: string
  createdAt: string
  novel: { id: string; title: string }
}

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  completed: "مكتمل",
  cancelled: "ملغي",
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  completed: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  cancelled: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders")
      if (res.ok) setOrders(await res.json())
    } catch {
      console.error("فشل تحميل الطلبات")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const filtered = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        o.novel.title.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      )
    }
    return true
  })

  const allFilteredSelected = filtered.length > 0 && filtered.every(o => selected.has(o.id))

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(o => next.delete(o.id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(o => next.add(o.id))
        return next
      })
    }
  }

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    }
  }

  const bulkUpdateStatus = async (status: string) => {
    await Promise.all(
      Array.from(selected).map(id =>
        fetch(`/api/orders/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        })
      )
    )
    setOrders(prev => prev.map(o => selected.has(o.id) ? { ...o, status } : o))
    setSelected(new Set())
  }

  const deleteOrder = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/orders/${deleteId}`, { method: "DELETE" })
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== deleteId))
        setSelected(prev => { const n = new Set(prev); n.delete(deleteId); return n })
      }
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const bulkDelete = async () => {
    setBulkDeleting(true)
    try {
      await Promise.all(
        Array.from(selected).map(id => fetch(`/api/orders/${id}`, { method: "DELETE" }))
      )
      setOrders(prev => prev.filter(o => !selected.has(o.id)))
      setSelected(new Set())
    } finally {
      setBulkDeleting(false)
      setBulkDeleteOpen(false)
    }
  }

  const completedOrders = orders.filter(o => o.status === "completed")
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">الطلبات</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          {orders.length} طلب، {completedOrders.length} مكتمل، إجمالي {formatPrice(totalRevenue)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالرواية أو البريد الإلكتروني..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
        >
          <option value="">جميع الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <span className="text-sm text-zinc-500 ml-auto">{selected.size} طلب محدد</span>
          <button
            onClick={() => bulkUpdateStatus("completed")}
            className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          >
            تعيين مكتمل
          </button>
          <button
            onClick={() => bulkUpdateStatus("pending")}
            className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
          >
            تعيين قيد الانتظار
          </button>
          <button
            onClick={() => setBulkDeleteOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            حذف المحدد
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <HiOutlineShoppingCart className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">
            {orders.length === 0 ? "لا توجد طلبات بعد" : "لا توجد نتائج للبحث"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                    />
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">الرواية</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">البريد الإلكتروني</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">المبلغ</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">الحالة</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">التاريخ</th>
                  <th className="text-center p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${selected.has(order.id) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-medium">{order.novel.title}</td>
                    <td className="p-4 text-sm text-zinc-500">{order.email}</td>
                    <td className="p-4 font-medium">{formatPrice(order.amount)}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[order.status] || statusColors.pending}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-500">{formatDate(new Date(order.createdAt))}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        {order.status === "pending" && (
                          <button
                            onClick={() => updateStatus(order.id, "completed")}
                            className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-zinc-400 hover:text-green-500 transition-colors"
                            title="تأكيد الإتمام"
                          >
                            <HiOutlineCheck className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === "completed" && (
                          <button
                            onClick={() => updateStatus(order.id, "pending")}
                            className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-zinc-400 hover:text-amber-500 transition-colors"
                            title="إعادة للانتظار"
                          >
                            <HiOutlineClock className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(order.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
                          title="حذف"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Single delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !deleting && setDeleteId(null)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-sm w-full shadow-xl animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <HiOutlineExclamation className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">حذف الطلب</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">هل أنت متأكد من حذف هذا الطلب؟</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={deleteOrder}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete modal */}
      {bulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !bulkDeleting && setBulkDeleteOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-sm w-full shadow-xl animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <HiOutlineExclamation className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">حذف الطلبات المحددة</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">
              هل أنت متأكد من حذف {selected.size} طلب؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBulkDeleteOpen(false)}
                disabled={bulkDeleting}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={bulkDelete}
                disabled={bulkDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bulkDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : "حذف الكل"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
