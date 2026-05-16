import { prisma } from "@/lib/prisma"
import { HeroSection } from "@/components/HeroSection"
import { NovelCard } from "@/components/NovelCard"

export const dynamic = "force-dynamic"

async function getNovels() {
  try {
    const novels = await prisma.novel.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    })
    return novels
  } catch {
    return []
  }
}

export default async function Home() {
  const novels = await getNovels()

  return (
    <>
      <HeroSection />

      <section id="novels" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">الروايات</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              اختر روايتك المفضلة وابدأ القراءة
            </p>
          </div>

          {novels.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                لا توجد روايات متاحة حالياً
              </p>
              <p className="text-zinc-400 dark:text-zinc-600 text-sm mt-2">
                قريباً نقدم لكم أفضل الروايات العربية
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {novels.map((novel, i) => (
                <div
                  key={novel.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <NovelCard
                    id={novel.id}
                    title={novel.title}
                    description={novel.description}
                    price={novel.price}
                    coverImage={novel.coverImage}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
