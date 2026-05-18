import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import {
  MdSearch,
  MdAdd,
  MdFilterList,
  MdSort,
  MdDelete,
  MdWarning,
  MdError,
} from "react-icons/md";

const BASE_URL = "http://localhost:3000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ item }) {
  if (item.is_expired)
    return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">Expired</span>;
  if (item.is_out_of_stock)
    return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">Out of Stock</span>;
  if (item.is_low_stock)
    return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600">Low Stock</span>;
  return <span className="rounded-full bg-[#EEF3D2] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5A6A10]">In Stock</span>;
}

function ItemRow({ item, onUpdateStock, onDelete }) {
  const [localStock, setLocalStock] = useState(item.stock);
  const [updating, setUpdating] = useState(false);

  async function changeStock(delta) {
    const newStock = Math.max(0, localStock + delta);
    if (newStock === localStock) return;
    setUpdating(true);
    setLocalStock(newStock);
    try {
      await fetch(`${BASE_URL}/inventory/${item.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ stock: newStock }),
      });
      onUpdateStock();
    } catch (e) {
      setLocalStock(localStock);
    } finally {
      setUpdating(false);
    }
  }

  const isExpired = item.is_expired;

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 border-b border-[#F3F4EE] last:border-0 hover:bg-[#FAFBF6] transition-colors group">
      {/* Image placeholder */}
      <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-[#E8EDD4]">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[#7E8E21] text-xs font-bold">
            {item.name?.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name & category */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isExpired ? "line-through text-[#9CA3AF]" : "text-[#2D3335]"}`}>
          {item.name}
        </p>
        <p className="text-xs text-[#5A6062]">
          {item.category_name}
          {item.unit ? ` • ${item.unit}` : ""}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2 w-28">
        <button
          onClick={() => changeStock(-1)}
          disabled={updating || localStock === 0}
          className="h-7 w-7 rounded-full border border-[#D1D9A8] flex items-center justify-center text-[#4A541F] font-bold text-sm hover:bg-[#EEF3D2] disabled:opacity-30 transition-colors"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-semibold text-[#2D3335]">{localStock}</span>
        <button
          onClick={() => changeStock(1)}
          disabled={updating}
          className="h-7 w-7 rounded-full bg-[#4A541F] flex items-center justify-center text-white hover:bg-[#3a4118] disabled:opacity-50 transition-colors"
        >
          <MdAdd size={14} />
        </button>
      </div>

      {/* Expires */}
      <div className="w-28 text-right">
        <span className={`text-sm ${isExpired ? "text-red-500 font-semibold" : "text-[#2D3335]"}`}>
          {formatDate(item.expiration_date)}
        </span>
      </div>

      {/* Status */}
      <div className="w-24 flex justify-end">
        <StatusBadge item={item} />
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-[#CBD5E1] hover:text-red-400"
      >
        <MdDelete size={18} />
      </button>
    </div>
  );
}

function AddItemModal({ categories, onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    expiration_date: "",
    stock: "1",
    category_id: categories[0]?.id || "",
    price_per_unit: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError("Grocery name is required."); return; }
    if (!form.price_per_unit || isNaN(form.price_per_unit) || Number(form.price_per_unit) <= 0) {
      setError("Price per unit must be greater than 0."); return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/inventory`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          stock: Number(form.stock) || 1,
          expiration_date: form.expiration_date || undefined,
          price_per_unit: Number(form.price_per_unit),
          category_id: Number(form.category_id),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to add item.");
      } else {
        onAdded();
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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[#2D3335] mb-5">Add to Inventory</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-[#5A6062] mb-1 block">Grocery Name</label>
            <input
              type="text"
              placeholder="e.g. Organic Almond Milk"
              className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#2D3335] outline-none focus:border-[#7E8E21] transition-colors"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#5A6062] mb-1 block">Expiry Date</label>
              <input
                type="date"
                className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#2D3335] outline-none focus:border-[#7E8E21] transition-colors"
                value={form.expiration_date}
                onChange={(e) => setField("expiration_date", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#5A6062] mb-1 block">Quantity</label>
              <input
                type="number"
                min="0"
                max="1000"
                className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#2D3335] outline-none focus:border-[#7E8E21] transition-colors"
                value={form.stock}
                onChange={(e) => setField("stock", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#5A6062] mb-1 block">Category</label>
              <select
                className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#2D3335] outline-none focus:border-[#7E8E21] transition-colors"
                value={form.category_id}
                onChange={(e) => setField("category_id", e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#5A6062] mb-1 block">Price per Unit (Rp)</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 15000"
                className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#2D3335] outline-none focus:border-[#7E8E21] transition-colors"
                value={form.price_per_unit}
                onChange={(e) => setField("price_per_unit", e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-medium text-[#475569] hover:bg-[#F9FAF5] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#4A541F] py-3 text-sm font-semibold text-white hover:bg-[#3a4118] disabled:opacity-60 transition-colors"
          >
            {saving ? "Adding…" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

const SIDEBAR_CATEGORIES = ["All Items", "Pantry", "Refrigerator", "Home Care"];

export default function Inventor() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total_items: 0, low_stock_count: 0, expired_count: 0, expiring_soon_count: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [showAdd, setShowAdd] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const [invRes, catRes] = await Promise.all([
        fetch(`${BASE_URL}/inventory?${params}`, { headers: getAuthHeaders() }),
        fetch(`${BASE_URL}/categories`, { headers: getAuthHeaders() }).catch(() => ({ ok: false })),
      ]);

      if (invRes.ok) {
        const d = await invRes.json();
        setItems(d.items || []);
        setMeta({
          total_items: d.total_items ?? 0,
          low_stock_count: d.low_stock_count ?? 0,
          expired_count: d.expired_count ?? 0,
          expiring_soon_count: d.expiring_soon_count ?? 0,
        });
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
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchInventory, 300);
    return () => clearTimeout(t);
  }, [fetchInventory]);

  async function handleDelete(id) {
    if (!window.confirm("Remove this item from inventory?")) return;
    await fetch(`${BASE_URL}/inventory/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    fetchInventory();
  }

  // Client-side category filter for sidebar categories
  const filteredItems = items.filter((item) => {
    if (activeCategory === "All Items") return true;
    const map = { Pantry: "Pantry", Refrigerator: "Refrigerator", "Home Care": "Home Care" };
    return item.category_name === map[activeCategory] || item.category_name?.toLowerCase().includes(activeCategory.toLowerCase());
  });

  // Category counts
  const catCounts = {
    "All Items": meta.total_items,
    Pantry: items.filter((i) => i.category_name === "Pantry").length,
    Refrigerator: items.filter((i) => i.category_name === "Refrigerator" || i.category_name === "Fridge").length,
    "Home Care": items.filter((i) => i.category_name === "Home Care" || i.category_name === "Cleaning").length,
  };

  // Storage health: 100% optimal if no expired/out-of-stock
  const healthPct = meta.total_items > 0
    ? Math.max(0, Math.round(100 - ((meta.expired_count / meta.total_items) * 100)))
    : 100;
  const healthLabel = healthPct === 100 ? "Optimal" : healthPct >= 70 ? "Good" : "Needs Attention";

  // Expiring soon names
  const expiringSoonItems = items.filter((i) => i.is_expiring_soon && !i.is_expired).map((i) => i.name);
  const expiredItems = items.filter((i) => i.is_expired).map((i) => i.name);

  return (
    <div className="flex h-screen bg-[#F5F6F0] overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center border-b border-[#E5E7EB] bg-white px-6 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-[#F3F4EE] px-4 py-2 max-w-xs">
            <MdSearch size={16} className="text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search inventory…"
              className="flex-1 bg-transparent text-sm text-[#2D3335] outline-none placeholder:text-[#9CA3AF]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="w-56 shrink-0 border-r border-[#E5E7EB] bg-white flex flex-col gap-6 p-5 overflow-y-auto">

            {/* Categories */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">Categories</p>
              <div className="flex flex-col gap-0.5">
                {SIDEBAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                      activeCategory === cat
                        ? "bg-[#EEF3D2] text-[#4A541F] font-semibold"
                        : "text-[#475569] hover:bg-[#F9FAF5]"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-xs ${activeCategory === cat ? "text-[#4A541F]" : "text-[#9CA3AF]"}`}>
                      {catCounts[cat] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Health */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">Storage Health</p>
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <svg width="100" height="100" className="-rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="38" fill="none"
                      stroke="#7E8E21" strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * (1 - healthPct / 100)}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-lg font-bold text-[#2D3335]">{healthPct}%</span>
                    <span className="text-[9px] text-[#5A6062] uppercase tracking-wider">{healthLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#2D3335]">Inventory Manager</h1>
                <p className="text-sm text-[#5A6062] mt-1">
                  Maintain your household essentials with editorial precision.<br />
                  Less waste, more taste.
                </p>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 rounded-xl bg-[#4A541F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3a4118] transition-colors"
              >
                <MdAdd size={18} />
                Add Item to Inventory
              </button>
            </div>

            {/* Alert banners */}
            <div className="flex gap-4 mb-6">
              {meta.expired_count > 0 && (
                <div className="flex-1 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <MdError size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-700">Expired ({meta.expired_count})</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      {expiredItems.slice(0, 3).join(", ")}{expiredItems.length > 3 ? "…" : ""}. Dispose and replace.
                    </p>
                  </div>
                </div>
              )}
              {meta.expiring_soon_count > 0 && (
                <div className="flex-1 flex items-start gap-3 rounded-xl bg-[#F5F7E8] border border-[#D1D9A8] p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8EDD4]">
                    <MdWarning size={16} className="text-[#7E8E21]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#4A541F]">Expiring Soon ({meta.expiring_soon_count})</p>
                    <p className="text-xs text-[#5A6062] mt-0.5">
                      {expiringSoonItems.slice(0, 4).join(", ")}{expiringSoonItems.length > 4 ? "…" : ""}. Use within 48h.
                    </p>
                  </div>
                </div>
              )}
              {meta.expired_count === 0 && meta.expiring_soon_count === 0 && (
                <div className="flex-1 flex items-start gap-3 rounded-xl bg-[#F5F7E8] border border-[#D1D9A8] p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8EDD4]">
                    <MdWarning size={16} className="text-[#7E8E21]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#4A541F]">All items are fresh</p>
                    <p className="text-xs text-[#5A6062] mt-0.5">No expiring or expired items.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Inventory table */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4EE]">
                <p className="text-base font-semibold text-[#2D3335]">In-Stock Essentials</p>
                <div className="flex gap-2">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#475569] hover:bg-[#F9FAF5] transition-colors">
                    <MdFilterList size={16} />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#475569] hover:bg-[#F9FAF5] transition-colors">
                    <MdSort size={16} />
                  </button>
                </div>
              </div>

              {/* Table header */}
              <div className="flex items-center gap-4 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] border-b border-[#F3F4EE]">
                <div className="w-12 shrink-0" />
                <div className="flex-1">Item Name</div>
                <div className="w-28">Quantity</div>
                <div className="w-28 text-right">Expires</div>
                <div className="w-24 text-right">Status</div>
                <div className="w-8" />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#7E8E21] border-t-transparent" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <p className="text-sm text-[#9CA3AF]">No items found.</p>
                  <button
                    onClick={() => setShowAdd(true)}
                    className="text-xs text-[#7E8E21] font-medium hover:underline"
                  >
                    + Add your first item
                  </button>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onUpdateStock={fetchInventory}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddItemModal
          categories={categories.length > 0 ? categories : [
            { id: 1, name: "Groceries" },
            { id: 2, name: "Household" },
            { id: 3, name: "Personal" },
          ]}
          onClose={() => setShowAdd(false)}
          onAdded={fetchInventory}
        />
      )}
    </div>
  );
}