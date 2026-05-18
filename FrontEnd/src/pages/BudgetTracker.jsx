import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import {
  MdRestaurant,
  MdHome,
  MdSpa,
  MdLightbulb,
  MdSearch,
} from "react-icons/md";

const BASE_URL = "http://localhost:3000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const CATEGORY_META = {
  Groceries:  { icon: MdRestaurant, color: "#7E8E21", bg: "#F0F4E0" },
  Household:  { icon: MdHome,       color: "#E05252", bg: "#FDE8E8" },
  Personal:   { icon: MdSpa,        color: "#7E8E21", bg: "#F0F4E0" },
};

function getCategoryMeta(name) {
  return CATEGORY_META[name] || { icon: MdHome, color: "#7E8E21", bg: "#F0F4E0" };
}

function formatRp(amount) {
  if (amount == null) return "Rp0";
  return "Rp" + Number(amount).toLocaleString("id-ID");
}

function CircleProgress({ percentage }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percentage, 100) / 100) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="#E5E7EB" strokeWidth="14" />
        <circle
          cx="90" cy="90" r={r} fill="none"
          stroke="#7E8E21" strokeWidth="14"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-[#2D3335]">{Math.round(percentage)}%</span>
        <span className="text-xs text-[#5A6062] uppercase tracking-widest mt-0.5">Consumed</span>
      </div>
    </div>
  );
}

function BudgetCard({ budget }) {
  const meta = getCategoryMeta(budget.category_name);
  const Icon = meta.icon;
  const pct = Math.min(budget.percentage_used ?? 0, 100);
  const isOver = budget.is_over_budget;

  let badge, badgeColor;
  if (isOver) {
    badge = "Limit Reached"; badgeColor = "bg-red-100 text-red-600";
  } else if (pct >= 70) {
    badge = "Watch Out"; badgeColor = "bg-yellow-100 text-yellow-700";
  } else {
    badge = "In Control"; badgeColor = "bg-[#EEF3D2] text-[#5A6A10]";
  }

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: meta.bg }}
        >
          <Icon size={20} style={{ color: meta.color }} />
        </div>
        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <div>
        <p className="text-base font-semibold text-[#2D3335]">{budget.category_name}</p>
        <p className="text-[11px] text-[#5A6062] uppercase tracking-wide mt-0.5">Spent</p>
        <p className={`text-2xl font-bold mt-0.5 ${isOver ? "text-red-500" : "text-[#2D3335]"}`}>
          {formatRp(budget.spent)}
        </p>
        <p className="text-xs text-[#5A6062] mt-0.5">Limit {formatRp(budget.monthly_limit)}</p>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: isOver ? "#E05252" : "#7E8E21",
          }}
        />
      </div>
    </div>
  );
}

