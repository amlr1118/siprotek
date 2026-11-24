// import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend
} from "recharts";

interface TrenData {
  name: string;
  Hadir: number;
}

interface DiagnosaData {
  name: string;
  value: number;
}

interface ChartStats {
  tren_kehadiran: TrenData[];
  diagnosa: DiagnosaData[];
}

// Palet warna yang cantik untuk Pie Chart
const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e"];

export default function WidgetCharts() {
  const [data, setData] = useState<ChartStats>({ tren_kehadiran: [], diagnosa: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const response = await api.get("/admin/dashboard-charts");
        setData(response.data);
      } catch (error) {
        console.error("Gagal memuat data grafik", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCharts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
        <div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* 1. GRAFIK TREN KEHADIRAN (LINE CHART) - Lebar 2/3 */}
      <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Tren Kehadiran Peserta</h3>
          <p className="text-sm text-gray-500">Statistik kehadiran 6 bulan terakhir</p>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.tren_kehadiran} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#6b7280" }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#6b7280" }} 
              />
              <LineTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="Hadir" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                dot={{ r: 4, strokeWidth: 2, fill: "#white" }} 
                activeDot={{ r: 6, strokeWidth: 0, fill: "#3b82f6" }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. GRAFIK RASIO DIAGNOSA (PIE CHART) - Lebar 1/3 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Rasio Diagnosa</h3>
          <p className="text-sm text-gray-500">Distribusi penyakit penyerta</p>
        </div>
        
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.diagnosa}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1500}
              >
                {data.diagnosa.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <PieTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 'bold', color: '#374151' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}