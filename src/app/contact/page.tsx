"use client"

import { useState, useEffect } from "react"
import { HiOutlineMail } from "react-icons/hi"
import {
  FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaLinkedin, FaYoutube,
} from "react-icons/fa"
import { HiOutlineCheckCircle } from "react-icons/hi"

const socialIcons: Record<string, React.ReactNode> = {
  facebook: <FaFacebook className="w-5 h-5" />,
  instagram: <FaInstagram className="w-5 h-5" />,
  twitter: <FaTwitter className="w-5 h-5" />,
  tiktok: <FaTiktok className="w-5 h-5" />,
  linkedin: <FaLinkedin className="w-5 h-5" />,
  youtube: <FaYoutube className="w-5 h-5" />,
}

const socialColors: Record<string, string> = {
  facebook: "hover:bg-[#1877F2] hover:text-white",
  instagram: "hover:bg-[#E4405F] hover:text-white",
  twitter: "hover:bg-[#000000] hover:text-white",
  tiktok: "hover:bg-[#000000] hover:text-white",
  linkedin: "hover:bg-[#0A66C2] hover:text-white",
  youtube: "hover:bg-[#FF0000] hover:text-white",
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", honeypot: "" })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: "" })
  const [captchaError, setCaptchaError] = useState(false)

  useEffect(() => {
    generateCaptcha()
    fetch("/api/settings").then(r => r.json()).then(setSettings).catch(() => {})
  }, [])

  function generateCaptcha() {
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1,
      answer: "",
    })
    setCaptchaError(false)
  }

  const socialKeys = ["facebook", "instagram", "twitter", "tiktok", "linkedin", "youtube"]
  const socialLinks = Object.entries(settings)
    .filter(([key]) => socialKeys.includes(key) || key.startsWith("custom_"))
    .filter(([, value]) => value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCaptchaError(false)

    if (Number(captcha.answer) !== captcha.num1 + captcha.num2) {
      setCaptchaError(true)
      generateCaptcha()
      return
    }

    setSending(true)
    setSuccess(false)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaAnswer: Number(captcha.answer), captchaNum1: captcha.num1, captchaNum2: captcha.num2 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      setForm({ name: "", email: "", subject: "", message: "", honeypot: "" })
      generateCaptcha()
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إرسال الرسالة")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4">اتصل بنا</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
            تواصل معنا لأي استفسار أو اقتراح. نحن هنا لمساعدتك
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 sm:gap-8">
          <div className="md:col-span-3 animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6">أرسل لنا رسالة</h2>

              {success && (
                <div className="mb-5 sm:mb-6 flex items-center gap-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm animate-fade-in">
                  <HiOutlineCheckCircle className="w-5 h-5 shrink-0" />
                  تم إرسال رسالتك بنجاح. سنتواصل معك قريباً
                </div>
              )}

              {error && (
                <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="opacity-0 h-0 overflow-hidden" aria-hidden="true">
                  <input tabIndex={-1} name="honeypot" value={form.honeypot} onChange={e => setForm(p => ({ ...p, honeypot: e.target.value }))} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-zinc-700 dark:text-zinc-300">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-zinc-700 dark:text-zinc-300">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                      placeholder="أدخل بريدك"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-zinc-700 dark:text-zinc-300">
                    الموضوع
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                    placeholder="موضوع الرسالة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-zinc-700 dark:text-zinc-300">
                    الرسالة
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 sm:p-4 border border-zinc-200 dark:border-zinc-700">
                  <label className="block text-sm font-medium mb-2 sm:mb-3 text-zinc-700 dark:text-zinc-300">
                    التحقق الأمني
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 font-bold text-base sm:text-lg select-none shrink-0" dir="ltr">
                      <span>{captcha.num1}</span>
                      <span className="text-zinc-400">+</span>
                      <span>{captcha.num2}</span>
                      <span className="text-zinc-400">=</span>
                      <span className="text-blue-600 dark:text-blue-400">?</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={captcha.answer}
                      onChange={e => {
                        setCaptchaError(false)
                        setCaptcha(p => ({ ...p, answer: e.target.value }))
                      }}
                      className={`w-20 sm:w-24 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border text-center text-base sm:text-lg font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all ${
                        captchaError
                          ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      }`}
                      placeholder="?"
                    />
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="p-2 sm:p-2.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                      title="تحديث"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  {captchaError && (
                    <p className="text-xs text-red-500 mt-2">إجابة غير صحيحة. حاول مرة أخرى</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 sm:py-3 px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "إرسال الرسالة"
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2 space-y-5 sm:space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 animate-fade-in">
              <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6">معلومات التواصل</h2>
              <div className="space-y-3 sm:space-y-4">
                {settings.contactEmail && (
                  <a href={`mailto:${settings.contactEmail}`}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors shrink-0">
                      <HiOutlineMail className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500 mb-0.5">البريد الإلكتروني</p>
                      <p className="text-sm font-medium dir-ltr text-left truncate">{settings.contactEmail}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 animate-fade-in">
                <h2 className="text-lg sm:text-xl font-bold mb-5 sm:mb-6">تواصل معنا</h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {socialLinks.map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 transition-all duration-300 hover:scale-110 ${socialColors[platform] || "hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900"}`}
                    >
                      {socialIcons[platform] || null}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
