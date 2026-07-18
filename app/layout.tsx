import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rivo QR - Restoranlar için dijital QR menü",
  description: "Rivo QR ile restoran menünüzü, QR kodunuzu, temalarınızı ve sipariş akışınızı tek panelden yönetin.",
  openGraph: {
    title: "Rivo QR - Restoranlar için dijital QR menü",
    description: "Menünüzü canlı tutan, temaları güçlü ve kullanımı sade QR menü sistemi.",
    url: "https://rivoqr.com",
    siteName: "Rivo QR",
    images: [
      {
        url: "/rivo-qr-restaurant-hero.png",
        width: 1792,
        height: 1024,
        alt: "Restoran masasında Rivo QR dijital menü deneyimi",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rivo QR - Restoranlar için dijital QR menü",
    description: "QR menünüzü dakikalar içinde yayına alın ve tek panelden yönetin.",
    images: ["/rivo-qr-restaurant-hero.png"],
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/favicon.ico", sizes: "any", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
