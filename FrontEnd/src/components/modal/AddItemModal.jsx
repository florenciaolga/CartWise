import { rupiah } from "../../utils/formatter";

export default function AddItemModal({
  isOpen, onClose,
  form, onChange,
  categories,
  onSubmit, isSubmitting, error,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] rounded-3xl bg-white p-8 shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-bold text-[#2D3335]">
          Quick Add to Shopping List
        </h2>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#2D3335]">Grocery Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g. Organic Almond Milk"
              className="w-full rounded-2xl border border-gray-200 bg-[#F8F9FA] px-4 py-3 text-sm text-[#2D3335] placeholder:text-[#ACACAC] outline-none focus:ring-2 focus:ring-[#7E8E21] transition"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#2D3335]">Price per unit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#ACACAC]">Rp</span>
                <input
                  type="number"
                  min="1"
                  value={form.price_per_unit}
                  onChange={(e) => onChange("price_per_unit", e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-gray-200 bg-[#F8F9FA] py-3 pl-9 pr-4 text-sm text-[#2D3335] outline-none focus:ring-2 focus:ring-[#7E8E21] transition"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5" style={{ width: "120px" }}>
              <label className="text-sm font-semibold text-[#2D3335]">Quantity</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={form.quantity}
                onChange={(e) => onChange("quantity", e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-[#F8F9FA] px-4 py-3 text-sm text-[#2D3335] outline-none focus:ring-2 focus:ring-[#7E8E21] transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#2D3335]">Category</label>
            <div className="relative">
              <select
                value={form.category_id}
                onChange={(e) => onChange("category_id", e.target.value)}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-[#F8F9FA] px-4 py-3 text-sm text-[#2D3335] outline-none focus:ring-2 focus:ring-[#7E8E21] transition cursor-pointer"
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#ACACAC]"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-red-500">⚠ {error}</p>}
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-[#5A6062] hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-[#4A541F] px-6 py-2.5 text-sm font-bold text-[#E8FFE8] shadow transition hover:bg-[#7E8E21] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}