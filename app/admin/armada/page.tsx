// app/admin/armada/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit, Trash2, RefreshCw, Car, Users,
  Hash, ChevronDown, X, Eye, Calendar,
  Clock, DollarSign, MapPin, AlertTriangle,
} from "lucide-react";

const HARI_LIST = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"] as const;
const HARI_LABEL: Record<string, string> = {
  SENIN: "Senin", SELASA: "Selasa", RABU: "Rabu", KAMIS: "Kamis",
  JUMAT: "Jumat", SABTU: "Sabtu", MINGGU: "Minggu",
};

const STATUS_OPTIONS = [
  { value: "STANDBY", label: "Standby", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "DALAM_PERJALANAN", label: "Perjalanan", color: "bg-primary-light text-primary-dark border-blue-200" },
  { value: "MAINTENANCE", label: "Maintenance", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "TIDAK_AKTIF", label: "Tidak Aktif", color: "bg-red-50 text-red-700 border-red-200" },
];

function getStatusStyle(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status)?.color ?? "bg-gray-50 text-gray-700 border-gray-200";
}
function getStatusLabel(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status)?.label ?? status;
}

interface Armada {
  id: string;
  nama: string;
  platNomor: string;
  tipe: string;
  kapasitas: number;
  foto: string | null;
  status: string;
  aktif: boolean;
  createdAt: string;
  _count?: { jadwals: number };
  jadwals?: {
    id: string;
    rute: string;
    tipe: string;
    hari: string;
    jamBerangkat: string;
    aktif: boolean;
  }[];
}

