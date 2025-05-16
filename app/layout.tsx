import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Croed-Detection',
  description: 'A web app for detecting crowdedness in videos',
  generator: 'Next.js',
  applicationName: 'Crowd Detection',
  referrer: 'origin-when-cross-origin',
  keywords: ['Next.js', 'React', 'Crowd Detection', 'Video Analysis'],
  authors: [{ name: 'Vishwas Vivian Anthony' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
