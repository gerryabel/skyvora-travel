"use client";

import { useState, useEffect } from "react";
import {
  Download,
  TrendingUp,
  ClipboardList,
  Users,
  Banknote,
  Calendar,
  BarChart3,
  PieChart,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface LaporanData {
  periode: string;
  summary: {
    totalPendapatan: number;
    totalBooking: number;
    totalKursi: number;
    rataRataPerBooking: number;
  };
  chartData: { label: string; pendapatan: number; booking: number }[];
  tipeBreakdown: { tipe: string; pendapatan: number; booking: number }[];
  metodeBreakdown: { metode: string; pendapatan: number; booking: number }[];
  bookings: {
    id: string;
    user: string;
    rute: string;
    tipe: string;
    jumlahKursi: number;
    totalHarga: number;
    metodePembayaran: string;
    status: string;
    createdAt: string;
  }[];
}

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-id");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  PAID: "Sudah Bayar",
  DIKONFIRMASI: "Terkonfirmasi",
  SELESAI: "Selesai",
  PENDING_PAYMENT: "Menunggu Pembayaran",
  DIBATALKAN: "Dibatalkan",
};

export default function LaporanPage() {
  const [periode, setPeriode] = useState<"harian" | "bulanan" | "tahunan">("bulanan");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    loadData();
  }, [periode, tanggal]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/laporan?periode=${periode}&tanggal=${tanggal}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (!data) return;
    const headers = ["Tanggal", "User", "Rute", "Tipe", "Kursi", "Total", "Metode", "Status"];
    const rows = data.bookings.map((b) => [
      formatDateTime(b.createdAt),
      b.user,
      b.rute,
      b.tipe,
      b.jumlahKursi.toString(),
      b.totalHarga.toString(),
      b.metodePembayaran,
      STATUS_LABELS[b.status] || b.status,
    ]);

    const escapeCsv = (val: string) => {
      if (val.includes('"') || val.includes(",") || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvContent = [headers, ...rows]
      .map((r) => r.map(escapeCsv).join(","))
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${periode}-${tanggal}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Chart helpers
  const COLORS = ["#0ea5e9", "#f97316", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4", "#eab308"];
  const PIE_COLORS = ["#0ea5e9", "#f97316"];

  function formatChartLabel(label: string) {
    if (periode === "tahunan") return label; // "Jan 2026"
    if (periode === "bulanan") {
      // "2026-06-15" → "15 Jun"
      const parts = label.split("-");
      if (parts.length === 3) {
        const day = parseInt(parts[2]);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        return `${day} ${monthNames[parseInt(parts[1]) - 1]}`;
      }
      return label;
    }
    return label; // "08:00"
  }

  const chartDataRecharts = data
    ? data.chartData.map((d) => ({
        name: formatChartLabel(d.label),
        pendapatan: d.pendapatan,
        booking: d.booking,
      }))
    : [];

  const tipePieData = data
    ? data.tipeBreakdown.map((d) => ({
        name: d.tipe === "ANTAR" ? "Antar" : d.tipe === "JEMPUT" ? "Jemput" : d.tipe,
        value: d.pendapatan,
        booking: d.booking,
      }))
    : [];

  const metodePieData = data
    ? data.metodeBreakdown.map((d) => ({
        name: d.metode,
        value: d.pendapatan,
        booking: d.booking,
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Laporan Pendapatan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Rekap pendapatan berdasarkan periode
          </p>
        </div>
        {data && data.bookings.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Periode
            </label>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(["harian", "bulanan", "tahunan"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    periode === p
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              {periode === "tahunan" ? "Tahun" : periode === "bulanan" ? "Bulan" : "Tanggal"}
            </label>
            <input
              type={periode === "tahunan" ? "number" : periode === "bulanan" ? "month" : "date"}
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            <Filter className="w-4 h-4" />
            {loading ? "Loading..." : "Terapkan"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          Memuat data laporan...
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-gray-400">Gagal memuat data</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total Pendapatan
                </span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {formatRp(data.summary.totalPendapatan)}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total Booking
                </span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {data.summary.totalBooking}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total Kursi
                </span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {data.summary.totalKursi}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Rata-rata/Booking
                </span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {formatRp(data.summary.rataRataPerBooking)}
              </p>
            </div>
          </div>

          {data.chartData.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                Belum ada data pendapatan di periode ini
              </p>
            </div>
          ) : (
            <>
              {/* Chart Area */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Grafik Pendapatan
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartDataRecharts} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLapPendapatan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                      interval={periode === "bulanan" ? Math.floor(chartDataRecharts.length / 8) : 0}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) =>
                        v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : `${v}`
                      }
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                      formatter={(value: any, name: any) => [
                        name === "pendapatan" ? formatRp(Number(value)) : `${value} booking`,
                        name === "pendapatan" ? "Pendapatan" : "Booking",
                      ]}
                      labelStyle={{ fontWeight: 700, color: "#111" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pendapatan"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fill="url(#colorLapPendapatan)"
                      dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Tipe Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-primary" />
                    Per Tipe Perjalanan
                  </h3>
                  {tipePieData.length === 0 ? (
                    <p className="text-gray-400 text-sm">Tidak ada data</p>
                  ) : (
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                      <ResponsiveContainer width="100%" height={180}>
                        <RechartsPieChart>
                          <Pie
                            data={tipePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {tipePieData.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any) => [formatRp(Number(value)), "Pendapatan"]}
                            contentStyle={{
                              background: "#fff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 min-w-[140px]">
                        {tipePieData.map((d, i) => (
                          <div key={i} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                              />
                              <span className="text-xs text-gray-600">{d.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-gray-900">{formatRp(d.value)}</p>
                              <p className="text-[10px] text-gray-400">{d.booking} booking</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metode Pembayaran Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-green-600" />
                    Per Metode Pembayaran
                  </h3>
                  {metodePieData.length === 0 ? (
                    <p className="text-gray-400 text-sm">Tidak ada data</p>
                  ) : (
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                      <ResponsiveContainer width="100%" height={180}>
                        <RechartsPieChart>
                          <Pie
                            data={metodePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {metodePieData.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any) => [formatRp(Number(value)), "Pendapatan"]}
                            contentStyle={{
                              background: "#fff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 min-w-[140px]">
                        {metodePieData.map((d, i) => (
                          <div key={i} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ background: COLORS[i % COLORS.length] }}
                              />
                              <span className="text-xs text-gray-600 capitalize">{d.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-gray-900">{formatRp(d.value)}</p>
                              <p className="text-[10px] text-gray-400">{d.booking} booking</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detail Table Toggle */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors rounded-2xl"
                >
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    Detail Transaksi ({data.bookings.length})
                  </span>
                  <span className="text-sm text-primary font-medium">
                    {showTable ? "Sembunyikan" : "Tampilkan"}
                  </span>
                </button>
                {showTable && (
                  <div className="border-t border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Tanggal
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            User
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Rute
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Tipe
                          </th>
                          <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Kursi
                          </th>
                          <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Total
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Metode
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                              {formatDateTime(b.createdAt)}
                            </td>
                            <td className="px-6 py-3 font-medium text-gray-900">
                              {b.user}
                            </td>
                            <td className="px-6 py-3 text-gray-600">{b.rute}</td>
                            <td className="px-6 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  b.tipe === "ANTAR"
                                    ? "bg-primary-light text-primary"
                                    : b.tipe === "JEMPUT"
                                    ? "bg-accent/10 text-accent-dark"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {b.tipe === "ANTAR" ? "Antar" : b.tipe === "JEMPUT" ? "Jemput" : b.tipe}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center text-gray-600">
                              {b.jumlahKursi}
                            </td>
                            <td className="px-6 py-3 text-right font-semibold text-gray-900">
                              {formatRp(b.totalHarga)}
                            </td>
                            <td className="px-6 py-3 text-gray-600 capitalize">
                              {b.metodePembayaran}
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  b.status === "SELESAI"
                                    ? "bg-green-100 text-green-700"
                                    : b.status === "DIKONFIRMASI"
                                    ? "bg-primary-light text-primary-dark"
                                    : b.status === "PAID"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {STATUS_LABELS[b.status] || b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
