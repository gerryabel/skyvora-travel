// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skyvora Travel - Antar Jemput Bandara",
  description: "Pemesanan travel antar jemput rumah ↔ bandara. Aman, nyaman, tepat waktu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen flex flex-col`} style={{ background: "#f5f3f0", color: "#1a1a1a" }}>
        {children}
      </body>
    </html>
  );
}