export default function AdminArmadaPage() {
  const [armadas, setArmadas] = useState<Armada[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Armada | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState("");
  const [detailOpen, setDetailOpen] = useState<string | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({ nama: "", platNomor: "", tipe: "MPV", kapasitas: "4", status: "STANDBY", aktif: true });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/armada");
      const data = await res.json();
      setArmadas(data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const totalArmada = armadas.length;
  const standbyCount = armadas.filter(a => a.status === "STANDBY").length;
  const perjalananCount = armadas.filter(a => a.status === "DALAM_PERJALANAN").length;
  const maintenanceCount = armadas.filter(a => a.status === "MAINTENANCE").length;

  function handleAdd() {
    setForm({ nama: "", platNomor: "", tipe: "MPV", kapasitas: "4", status: "STANDBY", aktif: true });
    setFormError("");
    setEditData(null);
    setModalOpen(true);
  }

  function handleEdit(a: Armada) {
    setForm({ nama: a.nama, platNomor: a.platNomor, tipe: a.tipe, kapasitas: String(a.kapasitas), status: a.status, aktif: a.aktif });
    setFormError("");
    setEditData(a);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const url = editData ? `/api/admin/armada/${editData.id}` : "/api/admin/armada";
    const method = editData ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kapasitas: Number(form.kapasitas) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/armada/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading("");
      setDeleteConfirm(null);
    }
  }

  async function handleToggleAktif(a: Armada) {
    setActionLoading(a.id);
    try {
      const res = await fetch(`/api/admin/armada/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktif: !a.aktif }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading("");
    }
  }

  async function handleStatusChange(id: string, status: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/armada/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading("");
      setStatusDropdown(null);
    }
  }

  // Jadwal CRUD state
  const [armadaJadwals, setArmadaJadwals] = useState<any[]>([]);
  const [jadwalModal, setJadwalModal] = useState<{ type: "add" | "edit"; hari?: string; jadwal?: any } | null>(null);
  const [jadwalForm, setJadwalForm] = useState({ rute: "", tipe: "ANTAR", jamBerangkat: "08:00", harga: "50000" });
  const [jadwalFormLoading, setJadwalFormLoading] = useState(false);
  const [jadwalFormError, setJadwalFormError] = useState("");
  const [jadwalDeleteConfirm, setJadwalDeleteConfirm] = useState<string | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
  const [jadwalLoading, setJadwalLoading] = useState(false);

  async function handleOpenDetail(a: Armada) {
    setDetailOpen(a.id);
    setJadwalLoading(true);
    try {
      const res = await fetch(`/api/admin/armada/${a.id}/jadwal`);
      const data = await res.json();
      setArmadaJadwals(data.data || []);
    } catch (err) {
      console.error(err);
      setArmadaJadwals([]);
    } finally {
      setJadwalLoading(false);
    }
  }

  async function handleAddJadwal(e: React.FormEvent) {
    e.preventDefault();
    if (!detailOpen || !jadwalModal) return;
    setJadwalFormLoading(true);
    setJadwalFormError("");

    try {
      const res = await fetch(`/api/admin/armada/${detailOpen}/jadwal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jadwalForm,
          hari: jadwalModal.hari,
          harga: Number(jadwalForm.harga),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah jadwal");
      setJadwalModal(null);
      await handleOpenDetail({ id: detailOpen } as Armada);
      await fetchData();
    } catch (err: any) {
      setJadwalFormError(err.message);
    } finally {
      setJadwalFormLoading(false);
    }
  }

  async function handleEditJadwal(e: React.FormEvent) {
    e.preventDefault();
    if (!jadwalModal?.jadwal) return;
    setJadwalFormLoading(true);
    setJadwalFormError("");

    try {
      const res = await fetch(`/api/admin/jadwal/${jadwalModal.jadwal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jadwalForm,
          harga: Number(jadwalForm.harga),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal update jadwal");
      setJadwalModal(null);
      await handleOpenDetail({ id: detailOpen } as Armada);
      await fetchData();
    } catch (err: any) {
      setJadwalFormError(err.message);
    } finally {
      setJadwalFormLoading(false);
    }
  }

  async function handleDeleteJadwal(jadwalId: string) {
    try {
      const res = await fetch(`/api/admin/jadwal/${jadwalId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal hapus jadwal");
      setJadwalDeleteConfirm(null);
      await handleOpenDetail({ id: detailOpen } as Armada);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function openAddJadwal(hari: string) {
    setJadwalForm({ rute: "", tipe: "ANTAR", jamBerangkat: "08:00", harga: "50000" });
    setJadwalFormError("");
    setJadwalModal({ type: "add", hari });
  }

  function openEditJadwal(j: any) {
    setJadwalForm({
      rute: j.rute,
      tipe: j.tipe,
      jamBerangkat: j.jamBerangkat,
      harga: String(j.harga),
    });
    setJadwalFormError("");
    setJadwalModal({ type: "edit", jadwal: j });
  }

  function toggleDay(day: string) {
    setCollapsedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  function resetJadwalModal() {
    setJadwalModal(null);
    setJadwalFormError("");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Kelola Armada</h1>
          <p className="text-gray-500 text-sm mt-0.5">{totalArmada} armada terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleAdd}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all inline-flex items-center gap-2"
            style={{ boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }}
          >
            <Plus className="w-4 h-4" />
            Tambah Armada
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{totalArmada}</p>
            <p className="text-xs text-gray-500">Total Armada</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{standbyCount}</p>
            <p className="text-xs text-gray-500">Standby</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{perjalananCount}</p>
            <p className="text-xs text-gray-500">Perjalanan</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{maintenanceCount}</p>
            <p className="text-xs text-gray-500">Maintenance</p>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : armadas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Car className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Belum ada armada. Klik &quot;Tambah Armada&quot; untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {armadas.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-visible">
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{a.nama}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{a.tipe}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {/* Status dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setStatusDropdown(statusDropdown === a.id ? null : a.id)}
                      disabled={actionLoading === a.id}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${getStatusStyle(a.status)}`}
                    >
                      {getStatusLabel(a.status)}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {statusDropdown === a.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setStatusDropdown(null)} />
                        <div className="absolute top-full left-0 mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px]">
                          {STATUS_OPTIONS.map(s => (
                            <button
                              key={s.value}
                              onClick={() => a.status !== s.value && handleStatusChange(a.id, s.value)}
                              className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 ${a.status === s.value ? "text-primary" : "text-gray-600"}`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${s.color.split(" ")[0].replace("50", "500")}`} />
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleAktif(a)}
                    disabled={actionLoading === a.id}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ml-auto ${
                      a.aktif ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {a.aktif ? "Aktif" : "Nonaktif"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Hash className="w-3.5 h-3.5" />
                    <span className="font-mono text-xs">{a.platNomor}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs">{a.kapasitas} kursi</span>
                  </div>
                </div>

                {/* Jadwal count */}
                {(a._count?.jadwals ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs">{a._count?.jadwals} jadwal aktif</span>
                  </div>
                )}

                {/* Return estimate */}
                {a.status === "DALAM_PERJALANAN" && (a as any).returnAt && (
                  <div className="flex items-center gap-1.5 mt-2 text-cyan-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                      Est. kembali: {new Date((a as any).returnAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-1 rounded-b-2xl">
                <button
                  onClick={() => handleOpenDetail(a)}
                  className="p-2 rounded-lg hover:bg-primary-light text-primary transition-colors"
                  title="Detail Jadwal"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(a)}
                  className="p-2 rounded-lg hover:bg-primary-light text-primary transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {deleteConfirm === a.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={actionLoading === a.id}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-2 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-100"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(a.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Jadwal Modal — CRUD per hari */}
      {detailOpen && (() => {
        const armada = armadas.find(a => a.id === detailOpen);
        if (!armada) return null;

        // Group jadwals by hari
        const grouped: Record<string, any[]> = {};
        for (const h of HARI_LIST) {
          grouped[h] = armadaJadwals.filter(j => j.hari === h);
        }
        const totalJadwals = armadaJadwals.length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailOpen(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Jadwal Armada</h2>
                  <p className="text-sm text-gray-500">{armada.nama} — {armada.platNomor} • {totalJadwals} jadwal</p>
                </div>
                <button onClick={() => setDetailOpen(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto flex-1">
                {jadwalLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {HARI_LIST.map(hari => {
                      const jadwals = grouped[hari];
                      const isCollapsed = collapsedDays.has(hari);
                      return (
                        <div key={hari} className="border border-gray-100 rounded-xl overflow-hidden">
                          {/* Day Header */}
                          <div
                            className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100/70 transition-colors"
                            onClick={() => toggleDay(hari)}
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="font-bold text-sm text-gray-700">{HARI_LABEL[hari]}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary">
                                {jadwals.length} jadwal
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); openAddJadwal(hari); }}
                                className="p-1.5 rounded-lg hover:bg-primary-light text-primary transition-colors"
                                title="Tambah jadwal"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`} />
                            </div>
                          </div>

                          {/* Day Content */}
                          {!isCollapsed && (
                            <div className="divide-y divide-gray-50">
                              {jadwals.length === 0 ? (
                                <div className="px-4 py-6 text-center">
                                  <p className="text-gray-400 text-xs">Belum ada jadwal di hari ini.</p>
                                  <button
                                    onClick={() => openAddJadwal(hari)}
                                    className="mt-2 text-xs font-semibold text-primary hover:text-primary-dark"
                                  >
                                    + Tambah jadwal
                                  </button>
                                </div>
                              ) : (
                                jadwals.map(j => (
                                  <div key={j.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-gray-900 text-sm">{j.rute}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${j.tipe === "ANTAR" ? "bg-primary-light text-primary" : "bg-purple-50 text-purple-600"}`}>
                                          {j.tipe}
                                        </span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${j.aktif ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                          {j.aktif ? "Aktif" : "Nonaktif"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                          <Clock className="w-3 h-3" /> {j.jamBerangkat}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                          <DollarSign className="w-3 h-3" /> Rp {j.harga.toLocaleString("id-ID")}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => openEditJadwal(j)}
                                        className="p-1.5 rounded-lg hover:bg-primary-light text-gray-400 hover:text-primary transition-colors"
                                        title="Edit"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      {jadwalDeleteConfirm === j.id ? (
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handleDeleteJadwal(j.id)}
                                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                            title="Konfirmasi hapus"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => setJadwalDeleteConfirm(null)}
                                            className="px-1.5 py-1 rounded-lg text-[10px] text-gray-500 hover:bg-gray-100"
                                          >
                                            Batal
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setJadwalDeleteConfirm(j.id)}
                                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                          title="Hapus"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add/Edit Jadwal Modal */}
      {jadwalModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetJadwalModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {jadwalModal.type === "add" ? "Tambah Jadwal" : "Edit Jadwal"}
                {jadwalModal.hari && <span className="text-sm font-normal text-gray-500 ml-2">— {HARI_LABEL[jadwalModal.hari]}</span>}
              </h3>
              <button onClick={resetJadwalModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={jadwalModal.type === "add" ? handleAddJadwal : handleEditJadwal} className="p-5 space-y-4">
              {jadwalFormError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {jadwalFormError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rute</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={jadwalForm.rute}
                    onChange={e => setJadwalForm({ ...jadwalForm, rute: e.target.value })}
                    placeholder="cth: Padang → Bukittinggi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tipe</label>
                  <select
                    value={jadwalForm.tipe}
                    onChange={e => setJadwalForm({ ...jadwalForm, tipe: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    <option value="ANTAR">Antar</option>
                    <option value="JEMPUT">Jemput</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jam Berangkat</label>
                  <input
                    type="time"
                    required
                    value={jadwalForm.jamBerangkat}
                    onChange={e => setJadwalForm({ ...jadwalForm, jamBerangkat: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="5000"
                  value={jadwalForm.harga}
                  onChange={e => setJadwalForm({ ...jadwalForm, harga: e.target.value })}
                  placeholder="50000"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetJadwalModal}
                  disabled={jadwalFormLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={jadwalFormLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-95"
                >
                  {jadwalFormLoading ? "Menyimpan..." : jadwalModal.type === "add" ? "Tambah" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editData ? "Edit Armada" : "Tambah Armada Baru"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Kendaraan *</label>
                <input
                  type="text" required placeholder="cth: Toyota Innova"
                  value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Plat Nomor *</label>
                <input
                  type="text" required placeholder="cth: BA 1234 XX"
                  value={form.platNomor} onChange={(e) => setForm({ ...form, platNomor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe</label>
                  <select
                    value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                  >
                    <option value="MPV">MPV</option>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Minibus">Minibus</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kapasitas</label>
                  <input
                    type="number" min="1" max="20"
                    value={form.kapasitas} onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status Armada</label>
                <select
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
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
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark disabled:opacity-50">
                  {formLoading ? "Menyimpan..." : editData ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
