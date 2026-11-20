import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { PWAProvider } from '@/context/PWAContext';
import { AuthProvider } from '@/context/AuthContext';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import PWAInstallModal from '@/components/PWAInstallModal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SITE_URL = 'https://hamkor-talim.uz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hamkor Ta'lim — Zamonaviy Raqamli Ta'lim Tizimi va PWA Ilova",
    template: "%s | Hamkor Ta'lim",
  },
  description:
    "O'zbekistondagi zamonaviy raqamli ta'lim platformasi. O'qituvchilar va o'quvchilar uchun topshiriqlar boshqaruvi, guruhlar tizimi, shaffof 5 ballik baholash va tezkor PWA mobil ilova.",
  keywords: [
    "hamkor talim",
    "hamkor-talim.uz",
    "hamkor ta'lim",
    "raqamli ta'lim",
    "elektron ta'lim",
    "ta'lim platformasi",
    "maktab boshqaruvi",
    "elektron kundalik",
    "vazifalar boshqaruvi",
    "o'qituvchilar uchun",
    "o'quvchilar uchun",
    "pwa ilova",
    "masofaviy ta'lim o'zbekiston",
    "online darslar",
    "baholash tizimi",
    "ta'lim tizimi",
    "maktab topshiriqlari",
    "edtech uzbekistan",
    "kundalik kom o'rniga",
    "emaktab o'rniga",
  ],
  authors: [{ name: "Hamkor Ta'lim Enterprise", url: SITE_URL }],
  creator: "Hamkor Ta'lim",
  publisher: "Hamkor Ta'lim",
  category: 'education',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'uz-UZ': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: SITE_URL,
    siteName: "Hamkor Ta'lim",
    title: "Hamkor Ta'lim — Zamonaviy Raqamli Ta'lim Tizimi",
    description:
      "O'qituvchi va o'quvchilar uchun yagona raqamli platforma: topshiriqlar, guruhlar, baholar va PWA ilova.",
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: "Hamkor Ta'lim Zamonaviy Platformasi",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hamkor Ta'lim — Zamonaviy Raqamli Ta'lim Tizimi",
    description:
      "O'qituvchi va o'quvchilar uchun yagona raqamli ta'lim maydoni. Topshiriqlar, guruhlar va PWA ilova.",
    images: ['/images/hero-bg.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hamkor',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0f1d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data (JSON-LD) for Schema.org SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Hamkor Ta'lim",
        description: "Zamonaviy raqamli ta'lim platformasi va mobil ilovasi",
        inLanguage: 'uz-UZ',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'EducationalOrganization',
        '@id': `${SITE_URL}/#organization`,
        name: "Hamkor Ta'lim",
        url: SITE_URL,
        logo: `${SITE_URL}/icons/icon-512x512.png`,
        description:
          "O'qituvchilar va o'quvchilar uchun topshiriqlar, guruhlar va baholash tizimi",
      },
      {
        '@type': 'SoftwareApplication',
        name: "Hamkor Ta'lim PWA",
        operatingSystem: 'Android, iOS, Windows, macOS',
        applicationCategory: 'EducationalApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'UZS',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1500',
        },
      },
    ],
  };

  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD Structured Data for Google Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950"
      >
        <AuthProvider>
          <PWAProvider>
            <PWAInstallBanner />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <PWAInstallModal />
          </PWAProvider>
        </AuthProvider>

        {/* PWA Service Worker Registration */}
        <Script
          id="pwa-sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('[PWA] SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.warn('[PWA] SW failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
