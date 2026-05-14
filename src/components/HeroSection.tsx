"use client"

import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-white to-zinc-50/80 dark:from-black dark:via-zinc-950 dark:to-zinc-900" />

      {/* Cinematic light effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200/30 via-transparent to-transparent dark:from-amber-500/8" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent dark:from-blue-500/5" />

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-20 right-[10%] w-96 h-96 rounded-full bg-gradient-to-br from-amber-300/20 to-orange-300/10 dark:from-amber-500/10 dark:to-orange-500/5 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 left-[5%] w-80 h-80 rounded-full bg-gradient-to-tr from-blue-300/20 to-purple-300/10 dark:from-blue-500/10 dark:to-purple-500/5 blur-3xl animate-float" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-rose-200/10 to-amber-200/10 dark:from-rose-500/5 dark:to-amber-500/5 blur-3xl animate-pulse-glow" />

      {/* Decorative book/page elements */}
      <div className="absolute left-[6%] top-[20%] hidden xl:block animate-float-slow">
        <div className="relative w-24 h-32">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-200/20 to-amber-300/10 dark:from-amber-400/8 dark:to-amber-500/5 rounded-lg backdrop-blur-sm -rotate-6 border border-amber-200/20 dark:border-amber-400/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-amber-100/20 dark:from-white/5 dark:to-amber-300/5 rounded-lg backdrop-blur-sm rotate-[4deg] border border-amber-200/20 dark:border-amber-400/10 translate-x-1 translate-y-1" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-amber-50/30 dark:from-white/5 dark:to-amber-200/5 rounded-lg backdrop-blur-sm border border-amber-200/30 dark:border-amber-400/10 shadow-lg" />
        </div>
      </div>

      <div className="absolute right-[6%] bottom-[25%] hidden xl:block animate-float">
        <div className="relative w-20 h-28">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-200/20 to-blue-300/10 dark:from-blue-400/8 dark:to-blue-500/5 rounded-lg backdrop-blur-sm rotate-6 border border-blue-200/20 dark:border-blue-400/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-blue-100/20 dark:from-white/5 dark:to-blue-300/5 rounded-lg backdrop-blur-sm -rotate-3 border border-blue-200/20 dark:border-blue-400/10 -translate-x-1" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-32">
        {/* Eyebrow badge */}
        <div className="animate-slide-up">
          <span className="inline-block px-4 py-1.5 mb-8 text-xs sm:text-sm font-medium tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/30 rounded-full border border-amber-200/50 dark:border-amber-700/30 backdrop-blur-sm">
            مدونة روائية عربية
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 animate-slide-up [animation-delay:0.15s]">
          ارتحل إلى{" "}
          <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 dark:from-amber-400 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
            عوالم لا تُنسى
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-slide-up [animation-delay:0.3s]">
          اكتشف مجموعة مختارة من أروع الروايات العربية، وانطلق في رحلة أدبية تأسر الخيال
          وتترك في نفسك أثراً لا يُمحى
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up [animation-delay:0.45s]">
          <Link
            href="#novels"
            className="group relative inline-flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-8 py-4 rounded-2xl text-base font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-zinc-900/20 dark:shadow-white/10"
          >
            <span className="relative z-10">اكتشف الروايات</span>
            <svg className="relative z-10 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-700 dark:from-zinc-200 dark:to-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] backdrop-blur-sm"
          >
            عن الكاتب
          </Link>
        </div>
      </div>

      {/* Bottom fade transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-black dark:via-black/80 to-transparent pointer-events-none" />
    </section>
  )
}
