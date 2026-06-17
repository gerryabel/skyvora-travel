// components/landing/faq.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Harga bisa berubah nggak?",
    a: "Harga yang kami kasih di awal itu final. Tidak ada biaya tersembunyi. Kecuali kamu minta ubah tujuan atau tambah jarak di luar kesepakatan awal.",
  },
  {
    q: "Kalau flight saya delay, driver tetap nunggu?",
    a: "Tentu. Kami pantau jadwal flight kamu. Kalau delay, driver tetap siap nunggu. Tidak ada biaya tambahan untuk nunggu karena flight delay.",
  },
  {
    q: "Bisa refund kalau batal?",
    a: "Bisa. Kalau batal minimal 6 jam sebelum jadwal, refund 100%. Kurang dari itu, kita diskusikan — kami fleksibel.",
  },
  {
    q: "Open Trip itu seperti apa? Nyaman nggak?",
    a: "Open Trip artinya kamu berbagi mobil dengan penumpang lain yang searah. Mobil tetap standar (MPV/SUV), AC dingin, driver profesional. Cuma berhenti di beberapa titik untuk jemput/antar penumpang lain. Cocok buat yang mau hemat.",
  },
  {
    q: "Bayar gimana? Bisa bayar tunai?",
    a: "Bisa banget! Kamu punya 3 pilihan: (1) Bayar tunai langsung ke driver saat naik atau sampai tujuan — paling simpel, tidak perlu HP. (2) Transfer bank via mobile banking/ATM — BCA, BRI, BNI, Mandiri, semua bisa. (3) E-wallet OVO, GoPay, atau Dana — bayar dari HP, langsung konfirmasi. Bebas pilih yang paling gampang buat kamu.",
  },
  {
    q: "Saya bawa banyak bagasi, muat nggak?",
    a: "Muat. Driver bantu bawa bagasi sampai mobil. Kalau banyak sekali, kasih tahu kami saat booking — kami siapkan mobil yang muat.",
  },
  {
    q: "Asuransi perjalanan termasuk nggak?",
    a: "Ya, setiap penumpang terlindungi asuransi perjalanan. Kamu bisa fokus santai, urusan keamanan kami yang tanggung.",
  },
];

function FAQItem({ faq, isOpen, onClick }: { faq: typeof faqs[0]; isOpen: boolean; onClick: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
        <ChevronDown
          className="w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: height }}
      >
        <div ref={contentRef} className="px-5 pb-4">
          <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-bold text-sm uppercase tracking-wide mb-2">Pertanyaan Umum</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Ada Pertanyaan?
          </h2>
          <p className="text-gray-500 text-base">
            Ini pertanyaan yang paling sering ditanyain sama pelanggan kami.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Pertanyaan lain? Langsung chat kami via WhatsApp — kami bales cepat.
          </p>
        </div>
      </div>
    </section>
  );
}
