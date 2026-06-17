// components/admin/jadwal-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Plus, Save, Plane, Home } from "lucide-react";

interface Armada {
  id: string;
  nama: string;
  platNomor: string;
}

interface Jadwal {
  id: string;
  tipe: string;
  asal: string;
  tujuan: string;
  bandara: string;
  hari: string;
  jamBerangkat: string;
  harga: number;
  kapasitas: number;
  minKuota: number;
  estimasiWaktu: string;
  armadaId: string | null;
  aktif: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Jadwal | null;
  armadaList: Armada[];
}

const HARI_OPTIONS = [
  { value: "SENIN", label: "Senin" },
  { value: "SELASA", label: "Selasa" },
  { value: "RABU", label: "Rabu" },
  { value: "KAMIS", label: "Kamis" },
  { value: "JUMAT", label: "Jumat" },
  { value: "SABTU", label: "Sabtu" },
  { value: "MINGGU", label: "Minggu" },
];

export default function JadwalModal({ isOpen, onClose, onSuccess, editData, armadaList }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    tipe: "ANTAR",
    asal: "",
    tujuan: "",
    bandara: "",
    hari: "SENIN",
    jamBerangkat: "",
    harga: "",
    kapasitas: "4",
    minKuota: "1",
    estimasiWaktu: "",
    armadaId: "",
    aktif: true,
  });

  useEffect(() => {
    if (editData) {
      setForm({
        tipe: editData.tipe,
        asal: editData.asal,
        tujuan: editData.tujuan,
        bandara: editData.bandara,
        hari: editData.hari || "SENIN",
        jamBerangkat: editData.jamBerangkat,
        harga: String(editData.harga),
        kapasitas: String(editData.kapasitas),
        minKuota: String(editData.minKuota),
        estimasiWaktu: editData.estimasiWaktu,
        armadaId: editData.armadaId || "",
        aktif: editData.aktif,
      });
    } else {
      setForm({
        tipe: "ANTAR", asal: "", tujuan: "", bandara: "", hari: "SENIN",
        jamBerangkat: "", harga: "", kapasitas: "4", minKuota: "1",
        estimasiWaktu: "", armadaId: "", aktif: true,
      });
    }
    setError("");
  }, [editData, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = editData
      ? `/api/admin/jadwal/${editData.id}`
      : "/api/admin/jadwal";
    const method = editData ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          harga: Number(form.harga),
          kapasitas: Number(form.kapasitas),
          minKuota: Number(form.minKuota),
          armadaId: form.armadaId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {editData ? <Save className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
            {editData ? "Edit Jadwal" : "Tambah Jadwal Baru"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Tipe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe Perjalanan *</label>
            <div className="grid grid-cols-2 gap-2">
              {["ANTAR", "JEMPUT"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, tipe: t })}
                  className={`py-2.5 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.tipe === t
                      ? t === "ANTAR"
                        ? "border-primary bg-primary-light text-primary-dark"
                        : "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {t === "ANTAR" ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Plane className="w-4 h-4" /> ANTAR ke Bandara
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <Home className="w-4 h-4" /> JEMPUT dari Bandara
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hari — PENTING: jadwal per hari */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hari *</label>
            <select
              value={form.hari}
              onChange={(e) => setForm({ ...form, hari: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
            >
              {HARI_OPTIONS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Jadwal ini akan berlaku setiap hari {HARI_OPTIONS.find(h => h.value === form.hari)?.label} secara rutin</p>
          </div>

          {/* Asal & Tujuan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Asal *</label>
              <input
                type="text"
                required
                placeholder="cth: Bukittinggi"
                value={form.asal}
                onChange={(e) => setForm({ ...form, asal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tujuan *</label>
              <input
                type="text"
                required
                placeholder="cth: Bandara SPT"
                value={form.tujuan}
                onChange={(e) => setForm({ ...form, tujuan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Bandara */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bandara / Lokasi Spesifik</label>
            <input
              type="text"
              placeholder="cth: Bandara Sisingamangaraja (BTU)"
              value={form.bandara}
              onChange={(e) => setForm({ ...form, bandara: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Jam & Harga */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jam Berangkat *</label>
              <input
                type="time"
                required
                value={form.jamBerangkat}
                onChange={(e) => setForm({ ...form, jamBerangkat: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga (Rp) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="80000"
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Kapasitas & Min Kuota */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kapasitas</label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.kapasitas}
                onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min. Kuota</label>
              <input
                type="number"
                min="1"
                value={form.minKuota}
                onChange={(e) => setForm({ ...form, minKuota: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Estimasi Waktu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estimasi Waktu</label>
            <input
              type="text"
              placeholder="cth: 45 menit"
              value={form.estimasiWaktu}
              onChange={(e) => setForm({ ...form, estimasiWaktu: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Armada — opsional, bisa di-assign nanti */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Armada</label>
            <select
              value={form.armadaId}
              onChange={(e) => setForm({ ...form, armadaId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
            >
              <option value="">— Belum ditentukan (admin assign nanti) —</option>
              {armadaList.map((a) => (
                <option key={a.id} value={a.id}>{a.nama} ({a.platNomor})</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Armada bisa di-assign kapan saja sebelum keberangkatan</p>
          </div>

          {/* Aktif toggle */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-semibold text-gray-700">Status Aktif</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, aktif: !form.aktif })}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.aktif ? "bg-primary" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.aktif ? "translate-x-6" : ""}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : editData ? "Simpan Perubahan" : "Tambah Jadwal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
