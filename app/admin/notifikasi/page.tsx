"use client";

import { useState, useEffect } from "react";
import { Send, Users, ClipboardList, AlertCircle, CheckCircle, Loader2, Megaphone } from "lucide-react";

type TargetType = "all" | "booking" | "status";

interface BookingOption {
  id: string;
  user: { name: string; email: string };
  jadwal: { rute: string };
  status: string;
}

interface StatsData {
  statuses: { status: string; count: number }[];
  totalUsers: number;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu Bayar",
  PENDING_PAYMENT: "Menunggu Pembayaran",
  PAID: "Sudah Bayar",
  DIKONFIRMASI: "Dikonfirmasi",
  BERANGKAT: "Berangkat",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

export default function NotifikasiPage() {
  const [target, setTarget] = useState<TargetType>("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedBooking, setSelectedBooking] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ succeeded: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/notifikasi?type=bookings")
      .then((r) => r.json())
      .then(setBookings)
      .catch(console.error);
    fetch("/api/admin/notifikasi?type=stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const handleSend = async () => {
    setError("");
    setResult(null);

    if (!subject.trim() || !message.trim()) {
      setError("Subject dan message wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        target,
        subject: subject.trim(),
        message: message.trim(),
      };
      if (target === "booking") body.bookingId = selectedBooking;
      if (target === "status") body.status = selectedStatus;

      const res = await fetch("/api/admin/notifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim");

      setResult({ succeeded: data.succeeded, failed: data.failed, total: data.total });
      if (data.failed > 0) {
        setError(`${data.failed} email gagal dikirim dari ${data.total} total`);
      }
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengirim notifikasi");
    } finally {
      setLoading(false);
    }
  };

  const recipientCount = target === "all"
    ? stats?.totalUsers || 0
    : target === "status"
    ? stats?.statuses.find((s) => s.status === selectedStatus)?.count || 0
    : target === "booking" && selectedBooking
    ? 1
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-blue-600" />
          Broadcast Notifikasi
        </h1>
        <p className="text-gray-500 mt-1">Kirim notifikasi email ke penumpang</p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Total Penumpang</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          {["DIKONFIRMASI", "PAID", "BERANGKAT", "SELESAI"].map((s) => (
            <div key={s} className="bg-white rounded-xl border p-4">
              <p className="text-xs text-gray-500">{STATUS_LABELS[s] || s}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.statuses.find((x) => x.status === s)?.count || 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Success */}
      {result && result.failed === 0 && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Berhasil mengirim {result.succeeded} email!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Penerima</h2>

            {/* Target Selection */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTarget("all")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition cursor-pointer ${
                  target === "all"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Semua Penumpang</span>
                {stats && (
                  <span className="text-xs">{stats.totalUsers} user</span>
                )}
              </button>
              <button
                onClick={() => setTarget("booking")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition cursor-pointer ${
                  target === "booking"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                <span className="text-sm font-medium">Per Booking</span>
              </button>
              <button
                onClick={() => setTarget("status")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition cursor-pointer ${
                  target === "status"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Per Status</span>
              </button>
            </div>

            {/* Booking selector */}
            {target === "booking" && (
              <select
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">Pilih booking...</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.user.name} — {b.jadwal.rute} ({b.user.email})
                  </option>
                ))}
              </select>
            )}

            {/* Status selector */}
            {target === "status" && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">Pilih status...</option>
                {stats?.statuses
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <option key={s.status} value={s.status}>
                      {STATUS_LABELS[s.status] || s.status} ({s.count})
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div className="bg-white rounded-xl border p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Isi Pesan</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Pengubahan Jadwal Perjalanan"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Tulis pesan notifikasi di sini..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={loading || recipientCount === 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? "Mengirim..." : `Kirim ke ${recipientCount} Penerima`}
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Preview Penerima</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Target</span>
                <span className="font-medium text-gray-900">
                  {target === "all" ? "Semua Penumpang" : target === "booking" ? "Per Booking" : "Per Status"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Jumlah Penerima</span>
                <span className="font-medium text-blue-600">{recipientCount}</span>
              </div>
              {target === "status" && selectedStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-gray-900">
                    {STATUS_LABELS[selectedStatus] || selectedStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li>• Subject yang jelas meningkatkan open rate</li>
              <li>• Pesan bisa pakai line break (Enter)</li>
              <li>• Email dikirim async, bisa kirim ke banyak penerima sekaligus</li>
              <li>• Pastikan SMTP sudah dikonfigurasi di .env</li>
            </ul>
          </div>

          {/* Recent bookings quick view */}
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Booking Terbaru</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bookings.slice(0, 10).map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setTarget("booking");
                    setSelectedBooking(b.id);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{b.user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{b.jadwal.rute}</p>
                </button>
              ))}
              {bookings.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada booking</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
