import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AcdyOn Academic Pathway",
  description: "Personalized academic pathway recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900">
        <div className="border-t-4 border-sky-600" />
        <header className="w-full">
          <div className="mx-auto container-lg px-4 py-6">
            <div className="flex items-center justify-between gap-6 rounded-3xl bg-white/80 px-5 py-4 card-shadow backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 p-3 text-white shadow">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <p className="text-lg font-semibold">AcdyOn Academic Pathway</p>
                  <p className="text-sm text-muted">Personalized academic recommendations</p>
                </div>
              </div>

              <nav className="flex items-center gap-2">
                <Link href="/" className="text-sm font-semibold text-sky-700 border border-sky-300 bg-sky-50 px-4 py-2 rounded-full hover:bg-sky-100 hover:border-sky-400 transition-colors">
                  Home
                </Link>
                <Link href="/submissions" className="text-sm font-semibold text-indigo-700 border border-indigo-300 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 hover:border-indigo-400 transition-colors">
                  Submissions
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 animate-fade">{children}</main>
        <footer className="border-t border-slate-200 bg-white/90 py-6 text-center text-sm text-slate-600 backdrop-blur-sm">
          © 2026 AcdyOn Academic Pathway · Built for the AcdyOn Technical Internship Challenge
        </footer>
      </body>
    </html>
  );
}
