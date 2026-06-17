// app/admin/dashboard/pendapatan-chart.tsx
"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

type Periode = "hari" | "bulan" | "tahun";

interface ChartData {
  name: string;
  pendapatan: number;
}

function formatRupiah(n: number): string {
  if (n >= 1_000_000) return "Rp " + (n / 1_000_000).toFixed(1) + "jt";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(0) + "rb";
  return "Rp " + n.toLocaleString("id-ID");
}

const PERIODE_OPTIONS: { value: Periode; label: string }[] = [
  { value: "hari", label: "Harian" },
  { value: "bulan", label: "Bulanan" },
  { value: "tahun", label: "Tahunan" },
];

export default function PendapatanChart() {
  const [periode, setPeriode] = useState<Periode>("hari");
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/dashboard/pendapatan?periode=${periode}`)
      .then((res) => res.json())
      .then((json) => setData(json.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [periode]);

  const totalPendapatan = data.reduce((sum, d) => sum + d.pendapatan, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-100 gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-bold text-gray-900">Pendapatan</h3>
            <p className="text-xs text-gray-400">
              Total: <span className="font-semibold text-green-600">{formatRupiah(totalPendapatan)}</span>
            </p>
          </div>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {PERIODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriode(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periode === opt.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 || totalPendapatan === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <TrendingUp className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">Belum ada data pendapatan</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatRupiah(v)}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [formatRupiah(Number(value)), "Pendapatan"]}
                labelStyle={{ fontWeight: 700, color: "#111" }}
              />
              <Area
                type="monotone"
                dataKey="pendapatan"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#colorPendapatan)"
                dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
