import type { Metadata } from "next"
import "./globals.css"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Providers } from "@/components/Providers"
import { FaviconSync } from "@/components/FaviconSync"

export const metadata: Metadata = {
  title: "متجر الروايات",
  description: "متجر لبيع الروايات العربية",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <FaviconSync />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
