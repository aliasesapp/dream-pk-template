import "@/app/globals.css"

import { Metadata } from "next"
import { Poppins, Work_Sans } from "next/font/google"
import { Viewport } from "next/types"
import { AuthProvider } from "@/contexts/auth-provider"
import FullstoryProvider from "@/contexts/fullstory-provider"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
})

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const iconUrl =
  "https://raw.githubusercontent.com/aliasesapp/dreamstack-images/main/images/favicon"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      {
        url: "https://cdn.prod.website-files.com/63c9874aa33ce9a6f0ab0e91/640f40b6f19b72e71c47a579_favicon_256.jpeg",
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#050A1A" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            workSans.variable,
            poppins.variable,
            "relative dark:bg-[url('https://cdn.prod.website-files.com/63c9874aa33ce9a6f0ab0e91/63c9874aa33ce960d2ab0ec4_Frame%2083.png')] dark:bg-cover dark:bg-top"
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 top-[450px] hidden bg-gradient-to-t from-background from-30% to-background dark:block"
            style={{
              clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0% 100%)",
            }}
          />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <FullstoryProvider>
              <AuthProvider>
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <div className="flex-1 md:p-4">{children}</div>
                </div>
              </AuthProvider>
            </FullstoryProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
