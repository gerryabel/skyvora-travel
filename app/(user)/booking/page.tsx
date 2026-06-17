// app/(user)/booking/page.tsx
"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Car, MapPin, CreditCard, Info, Frown, Plane, Home, CalendarDays } from "lucide-react";

interface Jadwal {
  id: string;
  tipe: string;
  rute: string;
  asal: string;
  tujuan: string;
  hari: string;
  jamBerangkat: string;
  harga: number;
  kapasitas: number;
  terisi: number;
  minKuota: number;
  estimasiWaktu: number;
  armadaId: string | null;
  armada: { nama: string; platNomor: string; tipe: string; kapasitas: number } | null;
}

const HARI_LABELS: Record<string, string> = {
  SENIN: "Senin", SELASA: "Selasa", RABU: "Rabu", KAMIS: "Kamis",
  JUMAT: "Jumat", SABTU: "Sabtu", MINGGU: "Minggu",
};

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatTanggal(tgl: string) {
  if (!tgl) return "-";
  const d = new Date(tgl + "T00:00:00");
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Memuat...</div>}>
      <BookingContent />
    </Suspense>
  );
}

function BookingContent() {
  const router = useRouter();
  const params = useSearchParams();

  const jadwalId = params.get("jadwalId") || "";
  const asal = params.get("asal") || "";
  const tujuan = params.get("tujuan") || "";
  const penumpang = Number(params.get("penumpang")) || 1;
  const tglBerangkat = params.get("tanggal") || params.get("tglBerangkat") || "";

  const [jadwal, setJadwal] = useState<Jadwal | null>(null);
  const [loadingJadwal, setLoadingJadwal] = useState(true);

  useEffect(() => {
    if (!jadwalId) {
      setLoadingJadwal(false);
      return;
    }
    fetch(`/api/jadwal?id=${jadwalId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setJadwal(data.data[0]);
        } else {
          setJadwal(null);
        }
      })
      .catch(() => setJadwal(null))
      .finally(() => setLoadingJadwal(false));
  }, [jadwalId]);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    phone: "",
    alamatJemput: "",
    catatan: "",
    tipeTrip: "OPEN" as "OPEN" | "PRIVATE",
  });

  const [loading, setLoading] = useState(false);

  if (loadingJadwal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        Memuat data jadwal...
      </div>
    );
  }

  if (!jadwal) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Frown className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Jadwal Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-6">Jadwal yang kamu cari tidak tersedia.</p>
        <Link href="/cari-jadwal" className="text-primary hover:underline">
          ← Kembali ke Pencarian
        </Link>
      </div>
    );
  }

  const sisaKursi = jadwal.kapasitas - jadwal.terisi;
  const hargaPerOrang = formData.tipeTrip === "PRIVATE"
    ? jadwal.harga * jadwal.kapasitas
    : jadwal.harga;
  const totalHarga = formData.tipeTrip === "PRIVATE"
    ? hargaPerOrang
    : hargaPerOrang * penumpang;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jadwal) return;
    setLoading(true);

    const q = new URLSearchParams({
      jadwalId: jadwal.id,
      asal,
      tujuan,
      penumpang: String(penumpang),
      nama: formData.nama,
      email: formData.email,
      phone: formData.phone,
      alamatJemput: formData.alamatJemput,
      catatan: formData.catatan,
      tipeTrip: formData.tipeTrip,
      totalHarga: String(totalHarga),
      tglBerangkat,
      jadwalRute: jadwal.rute,
    }).toString();

    router.push(`/pembayaran?${q}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/cari-jadwal" className="text-primary hover:underline mb-6 inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Pencarian
      </Link>

      <h1 className="text-3xl font-bold mb-2 text-gray-900">
        Form <span className="text-primary">Pemesanan</span>
      </h1>
      <p className="text-gray-500 mb-8">Lengkapi data untuk melanjutkan pemesanan</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pilih Mode Trip */}
            <div className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Mode Perjalanan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipeTrip: "OPEN" })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.tipeTrip === "OPEN"
                      ? "border-primary bg-primary-light"
                      : "border-[#e0dcd7] hover:border-[#d4cfc8]"
                  }`}
                >
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Open Trip
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Berbagi perjalanan, lebih hemat</p>
                  <p className="text-primary font-bold mt-2">{formatRupiah(jadwal.harga)}/orang</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipeTrip: "PRIVATE" })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    formData.tipeTrip === "PRIVATE"
                      ? "border-primary bg-primary-light"
                      : "border-[#e0dcd7] hover:border-[#d4cfc8]"
                  }`}
                >
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Private
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Sewa penuh, langsung berangkat</p>
                  <p className="text-primary font-bold mt-2">{formatRupiah(jadwal.harga * jadwal.kapasitas)} (penuh)</p>
                </button>
              </div>
            </div>

            {/* Data Penumpang */}
            <div className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Data Penumpang</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Nama Lengkap *</label>
                  <input type="text" name="nama" value={formData.nama} onChange={handleChange}
                    required placeholder="Masukkan nama lengkap"
                    className="w-full bg-[#fdfcfa] border border-[#d4cfc8] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      required placeholder="contoh@email.com"
                      className="w-full bg-[#fdfcfa] border border-[#d4cfc8] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">No. HP *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      required placeholder="0812-xxxx-xxxx"
                      className="w-full bg-[#fdfcfa] border border-[#d4cfc8] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Alamat Jemput */}
            <div className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-900">
                {jadwal.tipe === "ANTAR" ? "Alamat Penjemputan" : "Alamat Tujuan"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    {jadwal.tipe === "ANTAR" ? "Alamat Lengkap Jemput *" : "Alamat Lengkap Tujuan *"}
                  </label>
                  <textarea name="alamatJemput" value={formData.alamatJemput} onChange={handleChange}
                    required rows={3}
                    placeholder="Jl. No. RT/RW, Kelurahan, Kecamatan, Kota"
                    className="w-full bg-[#fdfcfa] border border-[#d4cfc8] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Catatan (Opsional)</label>
                  <textarea name="catatan" value={formData.catatan} onChange={handleChange}
                    rows={2} placeholder="Contoh: Tolong jemput di depan rumah, lantai 2"
                    className="w-full bg-[#fdfcfa] border border-[#d4cfc8] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                `Lanjut ke Pembayaran — ${formatRupiah(totalHarga)}`
              )}
            </button>
          </form>
        </div>

        {/* Ringkasan */}
        <div className="lg:col-span-2">
          <div className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-2xl p-6 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-primary">Ringkasan Pesanan</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 shrink-0">Rute</span>
                <span className="text-gray-900 font-medium text-right break-words">{jadwal.rute}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 shrink-0">Tipe</span>
                <span className="text-gray-900">{jadwal.tipe === "ANTAR" ? "Antar" : "Jemput"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 shrink-0">Hari</span>
                <span className="text-gray-900 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                  {HARI_LABELS[jadwal.hari] || jadwal.hari}
                </span>
              </div>
              {tglBerangkat && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 shrink-0">Tanggal</span>
                  <span className="text-gray-900">{formatTanggal(tglBerangkat)}</span>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 shrink-0">Jam Berangkat</span>
                <span className="text-primary font-bold">{jadwal.jamBerangkat}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 shrink-0">Mode</span>
                <span className="text-gray-900">{formData.tipeTrip === "OPEN" ? "Open Trip" : "Private"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 shrink-0">Penumpang</span>
                <span className="text-gray-900">{penumpang} orang</span>
              </div>

              {/* Armada Info */}
              {jadwal.armada ? (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 shrink-0">Armada</span>
                  <span className="text-gray-900 text-right">{jadwal.armada.nama} ({jadwal.armada.platNomor})</span>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="text-amber-700 text-xs">Armada akan ditentukan admin sebelum keberangkatan</p>
                </div>
              )}

              <div className="border-t border-[#e0dcd7] pt-3 mt-3">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 shrink-0">Harga per orang</span>
                  <span className="text-gray-900">{formatRupiah(jadwal.harga)}</span>
                </div>
                {formData.tipeTrip === "OPEN" && penumpang > 1 && (
                  <div className="flex justify-between gap-3 mt-1">
                    <span className="text-gray-500 shrink-0">× {penumpang} penumpang</span>
                    <span className="text-gray-900">{formatRupiah(totalHarga)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-[#e0dcd7] pt-3 mt-3">
                <div className="flex justify-between gap-3 text-lg">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-primary">{formatRupiah(totalHarga)}</span>
                </div>
              </div>
            </div>
            {formData.tipeTrip === "OPEN" && (
              <div className="mt-4 bg-primary-light border border-primary-light rounded-lg p-3">
                <p className="text-primary-dark text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Open Trip: Trip berangkat setelah kuota minimum ({jadwal.minKuota} kursi) terpenuhi. Estimasi tunggu maksimal 60 menit.</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
