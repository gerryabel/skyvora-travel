// app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bus,
  BarChart3,
  Calendar,
  ClipboardList,
  ArrowLeft,
  Car,
  Menu,
  X,
  LogOut,
  User,
  Users,
  FileBarChart,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/admin/dashboard", icon: BarChart3, label: "Dashboard" },
  { href: "/admin/jadwal", icon: Calendar, label: "Jadwal" },
  { href: "/admin/bookings", icon: ClipboardList, label: "Bookings" },
  { href: "/admin/armada", icon: Car, label: "Armada" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/laporan", icon: FileBarChart, label: "Laporan" },
];

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  // Get current page title
  const currentNav = navItems.find(item => pathname === item.href || pathname.startsWith(item.href + "/"));
  const pageTitle = currentNav?.label ?? "Admin";

  return (
    <div className="flex min-h-screen" style={{ background: "#f5f3f0" }}>
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-[#1a1a2e] p-6 hidden md:flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Link href="/admin/dashboard" className="mb-6 flex justify-center">
          <img src="/skyvora-logo-center.svg" alt="Skyvora Travel" className="h-16 w-auto" />
        </Link>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Website
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#1a1a2e] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <Link href="/admin/dashboard" className="px-4 py-2">
                <img src="/skyvora-logo-text3.svg" alt="Skyvora Travel" className="h-12 w-auto" />
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-white/10">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-white text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Website
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Admin Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
            {/* Left: Mobile menu + Page title */}
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600 hover:text-gray-900">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{pageTitle}</h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
                <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name ?? "Admin"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Admin Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400">
              © 2026 Skyvora Travel — Admin Dashboard
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <Link href="/" className="hover:text-primary transition-colors">Lihat Website</Link>
              <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
