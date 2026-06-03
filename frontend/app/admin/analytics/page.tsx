"use client";

import { useEffect, useState } from "react";
import createAPI from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeeklyStat {
  year: number;
  week: number;
  label: string;
  revenue: number;
  orderCount: number;
  commission: number;
  unitsSold: number;
}

interface CategoryStat {
  category: string;
  revenue: number;
  unitsSold: number;
}

interface VendorStat {
  vendorId: string;
  vendorName: string;
  revenue: number;
  unitsSold: number;
}

interface AdminAnalyticsData {
  summary: {
    totalGMV: number;
    adminRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalProducts: number;
    totalVendors: number;
  };
  weeklyData: WeeklyStat[];
  categoryStats: CategoryStat[];
  vendorStats: VendorStat[];
}

export default function AdminAnalytics() {
  const API = createAPI();
  const { user } = useAuth();
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(12); // weeks to display

  useEffect(() => {
    API.get("/analytics/admin")
      .then((res: any) => {
        setData(res.data);
      })
      .catch((err: any) => {
        console.error("Failed to load admin analytics:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #334155", borderTopColor: "#8B5CF6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ background: "#1E293B", padding: "40px", borderRadius: "12px", border: "1px solid #334155", textAlignment: "center", color: "#94A3B8" } as any}>
        No analytics data available.
      </div>
    );
  }

  // Filter weekly data based on user preference
  const filteredWeeks = data.weeklyData.slice(-timeRange);

  // ── CHART CONFIGURATIONS ───────────────────────────────────────────

  // 1. Weekly Revenue Line Chart
  const revenueChartData = {
    labels: filteredWeeks.map((w) => w.label),
    datasets: [
      {
        label: "Weekly Revenue (GMV)",
        data: filteredWeeks.map((w) => w.revenue),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.08)",
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: "#8B5CF6",
        pointBorderColor: "#1E293B",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1E293B",
        titleColor: "#F8FAFC",
        bodyColor: "#94A3B8",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        bodyFont: { family: "Inter, sans-serif" },
        titleFont: { family: "Inter, sans-serif", weight: "bold" as const },
        callbacks: {
          label: (context: any) => ` Revenue: ₹${context.raw.toLocaleString("en-IN")}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748B", font: { family: "Inter, sans-serif", size: 11 } }
      },
      y: {
        grid: { color: "rgba(51, 65, 85, 0.4)" },
        ticks: {
          color: "#64748B",
          font: { family: "Inter, sans-serif", size: 11 },
          callback: (value: any) => "₹" + value.toLocaleString("en-IN")
        }
      }
    }
  };

  // 2. Weekly Order Volume Bar Chart
  const orderChartData = {
    labels: filteredWeeks.map((w) => w.label),
    datasets: [
      {
        label: "Orders Placed",
        data: filteredWeeks.map((w) => w.orderCount),
        backgroundColor: "#06B6D4",
        borderRadius: 4,
        hoverBackgroundColor: "#22D3EE",
      },
    ],
  };

  const orderChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1E293B",
        titleColor: "#F8FAFC",
        bodyColor: "#94A3B8",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => ` Orders: ${context.raw}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748B", font: { family: "Inter, sans-serif", size: 11 } }
      },
      y: {
        grid: { color: "rgba(51, 65, 85, 0.4)" },
        ticks: {
          color: "#64748B",
          font: { family: "Inter, sans-serif", size: 11 },
          stepSize: 1
        }
      }
    }
  };

  // 3. Category Sales Breakdown Doughnut Chart
  const categoryChartData = {
    labels: data.categoryStats.map((c) => c.category),
    datasets: [
      {
        data: data.categoryStats.map((c) => c.revenue),
        backgroundColor: ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#64748B"],
        borderWidth: 2,
        borderColor: "#1E293B",
        hoverOffset: 6
      },
    ],
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#94A3B8",
          font: { family: "Inter, sans-serif", size: 12 },
          boxWidth: 12,
          padding: 14
        }
      },
      tooltip: {
        backgroundColor: "#1E293B",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => ` Sales: ₹${context.raw.toLocaleString("en-IN")}`
        }
      }
    },
    cutout: "75%"
  };

  // 4. Top Performing Vendors Horizontal Bar Chart
  const vendorChartData = {
    labels: data.vendorStats.map((v) => v.vendorName),
    datasets: [
      {
        label: "Revenue Generated",
        data: data.vendorStats.map((v) => v.revenue),
        backgroundColor: "#10B981",
        borderRadius: 4,
        hoverBackgroundColor: "#34D399",
      },
    ],
  };

  const vendorChartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1E293B",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => ` Revenue: ₹${context.raw.toLocaleString("en-IN")}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: {
          color: "#64748B",
          font: { family: "Inter, sans-serif", size: 10 },
          callback: (value: any) => "₹" + value.toLocaleString("en-IN")
        }
      },
      y: {
        grid: { display: false },
        ticks: { color: "#94A3B8", font: { family: "Inter, sans-serif", size: 11 } }
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#F8FAFC", margin: 0, letterSpacing: "-0.5px" }}>Performance Analytics</h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "13px" }}>Real-time database indicators and marketplace pipelines.</p>
        </div>
        <div style={{ display: "flex", background: "#1E293B", padding: "4px", borderRadius: "8px", border: "1px solid #334155" }}>
          {[
            { label: "4 Weeks", value: 4 },
            { label: "8 Weeks", value: 8 },
            { label: "12 Weeks", value: 12 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                transition: "all 0.15s",
                background: timeRange === opt.value ? "#8B5CF6" : "transparent",
                color: timeRange === opt.value ? "#fff" : "#94A3B8",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {[
          {
            label: "Gross Merchandise Value",
            value: `₹${data.summary.totalGMV.toLocaleString("en-IN")}`,
            sub: "Total consumer transaction volume",
            color: "#8B5CF6",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
          },
          {
            label: "Platform Revenue",
            value: `₹${data.summary.adminRevenue.toLocaleString("en-IN")}`,
            sub: "10% take-rate fee commission",
            color: "#FBBF24",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          },
          {
            label: "Average Order Value (AOV)",
            value: `₹${Math.round(data.summary.averageOrderValue).toLocaleString("en-IN")}`,
            sub: "Average transaction basket size",
            color: "#06B6D4",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          },
          {
            label: "Operational Orders",
            value: data.summary.totalOrders,
            sub: "Paid and completed orders",
            color: "#10B981",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          }
        ].map((card, idx) => (
          <div
            key={idx}
            style={{
              background: "#1E293B",
              borderRadius: "12px",
              padding: "20px 24px",
              border: "1px solid #334155",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500 }}>{card.label}</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: card.color + "18", display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                {card.icon}
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.5px" }}>{card.value}</div>
            <div style={{ fontSize: "11px", color: "#64748B" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "20px" }}>
        {/* Weekly Revenue Curve */}
        <div style={{ background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#F8FAFC" }}>Weekly Sales Curve (GMV)</h3>
            <span style={{ fontSize: "11px", color: "#8B5CF6", fontWeight: 600, background: "rgba(139, 92, 246, 0.15)", padding: "3px 8px", borderRadius: "12px" }}>Aggregation Trend</span>
          </div>
          <div style={{ height: "260px", position: "relative" }}>
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        </div>

        {/* Weekly Order Volume */}
        <div style={{ background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#F8FAFC" }}>Order Volume Distribution</h3>
            <span style={{ fontSize: "11px", color: "#06B6D4", fontWeight: 600, background: "rgba(6, 182, 212, 0.15)", padding: "3px 8px", borderRadius: "12px" }}>Order count</span>
          </div>
          <div style={{ height: "260px", position: "relative" }}>
            <Bar data={orderChartData} options={orderChartOptions} />
          </div>
        </div>
      </div>

      {/* Secondary Row (Breakdowns) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
        {/* Category breakdown */}
        <div style={{ background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "24px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "14px", fontWeight: 700, color: "#F8FAFC" }}>Sales Category Breakdown</h3>
          {!data.categoryStats.length ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "13px" }}>No categories recorded</div>
          ) : (
            <div style={{ height: "220px", position: "relative" }}>
              <Doughnut data={categoryChartData} options={categoryChartOptions} />
            </div>
          )}
        </div>

        {/* Top Performing Vendors */}
        <div style={{ background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", padding: "24px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "14px", fontWeight: 700, color: "#F8FAFC" }}>Top Performing Sellers</h3>
          {!data.vendorStats.length ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "13px" }}>No vendor sales recorded</div>
          ) : (
            <div style={{ height: "220px", position: "relative" }}>
              <Bar data={vendorChartData} options={vendorChartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
