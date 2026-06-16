// app/admin/dashboard/page.tsx
import { createPrismaClient } from "@/lib/db";
import Link from "next/link";
import {
  ClipboardList,
  Car,
  Banknote,
  Calendar,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plane,
  BarChart3,
} from "lucide-react";
import PendapatanChart from "./pendapatan-chart";

export const dynamic = "force-dynamic";

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default async function AdminDashboard() {
  const prisma = createPrismaClient();

  const [
    totalBooking,
    bookingAktif,
    bookingSelesai,
    bookingBatal,
    totalPendapatanResult,
    jadwalAktif,
    armadaAktif,
    totalUser,
    recentBookings,
    allJadwals,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({
      where: { status: { in: ["DIKONFIRMASI", "PENDING_PAYMENT", "BERANGKAT"] } },
    }),
    prisma.booking.count({ where: { status: "SELESAI" } }),
    prisma.booking.count({ where: { status: "DIBATALKAN" } }),
    prisma.booking.aggregate({
      _sum: { totalHarga: true },
      where: { status: { in: ["DIKONFIRMASI", "SELESAI", "BERANGKAT"] } },
    }),
    prisma.jadwal.count({ where: { aktif: true } }),
    prisma.armada.count({ where: { aktif: true } }),
    prisma.user.count(),
    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { jadwal: true, user: true },
    }),
    prisma.jadwal.findMany({
      where: { aktif: true },
      include: { armada: true },
      orderBy: { jamBerangkat: "asc" },
      take: 6,
    }),
  ]);

  const totalPendapatan = totalPendapatanResult._sum.totalHarga || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Selamat datang di panel admin Skyvora Travel</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link
            href="/admin/jadwal"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all inline-flex items-center gap-2"
            style={{ boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
          >
            <Calendar className="w-4 h-4" />
            Kelola Jadwal
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Booking */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 inline mr-0.5" />Total
            </span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{totalBooking}</p>
          <p className="text-gray-400 text-xs mt-1">Total booking</p>
        </div>

        {/* Booking Aktif */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Aktif
            </span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{bookingAktif}</p>
          <p className="text-gray-400 text-xs mt-1">{bookingSelesai} Selesai • {bookingBatal} Dibatalkan</p>
        </div>

        {/* Pendapatan */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Banknote className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Revenue
            </span>
          </div>
          <p className="text-2xl font-extrabold text-green-600">{formatRupiah(totalPendapatan)}</p>
          <p className="text-gray-400 text-xs mt-1">Pendapatan tercatat</p>
        </div>

        {/* Armada & Jadwal */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Operasional
            </span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{armadaAktif}</p>
          <p className="text-gray-400 text-xs mt-1">{jadwalAktif} jadwal aktif</p>
        </div>

        {/* Total User */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
              Member
            </span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{totalUser}</p>
          <p className="text-gray-400 text-xs mt-1">Total user terdaftar</p>
        </div>
      </div>

      {/* Chart Pendapatan */}
      <div className="mb-6">
        <PendapatanChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Booking Terbaru — 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Booking Terbaru
            </h3>
            <Link href="/admin/bookings" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBookings.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">Belum ada booking</div>
            ) : (
              recentBookings.map((b) => (
                <div key={b.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Plane className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{b.user?.name || "—"}</p>
                      <p className="text-gray-400 text-xs truncate">{b.jadwal?.rute || b.tipeTrip} • {b.jumlahKursi} kursi</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-bold text-gray-900 text-sm">{formatRupiah(b.totalHarga)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      b.status === "DIKONFIRMASI" ? "bg-green-50 text-green-700" :
                      b.status === "SELESAI" ? "bg-gray-100 text-gray-600" :
                      b.status === "DIBATALKAN" ? "bg-red-50 text-red-600" :
                      b.status === "PENDING_PAYMENT" || b.status === "PENDING" ? "bg-orange-50 text-orange-600" :
                      b.status === "PAID" ? "bg-blue-50 text-blue-700" :
                      "bg-amber-50 text-amber-600"
                    }`}>
                      {b.status === "DIKONFIRMASI" ? "Terkonfirmasi" :
                       b.status === "PENDING_PAYMENT" || b.status === "PENDING" ? "Menunggu Bayar" :
                       b.status === "PAID" ? "Sudah Bayar" :
                       b.status === "MENUNGGU_KUOTA" ? "Menunggu Kuota" :
                       b.status === "BERANGKAT" ? "Berangkat" :
                       b.status === "SELESAI" ? "Selesai" :
                       b.status === "DIBATALKAN" ? "Dibatalkan" : b.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Kuota — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Kuota Jadwal
            </h3>
            <Link href="/admin/jadwal" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {allJadwals.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Belum ada jadwal aktif</p>
            ) : (
              allJadwals.map((jadwal) => {
                const pct = Math.round((jadwal.terisi / jadwal.kapasitas) * 100);
                const isPenuh = jadwal.terisi >= jadwal.kapasitas;
                const isReady = jadwal.terisi >= jadwal.minKuota;
                return (
                  <div key={jadwal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{jadwal.rute}</p>
                        <p className="text-gray-400 text-xs">{jadwal.tipe} • {jadwal.jamBerangkat}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                        isPenuh ? "bg-red-50 text-red-600" :
                        isReady ? "bg-green-50 text-green-600" :
                        "bg-amber-50 text-amber-600"
                      }`}>
                        {isPenuh ? "Penuh" : isReady ? "Siap" : "Mengisi"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isPenuh ? "bg-red-500" : isReady ? "bg-green-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-400 w-10 text-right shrink-0">
                        {jadwal.terisi}/{jadwal.kapasitas}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
        {[
          { href: "/admin/jadwal", icon: Calendar, label: "Jadwal", desc: "Tambah & edit jadwal", color: "blue" },
          { href: "/admin/bookings", icon: ClipboardList, label: "Bookings", desc: "Kelola pesanan", color: "green" },
          { href: "/admin/armada", icon: Car, label: "Armada", desc: "Kelola kendaraan", color: "purple" },
          { href: "/admin/users", icon: Users, label: "Users", desc: "Kelola pengguna", color: "cyan" },
          { href: "/admin/laporan", icon: BarChart3, label: "Laporan", desc: "Rekap pendapatan", color: "amber" },
        ].map((item) => {
          const Icon = item.icon;
          const colorClasses: Record<string, string> = {
            blue: "bg-blue-50 text-blue-600",
            green: "bg-green-50 text-green-600",
            purple: "bg-purple-50 text-purple-600",
            cyan: "bg-cyan-50 text-cyan-600",
            gray: "bg-gray-100 text-gray-600",
            amber: "bg-amber-50 text-amber-600",
          };
          return (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorClasses[item.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{item.label}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
