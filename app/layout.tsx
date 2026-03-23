import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'PageForge — Agentic B2B Landing Page Builder',
  description: 'Build production-quality B2B landing pages with AI agents in minutes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
