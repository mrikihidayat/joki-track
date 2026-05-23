import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Joki Center Tracker',
  description: 'Realtime billing tracker untuk klien joki',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
