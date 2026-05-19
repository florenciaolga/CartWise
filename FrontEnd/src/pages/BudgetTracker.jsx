import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { MdRestaurant, MdHome, MdSpa, MdLocalDrink, MdCleaningServices } from "react-icons/md";
import { getToken } from "../services/authService";

const BASE_URL = "http://localhost:3000/api";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

const DB_CATEGORIES = [
  { id: 1, name: "Groceries",         icon: MdRestaurant,       color: "#7E8E21", bg: "#F0F4E0" },
  { id: 2, name: "Personal Care",     icon: MdSpa,              color: "#7E8E21", bg: "#F0F4E0" },
  { id: 3, name: "Beverages",         icon: MdLocalDrink,       color: "#7E8E21", bg: "#F0F4E0" },
  { id: 4, name: "Cleaning Supplies", icon: MdCleaningServices, color: "#7E8E21", bg: "#F0F4E0" },
  { id: 5, name: "Household",         icon: MdHome,             color: "#E05252", bg: "#FDE8E8" },
];

function getCategoryMeta(name) {
  return DB_CATEGORIES.find((c) => c.name === name) ||
    { icon: MdHome, color: "#7E8E21", bg: "#F0F4E0" };
}

function formatRp(amount) {
  if (amount == null) return "Rp0";
  return "Rp" + Number(amount).toLocaleString("id-ID");
}

// ─── Circle Progress ──────────────────────────────────────────────────────────
function CircleProgress({ percentage, totalSpent, totalBudget }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percentage, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
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
      <p className="text-sm font-medium text-[#7E8E21]">
        {formatRp(totalSpent)} / {formatRp(totalBudget)}
      </p>
    </div>
  );
}

// ─── Budget Card per Category ─────────────────────────────────────────────────
function BudgetCard({ budget }) {
  const meta = getCategoryMeta(budget.category_name);
  const Icon = meta.icon;
  const pct  = Math.min(budget.percentage_used ?? 0, 100);
  const isOver = budget.is_over_budget;

  let badge, badgeColor;
  if (isOver)         { badge = "Limit Reached"; badgeColor = "bg-red-100 text-red-600"; }
  else if (pct >= 70) { badge = "Watch Out";     badgeColor = "bg-yellow-100 text-yellow-700"; }
  else                { badge = "In Control";    badgeColor = "bg-[#EEF3D2] text-[#5A6A10]"; }

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: meta.bg }}>
          <Icon size={20} style={{ color: meta.color }} />
        </div>
        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${badgeColor}`}>{badge}</span>
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
          style={{ width: `${pct}%`, backgroundColor: isOver ? "#E05252" : "#7E8E21" }}
        />
      </div>
    </div>
  );
}

// ─── Set Budget Modal ─────────────────────────────────────────────────────────
function SetBudgetModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    category_id:   DB_CATEGORIES[0].id,
    monthly_limit: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const now = new Date();

  async function handleSubmit() {
    if (!form.monthly_limit || isNaN(form.monthly_limit) || Number(form.monthly_limit) <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/budgets`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          category_id:   Number(form.category_id),
          month:         now.getMonth() + 1,
          year:          now.getFullYear(),
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
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#2D3335] outline-none focus:border-[#7E8E21] transition-colors"
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            >
              {DB_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#5A6062] mb-1 block">Monthly Limit (Rp)</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 500000"
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#2D3335] outline-none focus:border-[#7E8E21] transition-colors"
              value={form.monthly_limit}
              onChange={(e) => setForm((f) => ({ ...f, monthly_limit: e.target.value }))}
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F9FAF5] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#4A541F] py-2.5 text-sm font-semibold text-white hover:bg-[#3a4118] disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : "Add Budget"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BudgetTracker() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode]   = useState("monthly");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Only fetch /api/budgets — no /api/transactions (endpoint doesn't exist)
      const res = await fetch(`${BASE_URL}/budgets`, { headers: getAuthHeaders() });
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalBudget = data?.total_budget ?? 0;
  const totalSpent  = data?.total_spent  ?? 0;
  // total_spent comes from inventory transactions (added automatically when item is added)
  const pctConsumed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const budgets     = data?.budgets ?? [];

  return (
    <div className="flex h-screen bg-[#F5F6F0] overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
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

                {/* Circle — total semua kategori */}
                <CircleProgress
                  percentage={pctConsumed}
                  totalSpent={totalSpent}
                  totalBudget={totalBudget}
                />
              </div>

              {/* Budget Cards per kategori */}
              {budgets.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {budgets.map((b) => (
                    <BudgetCard key={b.category_id} budget={b} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D1D9A8] bg-white p-10 text-center">
                  <p className="text-sm font-semibold text-[#5A6062]">No budgets set yet.</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Click "Add Budget" to set a limit for each category.</p>
                </div>
              )}

              {/* Spending Analytics Bar Chart */}
              {/* <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-base font-semibold text-[#2D3335]">Spending Analytics</p>
                    <p className="text-xs text-[#5A6062]">Budget usage per category</p>
                  </div>
                  <div className="flex rounded-full border border-[#E5E7EB] overflow-hidden text-xs font-medium">
                    {["weekly", "monthly"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setViewMode(m)}
                        className={`px-4 py-1.5 capitalize transition-colors ${
                          viewMode === m ? "bg-[#4A541F] text-white" : "text-[#475569] hover:bg-[#F3F4EE]"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-end gap-3 h-32">
                  {budgets.length > 0 ? (
                    budgets.map((b, i) => {
                      const barH = Math.max(8, Math.min((b.spent / (b.monthly_limit || 1)) * 100, 100));
                      const isOver = b.is_over_budget;
                      return (
                        <div key={b.category_id} className="flex flex-col items-center flex-1 gap-1">
                          <div
                            className="w-full rounded-t-md transition-all duration-500"
                            style={{
                              height: `${barH}%`,
                              backgroundColor: isOver ? "#E05252" : i === budgets.length - 1 ? "#7E8E21" : "#D1D9A8",
                            }}
                          />
                          <span className="text-[10px] text-[#9CA3AF] text-center leading-tight">
                            {b.category_name?.slice(0, 5)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    [25, 40, 55, 70, 50].map((h, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 gap-1">
                        <div className="w-full rounded-t-md bg-[#F3F4EE]" style={{ height: `${h}%` }} />
                      </div>
                    ))
                  )}
                </div>
              </div> */}

            </div>
          )}
        </div>
      </div>

      {showModal && (
        <SetBudgetModal
          onClose={() => setShowModal(false)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}