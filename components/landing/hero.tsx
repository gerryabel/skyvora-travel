// components/landing/hero.tsx
"use client";

import Link from "next/link";
import { Plane, Home, ArrowRight, MessageCircle, Clock, Shield, Banknote } from "lucide-react";

const trustItems = [
  { icon: Clock, text: "24/7 Siap Jemput" },
  { icon: Banknote, text: "Harga Flat No Hidden Fee" },
  { icon: Shield, text: "Driver Berpengalaman" },
  { icon: MessageCircle, text: "Respon Cepat via WhatsApp" },
];

export default function Hero() {
  return (
    <section>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a3050 0%, #0d1f35 100%)" }}>
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full translate-y-1/2 -translate-x-1/2" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd" }}>
                <Plane className="w-4 h-4" />
                Antar Jemput Bandara
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                Tidak Mau Ketinggalan{" "}
                <span className="text-primary">Flight</span>{" "}
                Gara-gara Ribet di Jalan?
              </h1>

              <p className="text-lg mb-4 leading-relaxed" style={{ color: "rgba(191,219,254,0.8)" }}>
                Kami jemput di rumah, antar sampai bandara. Atau sebaliknya — kami tunggu kamu di bandara saat mendarat.
              </p>

              <p className="text-base mb-8 leading-relaxed" style={{ color: "rgba(191,219,254,0.6)" }}>
                Harga transparan, driver lokal yang hafal jalan, bisa bayar di tujuan. Sudah dipercaya ribuan pelanggan di Bukittinggi dan sekitarnya.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/cari-jadwal"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-xl font-bold text-base hover:bg-primary-dark transition-colors shadow-lg"
                  style={{ boxShadow: "0 8px 24px rgba(37,99,235,0.35)" }}
                >
                  Cek Jadwal & Harga
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="https://wa.me/6281266291189?text=Halo%20Skyvora%20Travel%2C%20saya%20mau%20tanya%20jadwal%20travel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base transition-colors border-2"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat WhatsApp
                </a>
              </div>

              {/* Mini social proof */}
              <div className="flex items-center gap-3 mt-6">
                <div className="flex -space-x-2">
                  {["A", "B", "C", "D"].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: "rgba(191,219,254,0.7)" }}>
                  <span className="font-bold text-white">5.000+</span> pelanggan sudah pakai Skyvora Travel
                </p>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                {/* Main circle */}
                <div className="w-72 h-72 rounded-full flex items-center justify-center animate-float-circle-1" style={{ background: "radial-gradient(circle, rgba(96,165,250,0.35) 0%, rgba(59,130,246,0.15) 60%, transparent 100%)", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <div className="w-52 h-52 rounded-full flex items-center justify-center animate-float-circle-2" style={{ background: "radial-gradient(circle, rgba(96,165,250,0.4) 0%, rgba(59,130,246,0.2) 60%, transparent 100%)", border: "1px solid rgba(96,165,250,0.25)" }}>
                    <div className="w-32 h-32 rounded-full flex items-center justify-center animate-float-circle-3" style={{ background: "rgba(96,165,250,0.3)", border: "1px solid rgba(96,165,250,0.35)" }}>
                      <Plane className="w-14 h-14 text-primary-light" />
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-1 -right-6 bg-white rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2 animate-float-slow">
                  <Home className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-400">Dari</p>
                    <p className="text-sm font-bold text-gray-800">Rumah</p>
                  </div>
                </div>
                <div className="absolute -bottom-1 -left-6 bg-white rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2 animate-float-mid" style={{ animationDelay: "0.8s" }}>
                  <Plane className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-gray-400">Ke</p>
                    <p className="text-sm font-bold text-gray-800">Bandara</p>
                  </div>
                </div>
                <div className="absolute top-1/2 -right-10 bg-white rounded-xl px-3 py-2 shadow-xl flex items-center gap-1.5 animate-float-reverse" style={{ animationDelay: "0.4s" }}>
                  <span className="text-yellow-500 text-sm">★★★★★</span>
                  <span className="text-xs font-bold text-gray-700">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3 justify-center">
                  <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
