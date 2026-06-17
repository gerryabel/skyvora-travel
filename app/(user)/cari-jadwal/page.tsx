// app/(user)/cari-jadwal/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DAFTAR_KOTA } from "@/lib/kota";
import {
  MapPin, CalendarDays, Users, Clock, ChevronRight,
  ArrowRightLeft, Search, Car, AlertCircle,
} from "lucide-react";

const hariID = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
const hariLabel: Record<string, string> = {
  SENIN: "Senin", SELASA: "Selasa", RABU: "Rabu", KAMIS: "Kamis",
  JUMAT: "Jumat", SABTU: "Sabtu", MINGGU: "Minggu",
};

function getHariFromTanggal(tanggal: string): string {
  if (!tanggal) return "";
  const d = new Date(tanggal + "T12:00:00");
  return hariID[d.getDay()];
}

const today = () => new Date().toISOString().split("T")[0];

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function JadwalCard({ j, penumpang, onPesan }: { j: any; penumpang: number; onPesan: (id: string) => void }) {
  const sisaKursi = j.kapasitas - (j.terisi || 0);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-800">{j.asal}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-medium text-gray-800">{j.tujuan}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {j.jamBerangkat}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Sisa {sisaKursi} kursi</span>
            <span className="flex items-center gap-1"><Car className="w-3 h-3" />{j.armada ? j.armada.nama : "Armada ditentukan admin"}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-primary">{formatRupiah(j.harga)}</p>
          <p className="text-[10px] text-gray-400 mb-2">per orang</p>
          <button onClick={() => onPesan(j.id)} disabled={sisaKursi < penumpang} className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white text-xs font-medium px-4 py-2 rounded-lg transition">
            {sisaKursi < penumpang ? "Penuh" : "Pesan Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CariJadwalPage() {
  const router = useRouter();
  const [asal, setAsal] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [tanggal, setTanggal] = useState(today());
  const [penumpang, setPenumpang] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jadwals, setJadwals] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const selectedHari = getHariFromTanggal(tanggal);

  const handleSwap = () => { setAsal(tujuan); setTujuan(asal); };

  const handleCari = useCallback(async () => {
    if (!asal || !tujuan || !tanggal) return;
    setLoading(true); setError(""); setSearched(true);
    try {
      const p = new URLSearchParams({ hari: selectedHari, asal, tujuan });
      const res = await fetch(`/api/jadwal?${p}`);
      const data = await res.json();
      setJadwals(data.data || []);
    } catch { setError("Gagal mengambil data jadwal"); }
    setLoading(false);
  }, [asal, tujuan, selectedHari]);

  const handlePesan = (jadwalId: string) => {
    const p = new URLSearchParams({ jadwalId, asal, tujuan, tanggal, penumpang: String(penumpang) });
    router.push(`/booking?${p.toString()}`);
  };

  useEffect(() => {
    if (asal && tujuan && tanggal && !searched) handleCari();
  }, [asal, tujuan, tanggal, searched, handleCari]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Cari Jadwal <span className="text-primary">Perjalanan</span></h1>
        <p className="text-gray-500">Pilih kota asal, tujuan, dan tanggal perjalanan</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-end mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5"><MapPin className="w-3 h-3 inline mr-1" /> Dari</label>
            <select value={asal} onChange={e => { setAsal(e.target.value); setSearched(false); }} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition">
              <option value="">Pilih kota asal...</option>
              {DAFTAR_KOTA.filter(k => k.nama !== tujuan).map(k => <option key={k.nama} value={k.nama}>{k.nama}</option>)}
            </select>
          </div>
          <button onClick={handleSwap} disabled={!asal && !tujuan} className="p-2.5 rounded-full bg-gray-100 hover:bg-primary-light hover:text-primary text-gray-400 transition self-end mb-0.5 disabled:opacity-30" title="Tukar asal & tujuan">
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5"><MapPin className="w-3 h-3 inline mr-1" /> Ke</label>
            <select value={tujuan} onChange={e => { setTujuan(e.target.value); setSearched(false); }} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition">
              <option value="">Pilih kota tujuan...</option>
              {DAFTAR_KOTA.filter(k => k.nama !== asal).map(k => <option key={k.nama} value={k.nama}>{k.nama}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5"><CalendarDays className="w-3 h-3 inline mr-1" /> Tanggal</label>
            <input type="date" value={tanggal} min={today()} onChange={e => { setTanggal(e.target.value); setSearched(false); }} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5"><Users className="w-3 h-3 inline mr-1" /> Penumpang</label>
            <select value={penumpang} onChange={e => setPenumpang(Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-light outline-none transition">
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} orang</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleCari} disabled={!asal || !tujuan || !tanggal || loading} className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white font-medium text-sm rounded-lg px-4 py-2.5 transition flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />{loading ? "Mencari..." : "Cari Jadwal"}
            </button>
          </div>
        </div>

        {selectedHari && tanggal && (
          <p className="text-xs text-gray-400 mt-3">
            Hari: <span className="font-medium text-gray-600">{hariLabel[selectedHari]}</span>
            {asal && tujuan && <span> · Rute: {asal} → {tujuan}</span>}
          </p>
        )}
      </div>

      {searched && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            {loading ? "Mencari jadwal..." : jadwals.length > 0 ? `${jadwals.length} jadwal ditemukan` : ""}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {!loading && jadwals.length === 0 && !error && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Tidak ada jadwal tersedia</p>
              <p className="text-gray-400 text-sm mt-1">Tidak ditemukan jadwal dari {asal} ke {tujuan} pada hari {hariLabel[selectedHari]}</p>
            </div>
          )}

          <div className="space-y-3">
            {jadwals.map(j => <JadwalCard key={j.id} j={j} penumpang={penumpang} onPesan={handlePesan} />)}
          </div>
        </div>
      )}
    </div>
  );
}
