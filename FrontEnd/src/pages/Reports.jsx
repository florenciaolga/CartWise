import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { MdRestaurant, MdTrendingUp, MdTrendingDown, MdChevronRight } from "react-icons/md";

const BASE_URL = "http://localhost:3000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function formatRp(amount) {
  if (amount == null) return "Rp0";
  return "Rp" + Number(amount).toLocaleString("id-ID");
}

function TrendBadge({ value }) {
  if (value === 0 || value == null)
    return <span className="rounded-full bg-[#EEF3D2] px-2.5 py-0.5 text-[11px] font-bold text-[#5A6A10]">STABLE</span>;
  const isPos = value > 0;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${isPos ? "bg-red-100 text-red-600" : "bg-[#EEF3D2] text-[#5A6A10]"}`}>
      {isPos ? "+" : ""}{value}%
    </span>
  );
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ITEM_ICONS = ["💧", "☕", "🍞", "🥚", "🥛", "🧴", "🛒", "🌿"];

export default function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/reports?month=${month}&year=${year}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const spending = data?.monthly_spending ?? 0;
  const topCat = data?.top_category;
  const velocity = data?.savings_velocity ?? 0;
  const items = data?.most_purchased_items ?? [];

  // Dummy trend per item (backend doesn't provide per-item trend yet)
  // const itemTrends = [0, 12, 0, -5];

  return (
    <div className="flex h-screen bg-[#F5F6F0] overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-10 py-10">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2D3335]">Reports & Analytics</h1>
              <p className="mt-2 text-sm text-[#5A6062] max-w-lg">
                A refined editorial view of your household economy. Tracking flow,
                identifying habits, and curating your financial growth.
              </p>
            </div>

            {/* Month picker */}
            <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
              <select
                className="text-sm text-[#2D3335] outline-none bg-transparent"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                className="text-sm text-[#2D3335] outline-none bg-transparent"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7E8E21] border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">

                {/* Monthly Spending */}
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 relative overflow-hidden">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">Monthly Spending</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-[#2D3335]">{formatRp(spending)}</p>
                    {velocity !== 0 && (
                      <span className={`mb-1 flex items-center gap-0.5 text-sm font-semibold ${velocity > 0 ? "text-[#7E8E21]" : "text-red-500"}`}>
                        {velocity > 0 ? <MdTrendingDown size={16}/> : <MdTrendingUp size={16}/>}
                        ~{Math.abs(velocity)}%
                      </span>
                    )}
                  </div>
                  {/* Decorative icon */}
                  {/* <div className="absolute right-4 bottom-3 opacity-10">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                      <circle cx="30" cy="30" r="28" stroke="#7E8E21" strokeWidth="3"/>
                      <path d="M20 40 L30 20 L40 40" stroke="#7E8E21" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div> */}
                </div>

                {/* Top Category */}
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">Top Category</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4A541F]">
                      <MdRestaurant size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#2D3335]">{topCat?.category_name || "—"}</p>
                      {topCat && (
                        <p className="text-xs text-[#5A6062] mt-0.5">{formatRp(topCat.total_spent)} this month</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Savings Velocity */}
                {/* <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">Savings Velocity</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-[#2D3335]">{formatRp(velocity < 0 ? spending * (1 + Math.abs(velocity)/100) : spending * (1 - velocity/100))}</p>
                    <span className={`mb-1 flex items-center gap-0.5 text-sm font-semibold ${velocity >= 0 ? "text-[#7E8E21]" : "text-red-500"}`}>
                      {velocity >= 0 ? <MdTrendingUp size={16}/> : <MdTrendingDown size={16}/>}
                      {velocity >= 0 ? "+" : ""}{velocity}%
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-1">v.s. last month</p>
                </div> */}
              </div>

              {/* Most Purchased Items */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#F3F4EE]">
                  <p className="text-lg font-bold text-[#2D3335]">Most Purchased Items</p>
                  {/* <button className="flex items-center gap-1 text-sm font-semibold text-[#7E8E21] hover:text-[#4A541F] transition-colors">
                    View Full History <MdChevronRight size={18}/>
                  </button> */}
                </div>

                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] border-b border-[#F3F4EE]">
                  <span>Item Name</span>
                  <span>Frequency</span>
                  <span>Avg. Price</span>
                  <span>Total Spent</span>
                  {/* <span>Trend</span> */}
                </div>

                {items.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] py-12 text-center">No purchase data for this period.</p>
                ) : (
                  items.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 border-b border-[#F3F4EE] last:border-0 hover:bg-[#FAFBF6] transition-colors"
                    >
                      {/* Name */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F4EE] text-lg">
                          {ITEM_ICONS[i % ITEM_ICONS.length]}
                        </div>
                        <span className="text-sm font-semibold text-[#2D3335]">{item.item_name}</span>
                      </div>

                      {/* Frequency */}
                      <span className="text-sm text-[#475569]">{item.frequency}x / month</span>

                      {/* Avg price */}
                      <span className="text-sm text-[#475569]">{formatRp(item.avg_price)}</span>

                      {/* Total spent */}
                      <span className="text-sm font-semibold text-[#2D3335]">
                        Rp<span className="font-bold">{Number(item.total_spent).toLocaleString("id-ID")}</span>
                      </span>

                      {/* Trend badge */}
                      {/* <TrendBadge value={itemTrends[i] ?? 0} /> */}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}