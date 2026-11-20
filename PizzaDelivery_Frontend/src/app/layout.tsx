import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "Crusty’s | أسرع توصيل بيتزا إيطالية طازجة ولذيذة",
  description: "اطلب أشهى أنواع البيتزا الإيطالية أو اصنع بيتزتك الخاصة من Crusty's مع التتبع اللحظي للطلب",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#991b1b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="scroll-smooth">
      <body className="bg-[#FCFBFA] text-stone-900 min-h-screen antialiased flex flex-col font-sans selection:bg-red-800 selection:text-white">
        <Providers>
          <React.Suspense fallback={<div className="h-20 bg-white" />}>
            <Navbar />
          </React.Suspense>
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 lg:pb-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
