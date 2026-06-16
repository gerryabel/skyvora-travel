// app/admin/bookings/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw, CheckCircle, XCircle, Eye, Clock,
  MapPin, User, Phone, Mail, ChevronDown, ChevronUp,
} from "lucide-react";

function ExpandableContent({ isExpanded, children }: { isExpanded: boolean; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
      const timer = setTimeout(() => setHeight(0), 300);
      return () => clearTimeout(timer);
    } else {
      setHeight(0);
    }
  }, [isExpanded]);

  return (
    <div
      ref={contentRef}
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: height === 0 && !isExpanded ? 0 : height || "none", opacity: isExpanded ? 1 : 0 }}
    >
      <div className="px-5 pb-5 border-t border-gray-100 pt-4">
        {children}
      </div>
    </div>
  );
}

interface Booking {
  id: string;
  status: string;
  tipeTrip: string;
  tglBerangkat: string | null;
  jumlahKursi: number;
  totalHarga: number;
  metodePembayaran: string | null;
  alamatJemput: string;
  catatan: string | null;
  createdAt: string;
  jadwal: { rute: string; bandara: string; tipe: string; hari: string; jamBerangkat: string; armada: { nama: string; platNomor: string; status: string } | null } | null;
  user: { name: string; email: string; phone: string | null } | null;
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Menunggu Bayar", color: "bg-amber-50 text-amber-700" },
  PENDING_PAYMENT: { label: "Menunggu Bayar", color: "bg-amber-50 text-amber-700" },
  PAID: { label: "Sudah Bayar", color: "bg-blue-50 text-blue-700" },
  DIKONFIRMASI: { label: "Terkonfirmasi", color: "bg-green-50 text-green-700" },
  SELESAI: { label: "Selesai", color: "bg-gray-100 text-gray-600" },
  DIBATALKAN: { label: "Dibatalkan", color: "bg-red-50 text-red-600" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      setBookings(data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAction(id: string, action: "confirm" | "cancel" | "complete") {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses");
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  }

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Kelola Bookings</h1>
          <p className="text-gray-500 text-sm mt-0.5">{bookings.length} total booking</p>
        </div>
        <button onClick={fetchData} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all self-start">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            filter === "ALL" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          Semua ({bookings.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          (statusCounts[key] || 0) > 0 && (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === key ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {cfg.label} ({statusCounts[key] || 0})
            </button>
          )
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">Tidak ada booking dengan status ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const sc = STATUS_CONFIG[b.status] || { label: b.status, color: "bg-gray-100 text-gray-600" };
            const isExpanded = expandedId === b.id;
            const canConfirm = b.status === "PENDING" || b.status === "PENDING_PAYMENT" || b.status === "MENUNGGU_KUOTA" || b.status === "PAID";
            const canCancel = b.status !== "DIBATALKAN" && b.status !== "SELESAI";

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${
                  isExpanded ? "border-blue-200 shadow-md shadow-blue-50" : "border-gray-100"
                }`}
              >
                {/* Main Row */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isExpanded ? "bg-blue-100 scale-110" : "bg-blue-50"
                      }`}>
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">{b.user?.name || "—"}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.tipeTrip === "OPEN" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                          }`}>
                            {b.tipeTrip === "OPEN" ? "Open Trip" : "Private"}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5 truncate">
                            {b.jadwal?.rute || "—"} • {b.jadwal?.hari || "—"} • {b.jadwal?.jamBerangkat || "—"} • {b.jumlahKursi} kursi
                          </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm">{formatRupiah(b.totalHarga)}</p>
                        <p className="text-gray-400 text-[10px]">
                          {b.metodePembayaran === "cash" ? "Tunai" : b.metodePembayaran || "—"}
                        </p>
                      </div>
                      <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                <ExpandableContent isExpanded={isExpanded}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data Penumpang</h4>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {b.user?.name || "—"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {b.user?.email || "—"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {b.user?.phone || "—"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {b.alamatJemput}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detail Trip</h4>
                      <div className="space-y-1.5 text-sm">
                        <p className="text-gray-600"><span className="text-gray-400">Rute:</span> {b.jadwal?.rute || "—"}</p>
                        <p className="text-gray-600"><span className="text-gray-400">Hari:</span> {b.jadwal?.hari || "—"}</p>
                        <p className="text-gray-600"><span className="text-gray-400">Jam:</span> {b.jadwal?.jamBerangkat || "—"}</p>
                        <p className="text-gray-600"><span className="text-gray-400">Kursi:</span> {b.jumlahKursi} orang</p>
                        <p className="text-gray-600"><span className="text-gray-400">Armada:</span> {b.jadwal?.armada ? `${b.jadwal.armada.nama} (${b.jadwal.armada.platNomor})` : "Belum ditentukan"}</p>
                        {b.jadwal?.armada?.status === "DALAM_PERJALANAN" && (
                          <p className="text-cyan-600 text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Armada sedang dalam perjalanan
                          </p>
                        )}
                        {b.catatan && <p className="text-gray-600"><span className="text-gray-400">Catatan:</span> {b.catatan}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {canConfirm && (
                      <button
                        onClick={() => handleAction(b.id, "confirm")}
                        disabled={actionLoading === b.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-50 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Konfirmasi
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => handleAction(b.id, "cancel")}
                        disabled={actionLoading === b.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50 active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        {b.metodePembayaran === "cash" ? "Batalkan" : "Tolak"}
                      </button>
                    )}
                    {b.status === "DIKONFIRMASI" && (
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-50 text-cyan-700 text-sm font-semibold">
                        <Clock className="w-4 h-4" />
                        Armada sedang dalam perjalanan
                      </span>
                    )}
                    {b.status === "DIKONFIRMASI" && (
                      <button
                        onClick={() => handleAction(b.id, "complete")}
                        disabled={actionLoading === b.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-600 text-white text-sm font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Selesai
                      </button>
                    )}
                  </div>
                </ExpandableContent>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
