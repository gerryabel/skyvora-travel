// components/landing/kenapa-skyvora.tsx
import { Banknote, Users, RotateCcw } from "lucide-react";

const reasons = [
  {
    icon: Banknote,
    title: "Harga Flat, No Hidden Fee",
    desc: "Kasih harga di awal, itu saja. Tidak ada biaya tambahan macam-macem. Bisa bayar di tujuan (cash) atau transfer.",
    highlight: "Transparan",
  },
  {
    icon: Users,
    title: "Driver Berpengalaman",
    desc: "Driver kami sudah bertahun-tahun di dunia travel. Tahu jalan pintas, tahu macet di mana, tahu lokasi persis kamu. Tidak perlu arah-arahan.",
    highlight: "Tepat waktu",
  },
  {
    icon: RotateCcw,
    title: "Bebas Ubah Jadwal",
    desc: "Flight delay atau rencana berubah? Kabari kami, kita atur ulang. Tidak ribet, tidak mahal.",
    highlight: "Fleksibel",
  },
  {
    icon: Users,
    title: "Open Trip & Private",
    desc: "Mau hemat? Ikut Open Trip, harga lebih murah. Mau privat? Pilih Private Trip, mobil khusus untuk kamu/keluarga.",
    highlight: "Pilihan",
  },
];

export default function KenapaSkyvora() {
  return (
    <section className="py-16 md:py-20" style={{ background: "#f5f3f0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-bold text-sm uppercase tracking-wide mb-2">Kenapa Skyvora Travel?</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Kami Paham Perjalanan Kamu itu Penting
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            Bukan sekadar numpang mobil. Kami bantu kamu sampai tujuan dengan tenang, tepat waktu, tanpa drama.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap mb-2">
                      {item.highlight}
                    </span>
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
