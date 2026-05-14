import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  HiOutlineMail, HiOutlineBookOpen, HiOutlineHeart, HiOutlinePencil,
} from "react-icons/hi"
import {
  FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaLinkedin, FaYoutube, FaQuoteLeft, FaLink,
} from "react-icons/fa"

interface Settings {
  authorName?: string
  authorRole?: string
  authorBio?: string
  authorImage?: string
  contactEmail?: string
  [key: string]: string | undefined
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <FaFacebook className="w-5 h-5" />,
  instagram: <FaInstagram className="w-5 h-5" />,
  twitter: <FaTwitter className="w-5 h-5" />,
  tiktok: <FaTiktok className="w-5 h-5" />,
  linkedin: <FaLinkedin className="w-5 h-5" />,
  youtube: <FaYoutube className="w-5 h-5" />,
}

const platformNames: Record<string, string> = {
  facebook: "فيسبوك",
  instagram: "إنستغرام",
  twitter: "X",
  tiktok: "تيك توك",
  linkedin: "لينكد إن",
  youtube: "يوتيوب",
}

const brandHoverColors: Record<string, string> = {
  facebook: "hover:bg-[#1877F2]",
  instagram: "hover:bg-[#E4405F]",
  twitter: "hover:bg-[#000000]",
  tiktok: "hover:bg-#[#000000]",
  linkedin: "hover:bg-[#0A66C2]",
  youtube: "hover:bg-[#FF0000]",
}

async function getSettings(): Promise<Settings> {
  try {
    const rows = await prisma.setting.findMany()
    const map: Settings = {}
    for (const s of rows) map[s.key] = s.value
    return map
  } catch {
    return {}
  }
}

async function getNovels() {
  try {
    return await prisma.novel.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, description: true, coverImage: true },
    })
  } catch {
    return []
  }
}

export default async function AboutPage() {
  const [settings, novels] = await Promise.all([getSettings(), getNovels()])

  const authorName = settings.authorName || "الكاتب"
  const authorRole = settings.authorRole || "كاتب وروائي"
  const authorBio = settings.authorBio || ""
  const authorImage = settings.authorImage || ""
  const contactEmail = settings.contactEmail || ""

  const socialLinks = Object.entries(settings)
    .filter(([key]) => key.startsWith("facebook") || key.startsWith("instagram") || key.startsWith("twitter") || key.startsWith("tiktok") || key.startsWith("linkedin") || key.startsWith("youtube") || key.startsWith("custom_"))
    .filter(([, value]) => value)
    .map(([key, value]) => ({
      key,
      name: key.startsWith("custom_") ? key.replace("custom_", "") : (platformNames[key] || key),
      url: value,
      icon: platformIcons[key] || <FaLink className="w-5 h-5" />,
      hoverColor: brandHoverColors[key] || "hover:bg-zinc-900 dark:hover:bg-zinc-100",
    }))

  const hasImage = !!authorImage
  const paragraphs = authorBio.split("\n").filter(p => p.trim())

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-transparent dark:from-zinc-900/50 dark:to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-zinc-200/30 to-transparent dark:from-zinc-800/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          {hasImage ? (
            <div className="w-32 h-32 mx-auto mb-8 rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl animate-fade-in">
              <img src={authorImage} alt={authorName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-xl animate-fade-in">
              <HiOutlinePencil className="w-10 h-10" />
            </div>
          )}
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium tracking-widest mb-4 animate-fade-in animate-delay-1">
            {authorRole}
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight animate-fade-in animate-delay-2">
            {authorName}
          </h1>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center animate-fade-in">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <HiOutlineBookOpen className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <p className="text-2xl font-bold mb-1">{novels.length}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">رواية منشورة</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center animate-fade-in animate-delay-1">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <HiOutlineHeart className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <p className="text-2xl font-bold mb-1">+١٠,٠٠٠</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">قارئ</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center animate-fade-in animate-delay-2">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <HiOutlinePencil className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <p className="text-2xl font-bold mb-1">+١٥</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">سنة كتابة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Biography */}
      {paragraphs.length > 0 && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 animate-fade-in animate-delay-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <HiOutlineHeart className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">نبذة عن الكاتب</h2>
              </div>
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="text-zinc-600 dark:text-zinc-400 leading-[2] text-base sm:text-lg mb-6 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Novels */}
      {novels.length > 0 && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">رواياتي</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                مجموعة من الروايات التي كتبتها بشغف وحب
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {novels.map((novel, i) => (
                <Link
                  key={novel.id}
                  href={`/novels/${novel.id}`}
                  className="group block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {novel.coverImage ? (
                      <img
                        src={novel.coverImage}
                        alt={novel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                        <HiOutlineBookOpen className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                      {novel.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {novel.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {(contactEmail || socialLinks.length > 0) && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 animate-fade-in">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">تواصل معي</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                  يسعدني تلقي رسائلك واقتراحاتك على البريد الإلكتروني أو عبر وسائل التواصل الاجتماعي
                </p>
              </div>

              {contactEmail && (
                <div className="max-w-md mx-auto mb-10">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors">
                      <HiOutlineMail className="w-5 h-5 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors" />
                    </div>
                    <span className="font-medium text-sm sm:text-base dir-ltr text-left">
                      {contactEmail}
                    </span>
                  </a>
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.key}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-white dark:hover:text-zinc-900 transition-all duration-300 hover:scale-105 ${social.hoverColor}`}
                      title={social.name}
                    >
                      {social.icon}
                      <span className="text-sm font-medium">{social.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
