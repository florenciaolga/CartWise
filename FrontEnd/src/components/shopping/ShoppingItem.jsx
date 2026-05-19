import { rupiah } from "../../utils/formatter";

export default function ShoppingItem({ item, onToggle, onQuantityChange }) {
  const isPurchased = item.is_purchased;

  return (
    <div className={`flex items-center gap-4 rounded-2xl px-4 py-4 transition-all border
      ${isPurchased
        ? "bg-[#F8F9FA] border-gray-100 opacity-60"
        : "bg-white border-gray-100 hover:border-[#c8d87a]"
      }`}
    >
      <button
        onClick={() => onToggle(item.id)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all
          ${isPurchased
            ? "border-[#7E8E21] bg-[#7E8E21]"
            : "border-gray-300 hover:border-[#7E8E21]"
          }`}
      >
        {isPurchased && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-[#2D3335] truncate ${isPurchased ? "line-through text-[#9aa0a6]" : ""}`}>
          {item.name}
        </p>
        <p className="text-xs text-[#9aa0a6] flex items-center gap-1 mt-0.5">
          <span>🏷</span> {item.category_name}
        </p>
        {isPurchased && (
          <p className="text-xs text-[#9aa0a6] mt-0.5">✓ Purchased {item.updated_at ? "recently" : ""}</p>
        )}
      </div>

      {!isPurchased && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-[#5A6062] hover:border-[#7E8E21] hover:text-[#7E8E21] transition"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-semibold text-[#2D3335]">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-[#5A6062] hover:border-[#7E8E21] hover:text-[#7E8E21] transition"
          >
            +
          </button>
        </div>
      )}

      <div className="text-right min-w-[80px]">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#9aa0a6]">EST. PRICE</p>
        <p className={`text-sm font-bold ${isPurchased ? "text-[#9aa0a6]" : "text-[#7E8E21]"}`}>
          {rupiah(item.total_price)}
        </p>
      </div>
    </div>
  );
}