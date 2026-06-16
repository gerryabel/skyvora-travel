// app/(user)/riwayat/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList, MapPin, CheckCircle, Clock, AlertCircle,
  LogIn, Frown, Search, RefreshCw, CreditCard, XCircle
} from "lucide-react";

interface Booking {
  id: string;
  status: string;
  tipeTrip: string;
  nama: string;
  tglBerangkat: string | null;
  jumlahKursi: number;
  totalHarga: number;
  metodePembayaran: string | null;
  alamatJemput: string;
  jadwal: {
    rute: string;
    bandara: string;
    tipe: string;
    jamBerangkat: string;
  } | null;
  payment: {
    orderId: string;
    status: string;
    method: string;
    amount: number;
    paidAt: string | null;
  } | null;
  createdAt: string;
};

export interface BookingItem {
  // define fields if needed
}


const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Menunggu Bayar",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  PAID: {
    label: "Sudah Bayar",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  MENUNGGU_KUOTA: {
    label: "Menunggu Kuota",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    icon: <Clock className="w-3 h-3" />,
  },
  DIKONFIRMASI: {
    label: "Terkonfirmasi",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  PENDING_PAYMENT: {
    label: "Menunggu Pembayaran",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    icon: <CreditCard className="w-3 h-3" />,
  },
  BERANGKAT: {
    label: "Berangkat",
    color: "text-cyan-600",
    bg: "bg-cyan-50 border-cyan-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  SELESAI: {
    label: "Selesai",
    color: "text-gray-600",
    bg: "bg-[#f5f3f0] border-[#e0dcd7]",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  DIBATALKAN: {
    label: "Dibatalkan",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatTanggal(tgl: string | null) {
  if (!tgl) return "—";
  const d = new Date(tgl + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMetode(m: string | null): string {
  if (!m) return "—";
  const map: Record<string, string> = {
    cash: "Tunai",
    transfer: "Transfer Bank",
    gopay: "GoPay",
    ovo: "OVO",
    shopeepay: "ShopeePay",
    va_bca: "VA BCA",
    va_mandiri: "VA Mandiri",
    va_bri: "VA BRI",
  };
  return map[m] || m.toUpperCase();
}

export default function RiwayatPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  async function fetchBookings() {
    setLoading(true);
    try {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      if (!sessionData.user) {
        setIsLoggedIn(false);
        setBookings([]);
        setLoading(false);
        return;
      }
      setIsLoggedIn(true);

      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data.data || []);
    } catch {
      setIsLoggedIn(false);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = filterStatus === "ALL" || b.status === filterStatus;
    const matchSearch =
      search === "" ||
      b.jadwal?.rute?.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.nama?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          Riwayat <span className="text-blue-600">Booking</span>
        </h1>
        <p className="text-gray-500 mb-8">Memuat data...</p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          Riwayat <span className="text-blue-600">Booking</span>
        </h1>
        <p className="text-gray-500 mb-8">Semua pemesanan travel kamu</p>
        <div className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-2xl p-10 text-center shadow-sm">
          <LogIn className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Login Dulu</h3>
          <p className="text-gray-500 mb-4">Kamu perlu login untuk melihat riwayat booking.</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Riwayat <span className="text-blue-600">Booking</span>
          </h1>
          <p className="text-gray-500">Semua pemesanan travel kamu</p>
        </div>
        <button
          onClick={fetchBookings}
          className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search & Filter + Summary */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari rute, kode booking, atau nama..."
              className="w-full bg-[#fdfcfa] border border-[#d4cfc8] rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 h-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#fdfcfa] border border-[#d4cfc8] rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 h-10"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu Bayar</option>
            <option value="PENDING_PAYMENT">Menunggu Pembayaran</option>
            <option value="PAID">Sudah Bayar</option>
            <option value="MENUNGGU_KUOTA">Menunggu Kuota</option>
            <option value="DIKONFIRMASI">Terkonfirmasi</option>
            <option value="BERANGKAT">Berangkat</option>
            <option value="SELESAI">Selesai</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>
        </div>

        {bookings.length > 0 && (
          <div className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-lg px-4 py-2 shadow-sm flex items-center gap-4 text-xs h-10 flex-shrink-0">
            <span className="text-gray-500">Total <strong className="text-gray-900">{bookings.length}</strong></span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">Selesai <strong className="text-green-600">{bookings.filter((b) => b.status === "SELESAI").length}</strong></span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">Aktif <strong className="text-blue-600">{bookings.filter((b) => !["SELESAI", "DIBATALKAN"].includes(b.status)).length}</strong></span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">Dibayar <strong className="text-blue-600">{formatRupiah(bookings.filter((b) => ["PAID","DIKONFIRMASI","MENUNGGU_KUOTA","BERANGKAT","SELESAI"].includes(b.status)).reduce((s, b) => s + b.totalHarga, 0))}</strong></span>
          </div>
        )}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-2xl p-10 text-center shadow-sm">
          {bookings.length === 0 ? (
            <>
              <ClipboardList className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Belum Ada Booking</h3>
              <p className="text-gray-500 mb-4">Kamu belum pernah memesan travel.</p>
              <Link
                href="/cari-jadwal"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Pesan Sekarang
              </Link>
            </>
          ) : (
            <>
              <Frown className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak Ditemukan</h3>
              <p className="text-gray-500">Tidak ada booking yang cocok dengan filter.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;

            return (
              <div
                key={booking.id}
                className="bg-[#fdfcfa] border border-[#e0dcd7] rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-500">
                        {booking.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color} font-medium inline-flex items-center gap-1`}>
                        {sc.icon}
                        {sc.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        booking.tipeTrip === "OPEN"
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "bg-purple-50 border-purple-200 text-purple-600"
                      }`}>
                        {booking.tipeTrip === "OPEN" ? "Open Trip" : "Private"}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg truncate">
                      {booking.jadwal?.rute || "Rute tidak ditemukan"}
                    </h3>
                    <p className="text-gray-500 text-sm">{booking.jadwal?.bandara || ""}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">Tanggal</span>
                        <p className="text-gray-900">{formatTanggal(booking.tglBerangkat)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Penumpang</span>
                        <p className="text-gray-900">{booking.jumlahKursi} orang</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Total</span>
                        <p className="text-blue-600 font-bold">{formatRupiah(booking.totalHarga)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Metode</span>
                        <p className="text-gray-900">{formatMetode(booking.metodePembayaran)}</p>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm mt-2 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {booking.alamatJemput}
                    </p>

                    {booking.payment?.paidAt && (
                      <p className="text-gray-400 text-xs mt-1">
                        Dibayar: {new Date(booking.payment.paidAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>

                  {/* Aksi */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {(booking.status === "PENDING" || booking.status === "PENDING_PAYMENT") && (
                      <Link
                        href={`/pembayaran/konfirmasi?bookingId=${booking.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm text-center hover:bg-blue-700 transition-all"
                      >
                        Bayar Sekarang
                      </Link>
                    )}
                    {booking.status === "MENUNGGU_KUOTA" && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center max-w-[200px]">
                        <p className="text-orange-600 text-xs font-medium flex items-center gap-1 justify-center">
                          <Clock className="w-3 h-3" />
                          Menunggu kuota...
                        </p>
                      </div>
                    )}
                    {booking.status === "DIKONFIRMASI" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <p className="text-green-600 text-xs font-medium flex items-center gap-1 justify-center">
                          <CheckCircle className="w-3 h-3" />
                          Trip dikonfirmasi!
                        </p>
                      </div>
                    )}
                    {booking.status === "DIBATALKAN" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <p className="text-red-600 text-xs font-medium flex items-center gap-1 justify-center">
                          <AlertCircle className="w-3 h-3" />
                          Dibatalkan
                        </p>
                      </div>
                    )}
                    {booking.status === "SELESAI" && (
                      <button
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium underline"
                      >
                        Beri Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
