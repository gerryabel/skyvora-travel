// app/(user)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, UserPlus, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrasi gagal");
        return;
      }

      setSuccess("Registrasi berhasil! Mengalihkan ke halaman login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8" style={{ background: "#f5f3f0" }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-lg p-8" style={{ background: "#fdfcfa", border: "1px solid #e0dcd7" }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#1a1a1a" }}>
              Daftar <span className="text-blue-600">Skyvora</span> Travel
            </h1>
            <p className="text-sm" style={{ color: "#6b6b6b" }}>
              Buat akun baru untuk mulai memesan
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm bg-red-50 text-red-700 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm bg-green-50 text-green-700 border border-green-200">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a1a" }}>
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: "#f5f3f0", border: "1px solid #e0dcd7", color: "#1a1a1a" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a1a" }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: "#f5f3f0", border: "1px solid #e0dcd7", color: "#1a1a1a" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a1a" }}>
                No. HP (opsional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: "#f5f3f0", border: "1px solid #e0dcd7", color: "#1a1a1a" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a1a" }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: "#f5f3f0", border: "1px solid #e0dcd7", color: "#1a1a1a" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a1a" }}>
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ background: "#f5f3f0", border: "1px solid #e0dcd7", color: "#1a1a1a" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#2563eb" }}
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Mendaftar..." : "Daftar"}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm mt-6" style={{ color: "#6b6b6b" }}>
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
