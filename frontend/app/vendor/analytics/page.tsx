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

interface ProductStat {
  productId: string;
  name: string;
  image: string;
  revenue: number;
  unitsSold: number;
}

interface VendorAnalyticsData {
  summary: {
    totalEarnings: number;
    totalCommissionPaid: number;
    totalOrders: number;
    totalUnitsSold: number;
    totalProducts: number;
    averageOrderValue: number;
  };
  weeklyData: WeeklyStat[];
  categoryStats: CategoryStat[];
  topProducts: ProductStat[];
}

export default function VendorAnalytics() {
  const API = createAPI();
  const { user } = useAuth();
  const [data, setData] = useState<VendorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(12); // weeks to display

  useEffect(() => {
    API.get("/analytics/vendor")
      .then((res: any) => {
        setData(res.data);
      })
      .catch((err: any) => {
        console.error("Failed to load vendor analytics:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #E2E8F0", borderTopColor: "#6D28D9", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ background: "#fff", padding: "40px", borderRadius: "12px", border: "1px solid #E2E8F0", textAlign: "center", color: "#64748B" }}>
        No analytics data available for your store yet.
      </div>
    );
  }

  const filteredWeeks = data.weeklyData.slice(-timeRange);

  // ── CHART CONFIGURATIONS ───────────────────────────────────────────

  // 1. Weekly Earnings Line Chart (90% to vendor)
  const earningsChartData = {
    labels: filteredWeeks.map((w) => w.label),
    datasets: [
      {
        label: "Your Earnings",
        data: filteredWeeks.map((w) => w.revenue),
        borderColor: "#6D28D9",
        backgroundColor: "rgba(109, 40, 217, 0.05)",
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: "#6D28D9",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const earningsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1E293B",
        bodyColor: "#475569",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        padding: 12,
        titleFont: { family: "Inter, sans-serif", weight: "bold" as const },
        bodyFont: { family: "Inter, sans-serif" },
        callbacks: {
          label: (context: any) => ` Earnings: ₹${context.raw.toLocaleString("en-IN")}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94A3B8", font: { family: "Inter, sans-serif", size: 11 } }
      },
      y: {
        grid: { color: "#F1F5F9" },
        ticks: {
          color: "#94A3B8",
          font: { family: "Inter, sans-serif", size: 11 },
          callback: (value: any) => "₹" + value.toLocaleString("en-IN")
        }
      }
    }
  };

  // 2. Weekly Orders Volume Bar Chart
  const ordersChartData = {
    labels: filteredWeeks.map((w) => w.label),
    datasets: [
      {
        label: "Store Orders",
        data: filteredWeeks.map((w) => w.orderCount),
        backgroundColor: "#3B82F6",
        borderRadius: 4,
        hoverBackgroundColor: "#60A5FA",
      },
    ],
  };

  const ordersChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1E293B",
        bodyColor: "#475569",
        borderColor: "#E2E8F0",
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
        ticks: { color: "#94A3B8", font: { family: "Inter, sans-serif", size: 11 } }
      },
      y: {
        grid: { color: "#F1F5F9" },
        ticks: {
          color: "#94A3B8",
          font: { family: "Inter, sans-serif", size: 11 },
          stepSize: 1
        }
      }
    }
  };

  // 3. Sales Category Breakdown Doughnut Chart
  const categoryChartData = {
    labels: data.categoryStats.map((c) => c.category),
    datasets: [
      {
        data: data.categoryStats.map((c) => c.revenue),
        backgroundColor: ["#6D28D9", "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#94A3B8"],
        borderWidth: 2,
        borderColor: "#fff",
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
          color: "#475569",
          font: { family: "Inter, sans-serif", size: 12 },
          boxWidth: 12,
          padding: 14
        }
      },
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => ` Sales: ₹${context.raw.toLocaleString("en-IN")}`
        }
      }
    },
    cutout: "75%"
  };

  // 4. Top Products Horizontal Bar Chart
  const productsChartData = {
    labels: data.topProducts.map((p) => p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name),
    datasets: [
      {
        label: "Product Sales",
        data: data.topProducts.map((p) => p.revenue),
        backgroundColor: "#10B981",
        borderRadius: 4,
        hoverBackgroundColor: "#34D399",
      },
    ],
  };

  const productsChartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => ` Earnings: ₹${context.raw.toLocaleString("en-IN")}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: "#F1F5F9" },
        ticks: {
          color: "#94A3B8",
          font: { family: "Inter, sans-serif", size: 10 },
          callback: (value: any) => "₹" + value.toLocaleString("en-IN")
        }
      },
      y: {
        grid: { display: false },
        ticks: { color: "#475569", font: { family: "Inter, sans-serif", size: 11 } }
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome / Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1E293B", margin: 0 }}>Store Analytics</h2>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "13px" }}>Analyze your sales, products, and commission breakdowns.</p>
        </div>
        <div style={{ display: "flex", background: "#fff", padding: "4px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
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
                background: timeRange === opt.value ? "#6D28D9" : "transparent",
                color: timeRange === opt.value ? "#fff" : "#64748B",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        {[
          {
            label: "Net Earnings",
            value: `₹${data.summary.totalEarnings.toLocaleString("en-IN")}`,
            sub: "Your 90% revenue share after fees",
            color: "#6D28D9",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          },
          {
            label: "Commission Paid",
            value: `₹${data.summary.totalCommissionPaid.toLocaleString("en-IN")}`,
            sub: "10% platform commission fee",
            color: "#FBBF24",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
          },
          {
            label: "Store Orders",
            value: data.summary.totalOrders,
            sub: "Number of custom order baskets",
            color: "#3B82F6",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          },
          {
            label: "Average Basket Value",
            value: `₹${Math.round(data.summary.averageOrderValue).toLocaleString("en-IN")}`,
            sub: "AOV for your products",
            color: "#10B981",
            icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          }
        ].map((card, idx) => (
          <div
            key={idx}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #E2E8F0",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500 }}>{card.label}</span>
              <div style={{ color: card.color, background: card.color + "18", padding: "6px", borderRadius: "8px" }}>
                {card.icon}
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "#1E293B" }}>{card.value}</div>
            <div style={{ fontSize: "11px", color: "#94A3B8" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Main charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
        {/* Earnings Curve */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>Weekly Net Earnings Curve</h3>
            <span style={{ fontSize: "11px", color: "#6D28D9", fontWeight: 600, background: "#EDE9FE", padding: "3px 8px", borderRadius: "12px" }}>Seller Payout</span>
          </div>
          <div style={{ height: "260px", position: "relative" }}>
            <Line data={earningsChartData} options={earningsChartOptions} />
          </div>
        </div>

        {/* Order Volume */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>Weekly Order Volume</h3>
            <span style={{ fontSize: "11px", color: "#3B82F6", fontWeight: 600, background: "#DBEAFE", padding: "3px 8px", borderRadius: "12px" }}>Order frequency</span>
          </div>
          <div style={{ height: "260px", position: "relative" }}>
            <Bar data={ordersChartData} options={ordersChartOptions} />
          </div>
        </div>
      </div>

      {/* Breakdowns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px" }}>
        {/* Category breakdown */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>Your Category Share</h3>
          {!data.categoryStats.length ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>No category distribution</div>
          ) : (
            <div style={{ height: "220px", position: "relative" }}>
              <Doughnut data={categoryChartData} options={categoryChartOptions} />
            </div>
          )}
        </div>

        {/* Top selling products */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>Top Performing Products</h3>
          {!data.topProducts.length ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>No products sold yet</div>
          ) : (
            <div style={{ height: "220px", position: "relative" }}>
              <Bar data={productsChartData} options={productsChartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
