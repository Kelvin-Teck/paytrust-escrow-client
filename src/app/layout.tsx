import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ─── Production-Grade Typography Stack ───
// 1. Primary: Plus Jakarta Sans (Friendly, Modern Fintech Geometric Sans)
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// 2. Fallback: Inter (Neo-Grotesque Screen-Optimized UI Sans)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// 3. Monospace: JetBrains Mono (Engineered for Data Grids, Numbers & Audit Logs)
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PayTrust | Secure Multi-Currency Digital Escrow",
  description:
    "PayTrust is a secure escrow and wallet service for businesses and individuals. Pay, save, send, and receive money with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
