import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Rivo QR - Restoran Menü Sistemi",
  description: "Modern QR kod menü sistemi ile restoranınızı dijitalleştirin",
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
      <body className="font-sans">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
