// components/ui/footer.tsx
import Link from "next/link";
import { Bus, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#f5f3f0] border-t border-[#e0dcd7] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Bus className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">Skyvora</span>
            </Link>
            <p className="text-gray-500 mt-2 text-sm">
              Terbang Menuju Perjalanan Tanpa Batas di Bawah Langit Dunia
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-gray-900 font-bold mb-3">Layanan</h3>
            <div className="flex flex-col gap-2">
              <Link href="/cari-jadwal" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                Cari Jadwal
              </Link>
              <Link href="/riwayat" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
                Riwayat Booking
              </Link>
            </div>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-gray-900 font-bold mb-3">Kontak</h3>
            <div className="flex flex-col gap-2 text-gray-500 text-sm">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> abelgerry11@gmail.com
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> 0812-6629-1189
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Bukittinggi, Sumatera Barat
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Skyvora Travel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
