import { Analytics } from '@vercel/analytics/react';
import { Poppins, Nunito } from 'next/font/google';
import './globals.css';

const poppins = Poppins({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
});

const nunito = Nunito({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Thandi.ai - From School to Success | AI Career Guidance',
  description: 'AI-powered career guidance for South African students. Discover your ideal career path based on your interests, subjects, and goals. Free assessment in just 5 minutes.',
  keywords: 'career guidance, South Africa, AI, students, career assessment, education, university, career path',
  authors: [{ name: 'Thandi.ai' }],
  creator: 'Thandi.ai',
  publisher: 'Thandi.ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://thandi.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Thandi.ai - From School to Success',
    description: 'AI-powered career guidance for South African students. Free assessment in just 5 minutes.',
    url: 'https://thandi.ai',
    siteName: 'Thandi.ai',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Thandi.ai - AI Career Guidance for South African Students',
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thandi.ai - From School to Success',
    description: 'AI-powered career guidance for South African students. Free assessment in just 5 minutes.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }) {
 return (
    <html lang="en" className={`${poppins.variable} ${nunito.variable}`}>
      <body className={`${nunito.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
