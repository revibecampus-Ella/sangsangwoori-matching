import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "상상우리 - 시니어 일자리 매칭",
  description: "시니어와 일자리를 자동으로 매칭하는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <header className="bg-amber-50 border-b-2 border-amber-200 shadow-sm">
          <nav className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-8">
            <Link href="/" className="flex items-center hover:opacity-75 transition-opacity">
              <Image
                src="/sangsangwoori_logo.png"
                alt="상상우리"
                width={80}
                height={48}
                className="object-contain rounded-md"
              />
            </Link>
            <div className="flex gap-6 text-xl">
              <Link
                href="/register"
                className="text-stone-700 hover:text-orange-600 transition-colors font-medium"
              >
                프로필 등록
              </Link>
              <Link
                href="/recommendations"
                className="text-stone-700 hover:text-orange-600 transition-colors font-medium"
              >
                추천 목록
              </Link>
              <Link
                href="/admin"
                className="text-stone-700 hover:text-orange-600 transition-colors font-medium"
              >
                관리자
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-amber-50 border-t-2 border-amber-200 text-stone-500 text-center py-4 text-lg">
          © 2026 상상우리. 시니어 일자리 매칭 서비스.
        </footer>
      </body>
    </html>
  );
}
