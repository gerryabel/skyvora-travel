// components/landing/cta.tsx
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 md:py-20" style={{ background: "#f5f3f0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a3050 0%, #0d1f35 100%)" }}
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full translate-y-1/2 -translate-x-1/2" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              Siap Booking?
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "rgba(191,219,254,0.8)" }}>
              Cek jadwal & harga sekarang. Atau langsung chat WhatsApp — kami bales cepat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cari-jadwal"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-primary-dark transition-colors"
                style={{ boxShadow: "0 8px 24px rgba(37,99,235,0.35)" }}
              >
                Cek Jadwal & Harga
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://wa.me/6281266291189?text=Halo%20Skyvora%20Travel%2C%20saya%20mau%20booking%20travel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-colors border-2"
                style={{ background: "rgba(255,255,255,0.08)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
              >
                <MessageCircle className="w-5 h-5" />
                Chat WhatsApp
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm" style={{ color: "rgba(191,219,254,0.5)" }}>
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> 0812-6629-1189</span>
              <span className="hidden sm:inline">|</span>
              <span>Bukittinggi & sekitarnya</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
