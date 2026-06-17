// components/landing/layanan.tsx
import { Plane, Home, Users, Lock } from "lucide-react";

const layanan = [
  {
    icon: Plane,
    title: "ANTAR ke Bandara",
    desc: "Kami jemput kamu di rumah, hotel, atau lokasi mana saja. Langsung antar ke bandara. Tidak perlu parkir, tidak perlu bawa barang jauh-jauh. Tinggal duduk santai, kami yang nyetir.",
    color: "blue" as const,
    tag: "Paling Populer",
  },
  {
    icon: Home,
    title: "JEMPUT dari Bandara",
    desc: "Kamu landing, kami sudah tunggu. Driver pegang nama kamu di pintu keluar. Langsung pulang ke rumah tanpa antri taksi atau bingung cari ojol.",
    color: "green" as const,
    tag: "Meet & Greet",
  },
  {
    icon: Users,
    title: "Open Trip (Berbagi)",
    desc: "Ikut perjalanan bersama penumpang lain. Harga jauh lebih murah — cocok untuk yang mau hemat. Rute tetap, jadwal tetap, tapi dompet tetap tebal.",
    color: "purple" as const,
    tag: "Hemat",
  },
  {
    icon: Lock,
    title: "Private Trip (Eksklusif)",
    desc: "Mobil khusus untuk kamu, keluarga, atau rombongan. Lebih privat, lebih fleksibel, bisa mampir kalau mau. Cocok untuk yang bawa banyak barang atau traveling sama anak kecil.",
    color: "orange" as const,
    tag: "Eksklusif",
  },
];

const colorMap = {
  blue: { bg: "bg-primary-light", icon: "text-primary", border: "border-primary-light", tagBg: "bg-primary-light", tagText: "text-primary-dark" },
  green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-100", tagBg: "bg-green-100", tagText: "text-green-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100", tagBg: "bg-purple-100", tagText: "text-purple-700" },
  orange: { bg: "bg-orange-50", icon: "text-accent", border: "border-orange-100", tagBg: "bg-orange-100", tagText: "text-accent-dark" },
};

export default function Layanan() {
  return (
    <section id="layanan" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-bold text-sm uppercase tracking-wide mb-2">Layanan Kami</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Pilih yang Sesuai Kebutuhan Kamu
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            Mau antar, mau dijemput, mau hemat, atau mau privat — semua ada. Tinggal pilih.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {layanan.map((item) => {
            const c = colorMap[item.color];
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`rounded-2xl p-6 border ${c.border} hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${c.icon}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${c.tagBg} ${c.tagText} px-2 py-0.5 rounded-full`}>
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
