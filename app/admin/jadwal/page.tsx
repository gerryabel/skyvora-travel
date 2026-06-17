// app/admin/jadwal/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save, RefreshCw, Clock, Car, AlertTriangle, CalendarDays,
  Check, X, ToggleLeft, ToggleRight, Search,
} from "lucide-react";

interface Armada {
  id: string;
  nama: string;
  platNomor: string;
}

interface Jadwal {
  id: string;
  tipe: string;
  rute: string;
  asal: string;
  tujuan: string;
  bandara: string;
  hari: string;
  jamBerangkat: string;
  harga: number;
  kapasitas: number;
  terisi: number;
  minKuota: number;
  estimasiWaktu: number;
  armadaId: string | null;
  aktif: boolean;
  armada: { nama: string; platNomor: string } | null;
}

const HARI_LABELS: Record<string, string> = {
  SENIN: "Senin",
  SELASA: "Selasa",
  RABU: "Rabu",
  KAMIS: "Kamis",
  JUMAT: "Jumat",
  SABTU: "Sabtu",
  MINGGU: "Minggu",
};

const HARI_ORDER = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"];

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

const hariID = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];

function PaginationControls({ currentPage, totalPages, totalItems, onChange }: {
  currentPage: number; totalPages: number; totalItems: number; onChange: (p: number) => void;
}) {
  const startItem = (currentPage - 1) * 25 + 1;
  const endItem = Math.min(currentPage * 25, totalItems);

  // Generate page numbers with ellipsis
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-gray-400">
        Menampilkan {totalItems === 0 ? 0 : startItem}–{endItem} dari {totalItems} jadwal
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Sebelumnya
        </button>
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                p === currentPage
                  ? "bg-primary text-white"
                  : "border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}

export default function AdminJadwalPage() {
  const [jadwals, setJadwals] = useState<Jadwal[]>([]);
  const [armadaList, setArmadaList] = useState<Armada[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterHari, setFilterHari] = useState("ALL");
  const [actionLoading, setActionLoading] = useState("");
  const [editJamId, setEditJamId] = useState<string | null>(null);
  const [editJamValue, setEditJamValue] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jadRes, armRes] = await Promise.all([
        fetch("/api/admin/jadwal"),
        fetch("/api/admin/armada"),
      ]);
      const jadData = await jadRes.json();
      const armData = await armRes.json();
      setJadwals(jadData.data || []);
      setArmadaList(armData.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleToggleAktif(j: Jadwal) {
    setActionLoading(j.id);
    try {
      const res = await fetch(`/api/admin/jadwal/${j.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktif: !j.aktif }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  }

  function startEditJam(j: Jadwal) {
    setEditJamId(j.id);
    setEditJamValue(j.jamBerangkat);
  }

  function cancelEditJam() {
    setEditJamId(null);
    setEditJamValue("");
  }

  async function saveJam(id: string) {
    if (!editJamValue || !editJamValue.match(/^\d{2}:\d{2}$/)) {
      alert("Format jam harus HH:MM, contoh: 08:30");
      return;
    }
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/jadwal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jamBerangkat: editJamValue }),
      });
      if (!res.ok) throw new Error("Gagal mengubah jam");
      setEditJamId(null);
      setEditJamValue("");
      setSaveSuccess(id);
      setTimeout(() => setSaveSuccess(""), 2000);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  // Group jadwals by hari, then filter by search
  const jadwalByHari = HARI_ORDER.reduce((acc, hari) => {
    let items = jadwals.filter((j) => j.hari === hari);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (j) =>
          j.rute.toLowerCase().includes(q) ||
          j.asal.toLowerCase().includes(q) ||
          j.tujuan.toLowerCase().includes(q)
      );
    }
    acc[hari] = items;
    return acc;
  }, {} as Record<string, Jadwal[]>);

  const filteredHariList = filterHari === "ALL" ? HARI_ORDER : [filterHari];

  // Flat list for current view (for pagination)
  const visibleItems = filterHari === "ALL"
    ? filteredHariList.flatMap((hari) => jadwalByHari[hari] || [])
    : (jadwalByHari[filterHari] || []);

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = visibleItems.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Reset to page 1 when filter/search changes
  useEffect(() => { setCurrentPage(1); }, [filterHari, searchQuery]);

  function renderJadwalRow(j: Jadwal, showHari = false) {
    const pct = j.kapasitas > 0 ? Math.round((j.terisi / j.kapasitas) * 100) : 0;
    const isPenuh = j.terisi >= j.kapasitas;
    const isEditing = editJamId === j.id;
    const isSaved = saveSuccess === j.id;
    return (
      <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
        {showHari && (
          <td className="px-5 py-4">
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{HARI_LABELS[j.hari]}</span>
          </td>
        )}
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${j.tipe === "ANTAR" ? "bg-primary-light text-primary" : "bg-purple-50 text-purple-600"}`}>{j.tipe}</span>
            <span className="font-semibold text-gray-900 text-sm">{j.rute}</span>
          </div>
        </td>
        <td className="px-5 py-4">
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <input type="time" value={editJamValue} onChange={(e) => setEditJamValue(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-24 focus:border-primary focus:outline-none" autoFocus />
              <button onClick={() => saveJam(j.id)} disabled={actionLoading === j.id} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Simpan"><Check className="w-4 h-4" /></button>
              <button onClick={cancelEditJam} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors" title="Batal"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className={`font-bold text-sm ${isSaved ? "text-green-600" : "text-primary"}`}>{j.jamBerangkat}</span>
              {isSaved && <Check className="w-3.5 h-3.5 text-green-500" />}
              <button onClick={() => startEditJam(j)} className="p-1 rounded hover:bg-primary-light text-gray-400 hover:text-primary transition-colors ml-1" title="Ubah jam"><Clock className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </td>
        <td className="px-5 py-4 text-sm font-bold text-gray-900">{formatRupiah(j.harga)}</td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16"><div className={`h-1.5 rounded-full ${isPenuh ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
            <span className="text-xs font-mono text-gray-500">{j.terisi}/{j.kapasitas}</span>
          </div>
        </td>
        <td className="px-5 py-4">
          {j.armada ? (<div className="flex items-center gap-1.5 text-sm text-gray-600"><Car className="w-3.5 h-3.5 text-gray-400" />{j.armada.nama}</div>) : (<span className="text-amber-500 text-xs font-medium">Belum ditentukan</span>)}
        </td>
        <td className="px-5 py-4">
          <button onClick={() => handleToggleAktif(j)} disabled={actionLoading === j.id} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${j.aktif ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
            {j.aktif ? <><ToggleRight className="w-4 h-4" />Aktif</> : <><ToggleLeft className="w-4 h-4" />Nonaktif</>}
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Kelola Jadwal</h1>
          <p className="text-gray-500 text-sm mt-0.5">{jadwals.length} jadwal terdaftar — edit waktu per hari</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all self-start"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Hari */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari rute, asal, tujuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition"
          />
        </div>

        {/* Hari tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterHari("ALL")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              filterHari === "ALL" ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            Semua Hari
          </button>
          {HARI_ORDER.map((hari) => (
            <button
              key={hari}
              onClick={() => setFilterHari(hari)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filterHari === hari ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {HARI_LABELS[hari]} ({jadwalByHari[hari]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Jadwal List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="h-6 bg-gray-100 rounded w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-12 bg-gray-50 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filterHari !== "ALL" ? (
        /* Flat list untuk hari spesifik */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-gray-900">{HARI_LABEL[filterHari]}</h3>
              <span className="text-xs text-gray-400">({visibleItems.length} jadwal)</span>
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-gray-400 text-sm">Tidak ada jadwal untuk hari ini</p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rute</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jam</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kuota</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Armada</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedItems.map((j) => renderJadwalRow(j))}
                </tbody>
              </table>
            </div>
            <PaginationControls currentPage={safePage} totalPages={totalPages} totalItems={visibleItems.length} onChange={setCurrentPage} />
            </>
          )}
        </div>
      ) : (
        /* Group per hari untuk "Semua Hari" — flat paged list */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-gray-900">Semua Hari</h3>
              <span className="text-xs text-gray-400">({visibleItems.length} jadwal)</span>
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-gray-400 text-sm">Tidak ada jadwal</p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hari</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rute</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jam</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kuota</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Armada</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedItems.map((j) => renderJadwalRow(j, true))}
                </tbody>
              </table>
            </div>
            <PaginationControls currentPage={safePage} totalPages={totalPages} totalItems={visibleItems.length} onChange={setCurrentPage} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
