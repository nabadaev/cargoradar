import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CargoRadar — Ocean Freight Intelligence',
  description: 'Know before it hits your shipment. Real-time risk scores and disruption alerts for ocean freight.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=Instrument+Sans:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
