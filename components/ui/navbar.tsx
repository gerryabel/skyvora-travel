// components/ui/navbar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Bus, X, Menu, LogIn, LogOut, User, Shield } from "lucide-react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }

  return (
    <nav className="bg-[#fdfcfa] border-b border-[#e0dcd7] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center">
            <img src="/skyvora-logo-text3.svg" alt="Skyvora Travel" className="h-14 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/cari-jadwal"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Cari Jadwal
            </Link>
            <Link
              href="/riwayat"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Riwayat
            </Link>

            {user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-primary transition-colors font-medium flex items-center gap-1"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {loading ? (
              <div className="w-20 h-8 rounded-lg bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-light">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary-dark">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600 hover:text-primary"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/cari-jadwal"
                className="text-gray-600 hover:text-primary transition-colors font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Cari Jadwal
              </Link>
              <Link
                href="/riwayat"
                className="text-gray-600 hover:text-primary transition-colors font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Riwayat
              </Link>

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium py-2 flex items-center gap-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}

              {user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-light">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary-dark">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-red-600 font-medium py-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-1.5"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
