import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Civic Complaint Platform',
  description: 'Report and track civic infrastructure issues',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
