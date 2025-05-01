import './global.css'
import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'

const kanit = Kanit({
  weight: ['300', '400', '500', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'โครงการ Zero Waste',
  description: 'บันทึกรายรับรายจ่ายประจำวัน',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={kanit.className}>
        <main className="container" style={{ padding: '2rem 0' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
