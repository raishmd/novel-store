"use client"

import { useEffect, useState } from "react"
import { formatPrice, formatDate } from "@/lib/utils"
import { HiOutlineShoppingCart } from "react-icons/hi"

interface Order {
  id: string
  email: string
  amount: number
  status: string
  createdAt: string
  novel: {
    id: string
    title: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders")
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
          localStorage.setItem("dashboardOrders", JSON.stringify(data))
        }
      } catch {
        console.error("فشل تحميل الطلبات")
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
      </div>
    )
  }

  const completedOrders = orders.filter((o) => o.status === "completed")
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">الطلبات</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          {orders.length} طلب، {completedOrders.length} مكتمل، إجمالي {formatPrice(totalRevenue)}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <HiOutlineShoppingCart className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-right p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">الرواية</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">البريد الإلكتروني</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">المبلغ</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">الحالة</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="p-4 font-medium">{order.novel.title}</td>
                    <td className="p-4 text-sm text-zinc-500">{order.email}</td>
                    <td className="p-4 font-medium">{formatPrice(order.amount)}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        order.status === "completed"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                          : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                      }`}>
                        {order.status === "completed" ? "مكتمل" : "قيد الانتظار"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-500">{formatDate(new Date(order.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
