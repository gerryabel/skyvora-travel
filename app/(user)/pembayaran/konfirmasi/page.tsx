// app/(user)/pembayaran/konfirmasi/page.tsx
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, Frown, Loader2, ArrowLeft, RefreshCw } from "lucide-react";

export default function KonfirmasiPembayaranPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Memuat...</div>
    }>
      <KonfirmasiContent />
    </Suspense>
  );
}

interface BookingInfo {
  id: string;
  kodeBooking: string;
  totalHarga: number;
  metodePembayaran: string;
  status: string;
  nama: string;
  rute: string;
}

function KonfirmasiContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [uiStatus, setUiStatus] = useState<"loading" | "success" | "pending" | "failed" | "error">("loading");
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [checkCount, setCheckCount] = useState(0);

  const bookingId = params.get("bookingId") || "";
  const orderId = params.get("orderId") || "";
  const urlStatus = params.get("status") || ""; // "error", "pending", ""

  const fetchBooking = useCallback(async (): Promise<BookingInfo | null> => {
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        const b = data.data;
        if (b) {
          return {
            id: b.id,
            kodeBooking: b.kodeBooking || `ABL-${b.id.substring(0, 8).toUpperCase()}`,
            totalHarga: b.totalHarga,
            metodePembayaran: b.metodePembayaran || "",
            status: b.status,
            nama: b.nama || "",
            rute: b.jadwal?.rute || "",
          };
        }
      }
    } catch {
      // ignore
    }
    return null;
  }, [bookingId]);

  const determineStatus = (bookingStatus: string): "success" | "pending" | "failed" => {
    if (["PAID", "DIKONFIRMASI", "MENUNGGU_KUOTA", "BERANGKAT", "SELESAI"].includes(bookingStatus)) {
      return "success";
    }
    if (bookingStatus === "DIBATALKAN") {
      return "failed";
    }
    return "pending";
  };

  useEffect(() => {
    if (!bookingId) {
      setUiStatus("error");
      return;
    }

    let cancelled = false;

    async function check() {
      const b = await fetchBooking();
      if (cancelled) return;

      if (!b) {
        if (urlStatus === "error") {
          setUiStatus("failed");
        } else {
          setUiStatus("error");
        }
        return;
      }

      setBooking(b);
      const s = determineStatus(b.status);
      setUiStatus(s);

      // If still pending, auto-retry (max 5 times, every 3s)
      if (s === "pending" && checkCount < 5) {
        setTimeout(() => {
          if (!cancelled) {
            setCheckCount((c) => c + 1);
          }
        }, 3000);
      }
    }

    check();
    return () => { cancelled = true; };
  }, [bookingId, urlStatus, checkCount, fetchBooking]);

  // Handle "Open in new tab" scenario — check URL for Midtrans callback
  useEffect(() => {
    // If Midtrans redirects with finish URL, parse transaction_status if present
    const transactionStatus = params.get("transaction_status") || "";
    const midtransStatus = params.get("status_code") || "";

    if (transactionStatus === "settlement" || midtransStatus === "200") {
      setUiStatus("success");
    } else if (transactionStatus === "deny" || transactionStatus === "cancel" || midtransStatus === "202") {
      setUiStatus("failed");
    } else if (transactionStatus === "pending" || midtransStatus === "201") {
      // Still pending — keep polling
    }
  }, [params]);

  function formatRupiah(n: number) {
    return "Rp " + n.toLocaleString("id-ID");
  }

  function getStatusLabel(s: string) {
    const map: Record<string, string> = {
      PENDING: "Menunggu Bayar",
      PAID: "Lunas",
      DIKONFIRMASI: "Dikonfirmasi",
      MENUNGGU_KUOTA: "Menunggu Kuota",
      PENDING_PAYMENT: "Menunggu Pembayaran",
      BERANGKAT: "Berangkat",
      SELESAI: "Selesai",
      DIBATALKAN: "Dibatalkan",
    };
    return map[s] || s;
  }

  // ---- RENDER STATES ----

  if (uiStatus === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Memverifikasi Pembayaran...</h1>
        <p className="text-gray-500">Mohon tunggu sebentar</p>
      </div>
    );
  }

  if (uiStatus === "error") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Frown className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Data Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-6">Booking tidak ditemukan atau sudah kadaluarsa.</p>
        <Link href="/" className="text-primary hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Home
        </Link>
      </div>
    );
  }

  if (uiStatus === "failed") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-[#fdfcfa] border border-red-200 rounded-2xl p-10 shadow-sm">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-red-600 mb-4">Pembayaran Gagal</h1>
          <p className="text-gray-500 mb-6">
            Transaksi pembayaran tidak berhasil atau dibatalkan. Silakan coba lagi.
          </p>
          {booking && (
            <div className="bg-[#f5f3f0] rounded-xl p-6 text-left mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Kode Booking</span>
                <span className="text-gray-900 font-mono font-bold">{booking.kodeBooking}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="text-gray-900 font-bold">{formatRupiah(booking.totalHarga)}</span>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all"
            >
              Coba Lagi
            </button>
            <Link href="/riwayat" className="border border-[#d4cfc8] text-gray-600 px-6 py-3 rounded-xl hover:border-primary hover:text-primary transition-all">
              Lihat Riwayat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (uiStatus === "pending") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-[#fdfcfa] border border-yellow-200 rounded-2xl p-10 shadow-sm">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-yellow-600 mb-4">Menunggu Pembayaran</h1>
          <p className="text-gray-500 mb-6">
            Silakan selesaikan pembayaran sebelum batas waktu berakhir.
          </p>
          {booking && (
            <div className="bg-[#f5f3f0] rounded-xl p-6 text-left mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Kode Booking</span>
                <span className="text-gray-900 font-mono font-bold">{booking.kodeBooking}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="text-primary font-bold">{formatRupiah(booking.totalHarga)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Metode</span>
                <span className="text-gray-900 uppercase">{booking.metodePembayaran}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-yellow-600 font-bold">{getStatusLabel(booking.status)}</span>
              </div>
            </div>
          )}
          <p className="text-gray-400 text-xs mb-4">
            Status diperiksa otomatis setiap 3 detik...
            {checkCount > 0 && ` (percobaan ${checkCount}/5)`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { setCheckCount(0); setUiStatus("loading"); }}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Cek Status
            </button>
            <Link href="/riwayat" className="border border-[#d4cfc8] text-gray-600 px-6 py-3 rounded-xl hover:border-primary hover:text-primary transition-all">
              Lihat Riwayat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- SUCCESS ----
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="bg-[#fdfcfa] border border-green-200 rounded-2xl p-10 shadow-sm">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-green-600 mb-4">Pembayaran Berhasil!</h1>
        <p className="text-gray-500 mb-6">
          Pembayaran kamu sudah dikonfirmasi. Booking sedang diproses.
        </p>
        {booking && (
          <div className="bg-[#f5f3f0] rounded-xl p-6 text-left mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Kode Booking</span>
              <span className="text-gray-900 font-mono font-bold">{booking.kodeBooking}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nama</span>
              <span className="text-gray-900">{booking.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Rute</span>
              <span className="text-gray-900">{booking.rute}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Bayar</span>
              <span className="text-primary font-bold">{formatRupiah(booking.totalHarga)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="text-green-600 font-bold">{getStatusLabel(booking.status)}</span>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/riwayat" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all inline-flex items-center gap-2">
            Lihat Riwayat
          </Link>
          <Link href="/" className="border border-[#d4cfc8] text-gray-600 px-6 py-3 rounded-xl hover:border-primary hover:text-primary transition-all">
            Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  );
}
