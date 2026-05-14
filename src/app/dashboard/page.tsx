"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { HiOutlineBookOpen, HiOutlineShoppingCart, HiOutlineCurrencyDollar, HiOutlineArrowLeft } from "react-icons/hi"

export default function DashboardHome() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({ novels: 0, orders: 0, revenue: 0 })

  useEffect(() => {
    async function loadStats() {
      try {
        const [novelsRes, ordersRes] = await Promise.all([
          fetch("/api/novels"),
          fetch("/api/orders"),
        ])

        if (novelsRes.ok) {
          const novels = await novelsRes.json()
          setStats((prev) => ({ ...prev, novels: novels.length }))
        }

        if (ordersRes.ok) {
          const orders = await ordersRes.json()
          const revenue = orders.reduce((sum: number, o: { amount: number }) => sum + o.amount, 0)
          setStats((prev) => ({ ...prev, orders: orders.length, revenue }))
        }
      } catch {
        // stats will show 0
      }
    }
    loadStats()
  }, [])

  const statCards = [
    {
      label: "الروايات",
      value: stats.novels,
      icon: HiOutlineBookOpen,
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    },
    {
      label: "الطلبات",
      value: stats.orders,
      icon: HiOutlineShoppingCart,
      color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    },
    {
      label: "الإيرادات",
      value: `$${stats.revenue.toFixed(2)}`,
      icon: HiOutlineCurrencyDollar,
      color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          مرحباً، {session?.user?.name || "المدير"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          لوحة التحكم الخاصة بمتجر الروايات
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 animate-fade-in"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold mb-1">{card.value}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">إجراءات سريعة</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/dashboard/novels/new"
            className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <span className="font-medium">إضافة رواية جديدة</span>
            <HiOutlineArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <Link
            href="/dashboard/novels"
            className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <span className="font-medium">إدارة الروايات</span>
            <HiOutlineArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <Link
            href="/dashboard/messages"
            className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <span className="font-medium">عرض الرسائل</span>
            <HiOutlineArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <Link
            href="/dashboard/contact"
            className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <span className="font-medium">إعدادات التواصل</span>
            <HiOutlineArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <span className="font-medium">إعدادات الموقع</span>
            <HiOutlineArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <span className="font-medium">عرض الموقع</span>
            <HiOutlineArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
        </div>
      </div>
    </div>
  )
}
