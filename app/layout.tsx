import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Libre_Baskerville, EB_Garamond, Roboto, IBM_Plex_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
// <CHANGE> Use Libre Baskerville as site serif and expose as CSS variable
const _libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
})
// <ADD> Also expose EB Garamond for slide-only font option
const _ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  style: ["normal"],
  variable: "--font-eb-garamond",
})
// <ADD> IBM Plex Mono for monospace slide font option
const _ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-mono",
})
const _roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] })

export const metadata: Metadata = {
  title: "Shibui - Markdown Slides",
  description: "Beautiful minimal markdown slide deck",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <CHANGE> Add highlight.js for code syntax highlighting */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
      </head>
      <body className={`${_libreBaskerville.variable} ${_ebGaramond.variable} ${_ibmPlexMono.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
