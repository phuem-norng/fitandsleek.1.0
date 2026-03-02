import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import { useTheme } from "../../state/theme.jsx";
import { useLanguage } from "../../lib/i18n.jsx";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function StatCard({ title, value, change, icon, delay = 0, primaryColor, mode }) {
  const positive = change >= 0;
  const trendClass =
    mode === "dark"
      ? "bg-white/10 border-white/25 text-white"
      : "bg-slate-50 border-slate-200 text-slate-700";

  return (
    <div
      className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
          <span className={`mt-3 inline-flex items-center gap-1.5 rounded-2xl px-2.5 py-1 text-xs font-semibold border ${trendClass}`}>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: positive ? primaryColor : mode === "dark" ? "#FFFFFF" : "#0F172A" }}
            />
            {positive ? "+" : ""}
            {change}%
          </span>
        </div>
        <div className="h-10 w-10 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-center" style={{ backgroundColor: "rgba(var(--admin-primary-rgb),0.12)", color: primaryColor }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}

function TargetGauge({ value = 74, delay = 0, primaryColor, t }) {
  const percent = Math.max(0, Math.min(100, value));
  const stroke = 14;
  const radius = 80;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (circumference * percent) / 100;

  const baseTrackColor = "#E2E8F0";

  return (
    <div
      className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("dashboardTarget") || "Target Progress"}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("dashboardTargetSubtitle") || "Quarterly completion"}</p>

      <div className="mt-6 flex justify-center">
        <svg viewBox="0 0 220 130" className="w-full max-w-[260px]">
          <path
            d="M 30 110 A 80 80 0 0 1 190 110"
            fill="none"
            stroke={baseTrackColor}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d="M 30 110 A 80 80 0 0 1 190 110"
            fill="none"
            stroke={primaryColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
      </div>

      <div className="-mt-5 text-center">
        <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{percent}%</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("dashboardOnTrack") || "On-track"}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { primaryColor, mode } = useTheme();
  const { t } = useLanguage();
  const monochromeAccent = mode === "dark" ? "#FFFFFF" : primaryColor;
  const chartSoftColor = mode === "dark" ? "#94A3B8" : "rgba(var(--admin-primary-rgb),0.35)";
  const chartGridColor = mode === "dark" ? "#334155" : "#F1F5F9";
  const chartTickColor = mode === "dark" ? "#CBD5E1" : "#64748B";
  const tooltipBackground = mode === "dark" ? "#0F172A" : "#FFFFFF";
  const tooltipBorder = mode === "dark" ? "#334155" : "#EAECF0";
  const [stats, setStats] = useState({
    sales: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const dashRes = await api.get("/admin/reports/dashboard");
        const dashData = dashRes.data || {};
        setStats({
          sales: Number(dashData.revenue?.month || 0),
          orders: Number(dashData.orders?.total || 0),
          users: Number(dashData.customers?.total || 0),
          revenue: Number(dashData.revenue?.total || 0),
        });

        const ordersRes = await api.get("/admin/orders?limit=7");
        setRecentOrders(ordersRes.data?.data?.slice(0, 7) || []);
      } catch {
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const chartData = useMemo(() => {
    const months = [
      t("monthJan") || "Jan",
      t("monthFeb") || "Feb",
      t("monthMar") || "Mar",
      t("monthApr") || "Apr",
      t("monthMay") || "May",
      t("monthJun") || "Jun",
      t("monthJul") || "Jul",
      t("monthAug") || "Aug",
    ];
    return [
      { month: months[0], revenue: Math.max(0, Math.round(stats.revenue * 0.55)) },
      { month: months[1], revenue: Math.max(0, Math.round(stats.revenue * 0.62)) },
      { month: months[2], revenue: Math.max(0, Math.round(stats.revenue * 0.58)) },
      { month: months[3], revenue: Math.max(0, Math.round(stats.revenue * 0.71)) },
      { month: months[4], revenue: Math.max(0, Math.round(stats.revenue * 0.79)) },
      { month: months[5], revenue: Math.max(0, Math.round(stats.revenue * 0.85)) },
      { month: months[6], revenue: Math.max(0, Math.round(stats.revenue * 0.92)) },
      { month: months[7], revenue: Math.max(0, Math.round(stats.revenue || 0)) },
    ];
  }, [stats.revenue, t]);

  const trafficSources = useMemo(
    () => [
      { name: t("trafficOrganic") || "Organic Search", value: 62 },
      { name: t("trafficDirect") || "Direct", value: 48 },
      { name: t("trafficSocial") || "Social Media", value: 37 },
      { name: t("trafficReferral") || "Referral", value: 24 },
      { name: t("trafficEmail") || "Email", value: 16 },
    ],
    [t]
  );

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="h-14 w-14 rounded-2xl border-4 animate-spin" style={{ borderColor: mode === "dark" ? "rgba(255,255,255,0.25)" : "rgba(var(--admin-primary-rgb),0.25)", borderTopColor: monochromeAccent }} />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="mb-5">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">{t("dashboardOverviewTitle") || "Overview"}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("dashboardOverviewSubtitle") || "Clean and minimal business summary"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title={t("dashboardSales") || "Sales"}
          value={`$${stats.sales.toLocaleString()}`}
          change={8.2}
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"
          delay={0}
          primaryColor={monochromeAccent}
          mode={mode}
        />
        <StatCard
          title={t("dashboardOrders") || "Orders"}
          value={stats.orders.toLocaleString()}
          change={4.1}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10"
          delay={100}
          primaryColor={monochromeAccent}
          mode={mode}
        />
        <StatCard
          title={t("dashboardUsers") || "Users"}
          value={stats.users.toLocaleString()}
          change={2.7}
          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
          delay={200}
          primaryColor={monochromeAccent}
          mode={mode}
        />
        <StatCard
          title={t("dashboardRevenue") || "Revenue"}
          value={`$${stats.revenue.toLocaleString()}`}
          change={-1.4}
          icon="M12 8V7m0 1v8m0 0v1"
          delay={300}
          primaryColor={monochromeAccent}
          mode={mode}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 fade-in-up" style={{ animationDelay: "400ms" }}>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("dashboardRevenueAnalytics") || "Revenue Analytics"}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("dashboardRevenueSubtitle") || "Monthly trend overview"}</p>

          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={monochromeAccent} />
                    <stop offset="100%" stopColor={chartSoftColor} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: `1px solid ${tooltipBorder}`,
                    background: tooltipBackground,
                    color: mode === "dark" ? "#FFFFFF" : "#0F172A",
                    boxShadow: mode === "dark" ? "0 4px 16px rgba(0,0,0,0.35)" : "0 4px 16px rgba(15,23,42,0.08)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#revenueStroke)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: monochromeAccent, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: monochromeAccent, stroke: mode === "dark" ? "#0F172A" : "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <TargetGauge value={74} delay={500} primaryColor={monochromeAccent} t={t} />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 fade-in-up" style={{ animationDelay: "600ms" }}>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("dashboardRecentActivity") || "Recent Activity"}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("dashboardRecentSubtitle") || "Latest order workflow updates"}</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <th className="w-10 px-3 py-3 text-left font-semibold">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                  </th>
                  <th className="px-3 py-3 text-left font-semibold">{t("order") || "Order"}</th>
                  <th className="px-3 py-3 text-left font-semibold">{t("customer") || "Customer"}</th>
                  <th className="px-3 py-3 text-left font-semibold">{t("total") || "Total"}</th>
                  <th className="px-3 py-3 text-left font-semibold">{t("status") || "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 fade-in-up"
                    style={{ animationDelay: `${700 + index * 100}ms` }}
                  >
                    <td className="px-3 py-3">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                    </td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-200 font-medium">#{order.order_number}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400">{order.user_name || (t("guest") || "Guest")}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-200">${Number(order.total || 0).toFixed(2)}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
                        {order.status || (t("pending") || "Pending")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5 fade-in-up" style={{ animationDelay: "700ms" }}>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t("dashboardTrafficSources") || "Traffic Sources"}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("dashboardTrafficSubtitle") || "Session distribution"}</p>

          <div className="mt-5 space-y-4">
            {trafficSources.map((source, index) => (
              <div key={source.name} className="fade-in-up" style={{ animationDelay: `${800 + index * 100}ms` }}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="text-slate-600 dark:text-slate-400">{source.name}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{source.value}%</span>
                </div>
                <div className="h-2 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700">
                  <div className="h-full rounded-2xl" style={{ width: `${source.value}%`, backgroundColor: monochromeAccent }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.45s ease forwards;
        }
      `}</style>
    </div>
  );
}