function LedgerEntry({ tx }) {
  const isPositive = tx.amount > 0;
  const initials = (tx.source || "?").slice(0, 2).toUpperCase();
  const dateStr = tx.date
    ? new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F4E0] text-xs font-bold text-[#4A541F]">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2D3335]">{tx.source || tx.description || "Transaction"}</p>
          <p className="text-[11px] text-[#5A6062]">
            {dateStr}{tx.category_name ? ` • ${tx.category_name}` : ""}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${isPositive ? "text-[#7E8E21]" : "text-[#2D3335]"}`}>
          {isPositive ? "+" : ""}{formatRp(tx.amount)}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-[#5A6062] mt-0.5">
          {tx.type || "processed"}
        </p>
      </div>
    </div>
  );
}

function SetBudgetModal({ categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    category_id: categories[0]?.id || "",
    monthly_limit: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();

  async function handleSubmit() {
    if (!form.monthly_limit || isNaN(form.monthly_limit)) {
      setError("Please enter a valid amount.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/budgets`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          category_id: Number(form.category_id),
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          monthly_limit: Number(form.monthly_limit),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save budget.");
      } else {
        onSaved();
        onClose();
      }
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[#2D3335] mb-4">Set Monthly Budget</h2>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-[#5A6062] mb-1 block">Category</label>
            <select
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#2D3335] outline-none focus:border-[#7E8E21]"
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#5A6062] mb-1 block">Monthly Limit (Rp)</label>
            <input
              type="number"
              placeholder="e.g. 500000"
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#2D3335] outline-none focus:border-[#7E8E21]"
              value={form.monthly_limit}
              onChange={(e) => setForm((f) => ({ ...f, monthly_limit: e.target.value }))}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#475569]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#4A541F] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Add Budget"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetTracker() {
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("monthly");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetRes, txRes, catRes] = await Promise.all([
        fetch(`${BASE_URL}/budgets`, { headers: getAuthHeaders() }),
        fetch(`${BASE_URL}/transactions`, { headers: getAuthHeaders() }).catch(() => ({ ok: false })),
        fetch(`${BASE_URL}/categories`, { headers: getAuthHeaders() }).catch(() => ({ ok: false })),
      ]);

      if (budgetRes.ok) {
        const d = await budgetRes.json();
        setData(d);
      }
      if (txRes.ok) {
        const d = await txRes.json();
        setTransactions(Array.isArray(d) ? d : d.transactions || []);
      }
      if (catRes.ok) {
        const d = await catRes.json();
        setCategories(Array.isArray(d) ? d : d.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalBudget = data?.total_budget ?? 0;
  const totalSpent = data?.total_spent ?? 0;
  const pctConsumed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const budgets = data?.budgets ?? [];
  const recentTx = transactions.slice(0, 3);

  return (
    <div className="flex h-screen bg-[#F5F6F0] overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] bg-white px-6 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-[#F3F4EE] px-4 py-2">
            <MdSearch size={16} className="text-[#9CA3AF]" />
            <span className="text-sm text-[#9CA3AF]">Set Monthly Budget…</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7E8E21] border-t-transparent" />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto flex flex-col gap-8">

              {/* Hero */}
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-[#2D3335] leading-tight">
                    Managing your{" "}
                    <span className="text-[#7E8E21]">Household Wealth.</span>
                  </h1>
                  <p className="mt-3 text-sm text-[#5A6062] max-w-md">
                    {pctConsumed >= 80
                      ? `Your spending is currently ${Math.round(pctConsumed)}% of your monthly goal. It's time to refine the ledger and prioritize essential pantry needs.`
                      : `You've used ${Math.round(pctConsumed)}% of your monthly budget. Keep it up!`}
                  </p>

                  <p className="mt-6 text-sm font-medium text-[#5A6062]">This Month's Budget</p>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      readOnly
                      value={totalBudget ? formatRp(totalBudget) : ""}
                      placeholder="Rp XXXXXXXX"
                      className="w-52 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#2D3335] outline-none cursor-pointer"
                      onClick={() => setShowModal(true)}
                    />
                    <button
                      onClick={() => setShowModal(true)}
                      className="rounded-xl bg-[#4A541F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3a4118] transition-colors"
                    >
                      Add Budget
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <CircleProgress percentage={pctConsumed} />
                  <p className="mt-1 text-sm font-medium text-[#7E8E21]">
                    {formatRp(totalSpent)} / {formatRp(totalBudget)}
                  </p>
                </div>
              </div>

              {/* Budget Cards */}
              {budgets.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {budgets.map((b) => (
                    <BudgetCard key={b.category_id} budget={b} />
                  ))}
                </div>
              )}

              {/* Spending Analytics */}
              <div className="flex gap-4">
                <div className="flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-6">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-base font-semibold text-[#2D3335]">Spending Analytics</p>
                      <p className="text-xs text-[#5A6062]">Last 30 days trends</p>
                    </div>
                    <div className="flex rounded-full border border-[#E5E7EB] overflow-hidden text-xs font-medium">
                      {["weekly", "monthly"].map((m) => (
                        <button
                          key={m}
                          onClick={() => setViewMode(m)}
                          className={`px-4 py-1.5 capitalize transition-colors ${
                            viewMode === m
                              ? "bg-[#4A541F] text-white"
                              : "text-[#475569] hover:bg-[#F3F4EE]"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Simple bar chart from budget data */}
                  <div className="mt-6 flex items-end gap-2 h-32">
                    {budgets.length > 0 ? (
                      budgets.map((b, i) => {
                        const pct = Math.min((b.spent / (b.monthly_limit || 1)) * 100, 100);
                        const heights = [40, 60, 75, 90];
                        const mockH = heights[i % heights.length];
                        return (
                          <div key={b.category_id} className="flex flex-col items-center flex-1 gap-1">
                            <div
                              className="w-full rounded-t-md transition-all duration-500"
                              style={{
                                height: `${mockH}%`,
                                backgroundColor: i === budgets.length - 1 ? "#7E8E21" : "#D1D9A8",
                              }}
                            />
                            <span className="text-[10px] text-[#9CA3AF]">{b.category_name?.slice(0, 3)}</span>
                          </div>
                        );
                      })
                    ) : (
                      /* Placeholder bars */
                      [25, 40, 55, 70, 50, 65, 90].map((h, i) => (
                        <div key={i} className="flex flex-col items-center flex-1 gap-1">
                          <div
                            className="w-full rounded-t-md"
                            style={{
                              height: `${h}%`,
                              backgroundColor: i === 6 ? "#7E8E21" : "#D1D9A8",
                            }}
                          />
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-[#9CA3AF]">
                    <span>Aug 1</span><span>Aug 10</span><span>Aug 20</span><span>Today</span>
                  </div>
                </div>

                {/* Curated Advice */}
                <div className="w-52 rounded-2xl bg-[#4A541F] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-white">Curated Advice</p>
                      <MdLightbulb size={16} className="text-[#C8D87A]" />
                    </div>
                    <p className="text-xs text-[#C8D87A] leading-relaxed">
                      {pctConsumed > 80
                        ? "Based on your household size, you spend 15% more on pantry items than the average user. Consider wholesale options."
                        : "You're managing your budget well. Keep tracking to stay on top of your spending goals."}
                    </p>
                  </div>
                  <button className="mt-4 w-full rounded-xl border border-white/40 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors">
                    Analyze Pantry →
                  </button>
                </div>
              </div>

              {/* Recent Ledger Entries */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
                <p className="text-base font-semibold text-[#2D3335]">Recent Ledger Entries</p>
                <p className="text-xs text-[#5A6062] mb-4">The latest movements in your household economy.</p>
                <div className="flex flex-col gap-2">
                  {recentTx.length > 0 ? (
                    recentTx.map((tx, i) => <LedgerEntry key={i} tx={tx} />)
                  ) : (
                    <p className="text-sm text-[#9CA3AF] py-4 text-center">No transactions yet.</p>
                  )}
                </div>
                {transactions.length > 3 && (
                  <button className="mt-4 w-full py-3 text-xs font-semibold uppercase tracking-widest text-[#5A6062] hover:text-[#2D3335] transition-colors">
                    Load Previous Month
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {showModal && (
        <SetBudgetModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}