import "./globals.css"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Finance Dashboard',
    template: '%s | Finance Dashboard'
  },
  description: 'Comprehensive financial management dashboard for tracking transactions, assets, investments, and documents',
  keywords: ['finance', 'dashboard', 'transactions', 'investments', 'assets', 'financial management'],
  authors: [{ name: 'Finance Dashboard Team' }],
  creator: 'Finance Dashboard',
  publisher: 'Finance Dashboard',
  robots: {
    index: false,
    follow: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}