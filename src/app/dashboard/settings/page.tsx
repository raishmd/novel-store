"use client"

import { useEffect, useRef, useState } from "react"
import { getSession } from "next-auth/react"
import type { Session } from "next-auth"
import {
  HiOutlineSave, HiOutlineInformationCircle, HiOutlinePhotograph,
  HiOutlineLockClosed, HiOutlineMail, HiOutlineKey, HiOutlineEye, HiOutlineEyeOff,
} from "react-icons/hi"

export default function SettingsPage() {
  const [session, setSession] = useState<Session | null>(null)

  const [form, setForm] = useState({
    siteName: "متجر الروايات",
    authorName: "اسم الكاتب",
    authorRole: "",
    authorBio: "",
    authorImage: "",
    logo: "",
  })
  const [smtpForm, setSmtpForm] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpSecure: "false",
    smtpUser: "",
    smtpPass: "",
    smtpFrom: "",
  })
  const [cloudinaryForm, setCloudinaryForm] = useState({
    cloudinaryCloudName: "",
    cloudinaryApiKey: "",
    cloudinaryApiSecret: "",
  })
  const [databaseUrl, setDatabaseUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [accountForm, setAccountForm] = useState({
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState(false)
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountSaved, setAccountSaved] = useState(false)
  const [accountError, setAccountError] = useState("")
  const [smtpTesting, setSmtpTesting] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    getSession().then(setSession)
    fetch("/api/settings").then(r => r.json()).then(data => {
      if (data.siteName) setForm(prev => ({ ...prev, siteName: data.siteName }))
      if (data.authorName) setForm(prev => ({ ...prev, authorName: data.authorName }))
      if (data.authorRole) setForm(prev => ({ ...prev, authorRole: data.authorRole }))
      if (data.authorBio) setForm(prev => ({ ...prev, authorBio: data.authorBio }))
      if (data.authorImage) setForm(prev => ({ ...prev, authorImage: data.authorImage }))
      setSmtpForm(prev => ({
        smtpHost: data.smtpHost || "",
        smtpPort: data.smtpPort || "587",
        smtpSecure: data.smtpSecure || "false",
        smtpUser: data.smtpUser || "",
        smtpPass: "",
        smtpFrom: data.smtpFrom || "",
      }))
      setCloudinaryForm(prev => ({
        cloudinaryCloudName: data.cloudinaryCloudName || "",
        cloudinaryApiKey: data.cloudinaryApiKey || "",
        cloudinaryApiSecret: "",
      }))
      if (data.databaseUrl) setDatabaseUrl(data.databaseUrl)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (initialized.current || !session?.user?.email) return
    initialized.current = true
    if (form.siteName) localStorage.setItem("siteName", form.siteName)
    const savedEmail = localStorage.getItem("adminEmail")
    if (savedEmail) {
      setAccountForm(prev => ({ ...prev, newEmail: savedEmail }))
    } else if (session?.user?.email) {
      setAccountForm(prev => ({ ...prev, newEmail: session.user.email }))
    }
  }, [session])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    localStorage.setItem("siteName", form.siteName)

    try {
      const smtpBody: Record<string, string> = {}
      if (smtpForm.smtpHost) smtpBody.smtpHost = smtpForm.smtpHost
      if (smtpForm.smtpPort) smtpBody.smtpPort = smtpForm.smtpPort
      if (smtpForm.smtpSecure) smtpBody.smtpSecure = smtpForm.smtpSecure
      if (smtpForm.smtpUser) smtpBody.smtpUser = smtpForm.smtpUser
      if (smtpForm.smtpPass) smtpBody.smtpPass = smtpForm.smtpPass
      if (smtpForm.smtpFrom) smtpBody.smtpFrom = smtpForm.smtpFrom

      const cloudinaryBody: Record<string, string> = {}
      if (cloudinaryForm.cloudinaryCloudName) cloudinaryBody.cloudinaryCloudName = cloudinaryForm.cloudinaryCloudName
      if (cloudinaryForm.cloudinaryApiKey) cloudinaryBody.cloudinaryApiKey = cloudinaryForm.cloudinaryApiKey
      if (cloudinaryForm.cloudinaryApiSecret) cloudinaryBody.cloudinaryApiSecret = cloudinaryForm.cloudinaryApiSecret

      const dbBody: Record<string, string> = {}
      if (databaseUrl) dbBody.databaseUrl = databaseUrl

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: form.siteName,
          authorName: form.authorName,
          authorRole: form.authorRole,
          authorBio: form.authorBio,
          authorImage: form.authorImage,
          ...smtpBody,
          ...cloudinaryBody,
          ...dbBody,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // fallback
    } finally {
      setSaving(false)
    }
  }

  const handleTestSmtp = async () => {
    setSmtpTesting(true)
    setSmtpTestResult(null)
    try {
      const res = await fetch("/api/auth/test-smtp", { method: "POST" })
      const data = await res.json()
      setSmtpTestResult({ success: data.success, message: data.success ? "✅ تم الاتصال بنجاح" : `❌ ${data.error}` })
    } catch {
      setSmtpTestResult({ success: false, message: "❌ فشل الاتصال بالخادم" })
    } finally {
      setSmtpTesting(false)
    }
  }

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccountError("")
    setAccountSaved(false)

    if (!accountForm.currentPassword) {
      setAccountError("كلمة المرور الحالية مطلوبة")
      return
    }

    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      setAccountError("كلمة المرور الجديدة غير متطابقة")
      return
    }

    if (accountForm.newPassword && accountForm.newPassword.length < 6) {
      setAccountError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return
    }

    setAccountSaving(true)
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: accountForm.currentPassword,
          newEmail: accountForm.newEmail,
          newPassword: accountForm.newPassword || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem("adminEmail", accountForm.newEmail)
      setAccountSaved(true)
      setAccountForm(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
      setTimeout(() => setAccountSaved(false), 3000)
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : "فشل تحديث البيانات")
    } finally {
      setAccountSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">الإعدادات</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          تخصيص إعدادات الموقع
        </p>
      </div>

      <form id="site-settings-form" onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <HiOutlineInformationCircle className="w-5 h-5 text-zinc-400" />
            معلومات الموقع
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2">اسم الموقع</label>
            <input
              type="text"
              value={form.siteName}
              onChange={(e) => setForm((prev) => ({ ...prev, siteName: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">اسم الكاتب</label>
            <input
              type="text"
              value={form.authorName}
              onChange={(e) => setForm((prev) => ({ ...prev, authorName: e.target.value }))}
              className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">لقب الكاتب</label>
            <input
              type="text"
              value={form.authorRole}
              onChange={(e) => setForm((prev) => ({ ...prev, authorRole: e.target.value }))}
              placeholder="كاتب وروائي"
              className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">نبذة عن الكاتب</label>
            <textarea
              value={form.authorBio}
              onChange={(e) => setForm((prev) => ({ ...prev, authorBio: e.target.value }))}
              rows={4}
              placeholder="اكتب نبذة قصيرة عن الكاتب"
              className="w-full px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-right resize-none"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">صورة الكاتب</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center px-4 py-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer transition-colors">
                <div className="text-center">
                  <HiOutlinePhotograph className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {form.authorImage ? "تغيير الصورة" : "اختر صورة الكاتب"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const formData = new FormData()
                    formData.append("file", file)
                    formData.append("type", "images")
                    try {
                      const res = await fetch("/api/upload", { method: "POST", body: formData })
                      if (res.ok) {
                        const data = await res.json()
                        setForm((prev) => ({ ...prev, authorImage: data.url }))
                      }
                    } catch {}
                  }}
                  className="hidden"
                />
              </label>
              {form.authorImage && (
                <img src={form.authorImage} alt="صورة الكاتب" className="w-16 h-16 rounded-xl object-cover" />
              )}
            </div>
          </div>
        </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold">المظهر</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">الوضع الليلي</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  تغيير مظهر الموقع بين الفاتح والداكن
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const isDark = document.documentElement.classList.contains("dark")
                  if (isDark) {
                    document.documentElement.classList.remove("dark")
                    localStorage.setItem("theme", "light")
                  } else {
                    document.documentElement.classList.add("dark")
                    localStorage.setItem("theme", "dark")
                  }
                }}
                className="relative w-12 h-6 rounded-full bg-zinc-300 dark:bg-green-500 transition-colors"
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    document.documentElement.classList.contains("dark")
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </form>

        {/* Account */}
        <div className="mt-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <HiOutlineLockClosed className="w-5 h-5 text-zinc-400" />
            بيانات الدخول
          </h2>
          <form onSubmit={handleAccountSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <HiOutlineMail className="w-4 h-4 text-zinc-400" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={accountForm.newEmail}
                onChange={e => setAccountForm(prev => ({ ...prev, newEmail: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                dir="ltr"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <HiOutlineKey className="w-4 h-4 text-zinc-400" />
                كلمة المرور الحالية
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={accountForm.currentPassword}
                onChange={e => setAccountForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                dir="ltr"
                placeholder="أدخل كلمة المرور الحالية"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={accountForm.newPassword}
                  onChange={e => setAccountForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                  dir="ltr"
                  placeholder="اتركه فارغاً إن لم ترد التغيير"
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={accountForm.confirmPassword}
                  onChange={e => setAccountForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                  dir="ltr"
                  placeholder="أعد كتابة كلمة المرور الجديدة"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                {showPasswords ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                {showPasswords ? "إخفاء كلمات المرور" : "إظهار كلمات المرور"}
              </button>
            </div>

            {accountError && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                {accountError}
              </p>
            )}

            {accountSaved && (
              <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 animate-fade-in">
                ✅ تم تحديث بيانات الدخول بنجاح
              </p>
            )}

            <button
              type="submit"
              disabled={accountSaving}
              className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-3 rounded-2xl text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {accountSaving ? (
                <div className="w-5 h-5 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlineSave className="w-5 h-5" />
                  تحديث بيانات الدخول
                </>
              )}
            </button>
          </form>
        </div>

        {/* Database */}
        <div className="mt-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <HiOutlineKey className="w-5 h-5 text-zinc-400" />
            قاعدة البيانات (Neon)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">رابط قاعدة البيانات (DATABASE_URL)</label>
              <input
                type="password"
                value={databaseUrl}
                onChange={e => setDatabaseUrl(e.target.value)}
                placeholder="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/db"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr text-xs"
                dir="ltr"
              />
            </div>
            <p className="text-xs text-zinc-400">
              ملاحظة: هذا الرابط يُخزن في قاعدة البيانات للتوثيق فقط. للاتصال الفعلي يجب تعيينه في متغيرات البيئة على Vercel (Settings → Environment Variables → DATABASE_URL).
            </p>
          </div>
        </div>

        {/* Cloudinary */}
        <div className="mt-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <HiOutlinePhotograph className="w-5 h-5 text-zinc-400" />
            إعدادات رفع الصور (Cloudinary)
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Cloud Name</label>
              <input
                type="text"
                value={cloudinaryForm.cloudinaryCloudName}
                onChange={e => setCloudinaryForm(prev => ({ ...prev, cloudinaryCloudName: e.target.value }))}
                placeholder="your-cloud-name"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="text"
                value={cloudinaryForm.cloudinaryApiKey}
                onChange={e => setCloudinaryForm(prev => ({ ...prev, cloudinaryApiKey: e.target.value }))}
                placeholder="123456789012345"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">API Secret</label>
              <input
                type="password"
                value={cloudinaryForm.cloudinaryApiSecret}
                onChange={e => setCloudinaryForm(prev => ({ ...prev, cloudinaryApiSecret: e.target.value }))}
                placeholder="اتركه فارغاً إن لم ترد التغيير"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* SMTP */}
        <div className="mt-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <HiOutlineMail className="w-5 h-5 text-zinc-400" />
            إعدادات البريد الإلكتروني (SMTP)
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">خادم SMTP</label>
              <input
                type="text"
                value={smtpForm.smtpHost}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtpHost: e.target.value }))}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">المنفذ</label>
                <input
                  type="text"
                  value={smtpForm.smtpPort}
                  onChange={e => setSmtpForm(prev => ({ ...prev, smtpPort: e.target.value }))}
                  placeholder="587"
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">اتصال آمن</label>
                <select
                  value={smtpForm.smtpSecure}
                  onChange={e => setSmtpForm(prev => ({ ...prev, smtpSecure: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                >
                  <option value="false">لا (587)</option>
                  <option value="true">نعم (465)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="text"
                value={smtpForm.smtpUser}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtpUser: e.target.value }))}
                placeholder="lamis@mozej.com"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">كلمة مرور SMTP</label>
              <input
                type="password"
                value={smtpForm.smtpPass}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtpPass: e.target.value }))}
                placeholder="اتركه فارغاً إن لم ترد التغيير"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">اسم المرسل</label>
              <input
                type="text"
                value={smtpForm.smtpFrom}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtpFrom: e.target.value }))}
                placeholder='"متجر الروايات" <lamis@mozej.com>'
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors text-left dir-ltr"
                dir="ltr"
              />
            </div>

            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={smtpTesting}
              className="w-full py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {smtpTesting ? (
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                "اختبار الاتصال"
              )}
            </button>

            {smtpTestResult && (
              <p className={`text-sm text-center ${smtpTestResult.success ? "text-green-500" : "text-red-500"}`}>
                {smtpTestResult.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          form="site-settings-form"
          disabled={saving}
          className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 py-3.5 rounded-2xl text-base font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <HiOutlineSave className="w-5 h-5" />
              حفظ الإعدادات
            </>
          )}
        </button>

        {saved && (
          <p className="text-center text-sm text-green-600 dark:text-green-400 animate-fade-in mt-4">
            ✅ تم حفظ الإعدادات بنجاح
          </p>
        )}
    </div>
  )
}
