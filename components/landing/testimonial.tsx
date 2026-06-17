// components/landing/testimonial.tsx
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rizky Pratama",
    initials: "RP",
    role: "Karyawan Swasta, Bukittinggi",
    text: "Flight pagi buta jam 5.30, dijemput jam 3 pagi. Saya kira nggak bakal ada yang mau jemput sepagi itu. Tapi driver Skyvora sudah di depan rumah jam 2.50. Sampai bandara tepat waktu, malah bisa sarapan dulu di bandara. Top banget.",
    rating: 5,
    trip: "ANTAR ke Bandara",
  },
  {
    name: "Dewi Lestari",
    initials: "DL",
    role: "Ibu Rumah Tangga, Bukittinggi",
    text: "Pertama kali pakai Skyvora untuk jemput anak saya yang pulang dari Jakarta. Saya nggak perlu ke bandara. Driver-nya ramah, mobilnya bersih, anak saya langsung dijemput sampai rumah. Harganya juga masuk akal. Next time pasti pakai lagi.",
    rating: 5,
    trip: "JEMPUT dari Bandara",
  },
  {
    name: "Andri Firmansyah",
    initials: "AF",
    role: "Freelancer, Padang",
    text: "Biasanya naik taksi dari bandara ke Bukittinggi bisa 300rb lebih. Pake Skyvora Open Trip cuma 80rb. Iya, harus bagi sama penumpang lain, tapi tetap nyaman. Mobil AC, driver juga sopan. Hemat banyak buat yang sering bolak-balik.",
    rating: 5,
    trip: "Open Trip",
  },
];

export default function Testimonial() {
  return (
    <section className="py-16 md:py-20" style={{ background: "#f5f3f0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-bold text-sm uppercase tracking-wide mb-2">Testimonial</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Apa Kata Pelanggan Kami
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            Bukan kami yang bilang — pelanggan kami sendiri yang cerita. Ini pengalaman mereka pakai Skyvora Travel.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <Quote className="w-8 h-8 text-primary-light mb-3" />
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-400 ml-1">({t.trip})</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-dark">{t.initials}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
