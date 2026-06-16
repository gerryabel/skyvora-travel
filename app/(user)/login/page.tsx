// app/(user)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      // Redirect based on role — full page reload to refresh all components
      if (data.user.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        // Check for returnTo parameter
        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get("returnTo");
        window.location.href = returnTo || "/";
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" style={{ background: "#f5f3f0" }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-lg p-8" style={{ background: "#fdfcfa", border: "1px solid #e0dcd7" }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#1a1a1a" }}>
              Masuk ke <span className="text-blue-600">Skyvora</span> Travel
            </h1>
            <p className="text-sm" style={{ color: "#6b6b6b" }}>
              Silakan login untuk melanjutkan
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm bg-red-50 text-red-700 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9ca3af" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
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
              <LogIn className="w-4 h-4" />
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm mt-6" style={{ color: "#6b6b6b" }}>
            Belum punya akun?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
