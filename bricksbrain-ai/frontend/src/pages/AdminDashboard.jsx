import React, { useEffect, useState } from "react";
import { Users, Building2, Eye, ListChecks } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import api from "../api/axios";
import { formatPrice } from "../components/PropertyCard";

const COLORS = ["#e63946", "#1a1a2e", "#f16f78", "#7c121f", "#f7a3a8"];

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setData(data));
  }, []);

  if (!data) return <div className="min-h-[60vh] flex items-center justify-center text-gray-400">Loading admin dashboard...</div>;

  const { stats, propertiesByType, propertiesByCity, recentUsers, recentProperties } = data;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Total Properties", value: stats.totalProperties, icon: Building2 },
    { label: "Active Listings", value: stats.activeListings, icon: ListChecks },
    { label: "Total Views", value: stats.totalViews, icon: Eye },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-ink mb-6">Admin Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><c.icon size={20} /></div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-xl font-bold text-ink">{c.value.toLocaleString("en-IN")}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Properties by Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={propertiesByType} dataKey="count" nameKey="_id" outerRadius={90} label>
                {propertiesByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Top Cities by Listings</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={propertiesByCity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#e63946" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Recent Users</h3>
          <table className="w-full text-sm">
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 font-medium">{u.name}</td>
                  <td className="py-2 text-gray-500">{u.email}</td>
                  <td className="py-2 text-xs bg-gray-100 rounded px-2 py-0.5 inline-block mt-1">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Recent Properties</h3>
          <table className="w-full text-sm">
            <tbody>
              {recentProperties.map((p) => (
                <tr key={p._id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 font-medium line-clamp-1 max-w-[220px]">{p.title}</td>
                  <td className="py-2 text-gray-500">{formatPrice(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
