// app/(user)/pembayaran/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Lock, Wallet, Building2, Landmark, CreditCard, Frown, Loader2, ShieldCheck } from "lucide-react";

const METODE_PEMBAYARAN = [
  { id: "cash", nama: "Bayar Tunai (Cash)", icon: "cash", desc: "Bayar langsung ke driver saat penjemputan" },
  { id: "gopay", nama: "GoPay", icon: "wallet", desc: "Bayar dengan GoPay via Midtrans" },
  { id: "ovo", nama: "OVO", icon: "wallet", desc: "Bayar dengan OVO via Midtrans" },
  { id: "shopeepay", nama: "ShopeePay", icon: "wallet", desc: "Bayar dengan ShopeePay via Midtrans" },
  { id: "va_bca", nama: "VA BCA", icon: "bank", desc: "Virtual Account BCA via Midtrans" },
  { id: "va_mandiri", nama: "VA Mandiri", icon: "bank", desc: "Virtual Account Mandiri via Midtrans" },
  { id: "va_bri", nama: "VA BRI", icon: "bank", desc: "Virtual Account BRI via Midtrans" },
  { id: "transfer", nama: "Transfer Bank", icon: "bank", desc: "Transfer via Midtrans" },
];

function getIcon(icon: string, color: string) {
  const cls = `w-6 h-6 ${color}`;
  switch (icon) {
    case "cash": return <Wallet className={cls} />;
    case "wallet": return <Wallet className={cls} />;
    case "bank": return <Building2 className={cls} />;
    default: return <CreditCard className={cls} />;
  }
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function PembayaranPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Memuat...</div>
    }>
      <PembayaranContent />
    </Suspense>
  );
}

function PembayaranContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    kodeBooking: string;
    status: string;
  } | null>(null);

  const jadwalId = params.get("jadwalId") || "";
  const asal = params.get("asal") || "";
  const tujuan = params.get("tujuan") || "";
  const penumpang = Number(params.get("penumpang")) || 1;
  const nama = params.get("nama") || "";
  const tipeTrip = params.get("tipeTrip") || "OPEN";
  const totalHarga = Number(params.get("totalHarga")) || 0;
  const alamatJemput = params.get("alamatJemput") || "";
  const catatan = params.get("catatan") || "";
  const tglBerangkat = params.get("tglBerangkat") || params.get("tanggal") || "";
  const email = params.get("email") || "";
  const phone = params.get("phone") || "";
  const jadwalRute = params.get("jadwalRute") || "";
  const jadwalBandara = params.get("jadwalBandara") || "";

  // If success, show confirmation
  if (success && bookingResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-[#fdfcfa] border border-green-200 rounded-2xl p-10 shadow-sm">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            {selectedMethod === "cash" ? "Booking Berhasil!" : "Pembayaran Diproses!"}
          </h1>
          <p className="text-gray-500 mb-6">
            {selectedMethod === "cash"
              ? "Booking kamu sudah dikonfirmasi. Bayar tunai ke driver saat penjemputan."
              : "Silakan selesaikan pembayaran melalui halaman Midtrans."}
          </p>
          <div className="bg-[#f5f3f0] rounded-xl p-6 text-left mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Kode Booking</span>
              <span className="text-gray-900 font-mono font-bold">{bookingResult.kodeBooking}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nama</span>
              <span className="text-gray-900">{nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Rute</span>
              <span className="text-gray-900">{jadwalRute}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Penumpang</span>
              <span className="text-gray-900">{penumpang} orang</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="text-blue-600 font-bold">{formatRupiah(totalHarga)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="text-green-600 font-bold">
                {bookingResult.status === "DIKONFIRMASI" ? "Dikonfirmasi" : "Menunggu Pembayaran"}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/riwayat" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all inline-flex items-center gap-2">
              Lihat Riwayat
            </Link>
            <Link href="/" className="border border-[#d4cfc8] text-gray-600 px-6 py-3 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all">
              Kembali ke Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!jadwalId || !totalHarga || !nama) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Frown className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Data Tidak Lengkap</h1>
        <p className="text-gray-500 mb-6">Silakan isi form pemesanan terlebih dahulu.</p>
        <Link href="/cari-jadwal" className="text-blue-600 hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Pencarian
        </Link>
      </div>
    );
  }

  async function handleBayar() {
    if (!selectedMethod) return;
    setProcessing(true);
    setError("");

    try {
      // Step 1: Create booking via API
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jadwalId,
          tipeTrip,
          tglBerangkat,
          jumlahKursi: penumpang,
          nama,
          alamatJemput,
          catatan,
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        setError(bookingData.error || "Gagal membuat booking");
        setProcessing(false);
        return;
      }

      const bookingId = bookingData.data.id;

      // Step 2: Cash — langsung sukses
      if (selectedMethod === "cash") {
        setBookingResult({
          bookingId,
          kodeBooking: `ABL-${bookingId.substring(0, 6).toUpperCase()}`,
          status: "DIKONFIRMASI",
        });
        setSuccess(true);
        setProcessing(false);
        return;
      }

      // Step 3: Non-cash — get snap token
      const snapRes = await fetch("/api/payment/snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          metodePembayaran: selectedMethod,
          customerName: nama,
          customerEmail: email || undefined,
          customerPhone: phone || undefined,
        }),
      });

      const snapData = await snapRes.json();

      if (!snapRes.ok) {
        setError(snapData.error || "Gagal membuat transaksi pembayaran");
        setProcessing(false);
        return;
      }

      // Step 4: Redirect to Midtrans
      if (snapData.data?.redirectUrl) {
        window.location.href = snapData.data.redirectUrl;
      } else {
        setError("Gagal mendapatkan link pembayaran");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setProcessing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href={`/booking?jadwalId=${jadwalId}&asal=${asal}&tujuan=${tujuan}&penumpang=${penumpang}`}
        className="text-blue-600 hover:underline mb-6 inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>
      <h1 className="text-3xl font-bold mb-2 text-gray-900">
        <span className="text-blue-600">Pembayaran</span>
      </h1>
      <p className="text-gray-500 mb-8">Pilih metode pembayaran dan selesaikan transaksi</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Pilih Metode Pembayaran</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {METODE_PEMBAYARAN.map((method) => (
                <button
                  key={method.id}
                  onClick={() => { setSelectedMethod(method.id); setError(""); }}
                  className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                    selectedMethod === method.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-[#e0dcd7] hover:border-[#d4cfc8]"
                  }`}
                >
                  {getIcon(
                    method.icon,
                    method.id === "cash" ? "text-green-600" : "text-blue-600"
                  )}
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{method.nama}</div>
                    <div className="text-gray-500 text-xs">{method.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleBayar}
              disabled={!selectedMethod || processing}
              className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </span>
              ) : selectedMethod === "cash" ? (
                `Konfirmasi Booking — ${formatRupiah(totalHarga)}`
              ) : (
                `Bayar ${formatRupiah(totalHarga)} via Midtrans`
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-2xl p-6 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-blue-600">Ringkasan</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Rute</span>
                <span className="text-gray-900 text-right">{jadwalRute}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Penumpang</span>
                <span className="text-gray-900">{penumpang} orang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mode</span>
                <span className="text-gray-900">{tipeTrip === "OPEN" ? "Open Trip" : "Private"}</span>
              </div>
              {selectedMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Metode</span>
                  <span className="text-gray-900">
                    {METODE_PEMBAYARAN.find((m) => m.id === selectedMethod)?.nama}
                  </span>
                </div>
              )}
              <div className="border-t border-[#e0dcd7] pt-3 mt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-600">{formatRupiah(totalHarga)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-700 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Pembayaran non-cash diproses oleh Midtrans dengan enkripsi SSL.
              </p>
            </div>
            {selectedMethod !== "cash" && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Transaksi aman & tersertifikasi PCI DSS.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
