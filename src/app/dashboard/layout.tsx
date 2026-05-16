"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineShoppingCart,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMail,
  HiOutlineChat,
} from "react-icons/hi"
import { signOut } from "next-auth/react"
import { useSidebar } from "@/components/SidebarContext"

const navItems = [
  { href: "/dashboard", label: "الرئيسية", icon: HiOutlineHome },
  { href: "/dashboard/novels", label: "الروايات", icon: HiOutlineBookOpen },
  { href: "/dashboard/orders", label: "الطلبات", icon: HiOutlineShoppingCart },
  { href: "/dashboard/messages", label: "الرسائل", icon: HiOutlineMail },

  { href: "/dashboard/contact", label: "التواصل", icon: HiOutlineChat },
  { href: "/dashboard/settings", label: "الإعدادات", icon: HiOutlineCog },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { open, setOpen } = useSidebar()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    setOpen(false)
  }, [pathname, setOpen])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  const sidebarContent = (
    <aside className="flex flex-col w-64 h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-auto"
      >
        <HiOutlineLogout className="w-5 h-5" />
        تسجيل الخروج
      </button>
    </aside>
  )

  return (
    <div className="min-h-screen pt-16">
      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 z-50 h-full w-64 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full pt-16">{sidebarContent}</div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block fixed right-0 top-16 w-64 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </div>

      <div className="flex-1 min-w-0 mr-0 md:mr-64 p-4 sm:p-8 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
