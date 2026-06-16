// app/admin/users/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, User, Mail, Phone, Calendar,
  ChevronDown, ChevronUp, Search, Shield, UserCog,
  Plus, Pencil, Trash2, X, Save,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { bookings: number };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [modal, setModal] = useState<{ type: "create" | "edit"; user?: UserData } | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalRegular = users.filter((u) => u.role === "USER").length;

  function openCreate() {
    setModal({ type: "create" });
  }

  function openEdit(user: UserData) {
    setModal({ type: "edit", user });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!modal) return;

    setFormLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload: any = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || null,
      role: formData.get("role"),
    };
    const password = formData.get("password") as string;
    if (password) payload.password = password;

    try {
      let res: Response;
      if (modal.type === "create") {
        res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/users/${modal.user!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      setModal(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal hapus");
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Kelola Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{totalUsers} total user</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tambah User
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{totalUsers}</p>
              <p className="text-gray-400 text-xs">Total User</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{totalAdmins}</p>
              <p className="text-gray-400 text-xs">Admin</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <UserCog className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{totalRegular}</p>
              <p className="text-gray-400 text-xs">Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "USER", "ADMIN"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                roleFilter === role
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {role === "ALL" ? "Semua" : role === "ADMIN" ? "Admin" : "Member"}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">Tidak ada user ditemukan.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-3">User</div>
            <div className="col-span-3">Kontak</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Bergabung</div>
            <div className="col-span-1 text-center">Booking</div>
            <div className="col-span-1 text-right">Aksi</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {filtered.map((u) => (
              <UserRow key={u.id} user={u} onEdit={openEdit} onDelete={(id) => setDeleteConfirm(id)} />
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !formLoading && setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {modal.type === "create" ? "Tambah User Baru" : "Edit User"}
              </h2>
              <button
                onClick={() => !formLoading && setModal(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={modal.user?.name || ""}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={modal.user?.email || ""}
                  placeholder="contoh@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">No. Telepon</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={modal.user?.phone || ""}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password {modal.type === "edit" && <span className="font-normal text-gray-400">(kosongkan jika tidak diubah)</span>}
                </label>
                <input
                  name="password"
                  type="password"
                  required={modal.type === "create"}
                  placeholder={modal.type === "create" ? "Minimal 6 karakter" : "••••••••"}
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  defaultValue={modal.user?.role || "USER"}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                >
                  <option value="USER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !formLoading && setModal(null)}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  {formLoading ? "Menyimpan..." : modal.type === "create" ? "Tambah" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Hapus User?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              User yang sudah dihapus tidak bisa dikembalikan. Pastikan user ini tidak memiliki booking aktif.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all active:scale-95"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, onEdit, onDelete }: { user: UserData; onEdit: (u: UserData) => void; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="transition-colors hover:bg-gray-50/50">
      {/* Desktop Row */}
      <div
        className="hidden sm:grid grid-cols-12 gap-4 px-5 py-4 items-center"
      >
        <div className="col-span-3 flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
            expanded ? "bg-blue-100 scale-110" : "bg-blue-50"
          }`}>
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
            <p className="text-gray-400 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <div className="col-span-3 text-sm text-gray-600 truncate">
          {user.phone || "—"}
        </div>
        <div className="col-span-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            user.role === "ADMIN"
              ? "bg-purple-50 text-purple-700"
              : "bg-green-50 text-green-700"
          }`}>
            {user.role === "ADMIN" ? "Admin" : "Member"}
          </span>
        </div>
        <div className="col-span-2 text-sm text-gray-500">
          {formatDate(user.createdAt)}
        </div>
        <div className="col-span-1 text-center">
          <span className="text-sm font-semibold text-gray-900">{user._count.bookings}</span>
        </div>
        <div className="col-span-1 flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(user)}
            className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Card */}
      <div
        className="sm:hidden px-5 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
              expanded ? "bg-blue-100 scale-110" : "bg-blue-50"
            }`}>
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(user); }}
              className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(user.id); }}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Detail */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: expanded ? 200 : 0,
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="px-5 pb-4 pt-2 border-t border-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {user.phone || "Tidak ada nomor"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              Bergabung {formatDate(user.createdAt)}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-400">Total booking:</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {user._count.bookings} booking
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
