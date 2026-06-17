// components/landing/cara-pesan.tsx
import { Search, CalendarCheck, CreditCard, Car } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Isi Lokasi & Tanggal",
    desc: "Masukkan lokasi jemput, tujuan, dan tanggal. Kami tunggu jadwal & harga-nya.",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Pilih & Konfirmasi",
    desc: "Pilih jadwal yang cocok, isi data penumpang, lalu konfirmasi booking.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Bayar",
    desc: "Pilih cara bayar yang paling gampang: tunai ke driver, transfer bank, atau e-wallet (OVO/GoPay/Dana).",
  },
  {
    icon: Car,
    step: "04",
    title: "Berangkat!",
    desc: "Driver jemput sesuai lokasi dan waktu yang sudah dijanjikan. Tinggal duduk santai.",
  },
];

export default function CaraPesan() {
  return (
    <section id="cara-pesan" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-bold text-sm uppercase tracking-wide mb-2">Cara Pesan</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Booking Gampang, Cukup 4 Langkah
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            Nggak ribet, Nggak butuh waktu lama. Booking bisa lewat website atau langsung chat WhatsApp.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-primary-light" />
                )}
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-primary-light rounded-2xl mb-5">
                  <Icon className="w-9 h-9 text-primary" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
