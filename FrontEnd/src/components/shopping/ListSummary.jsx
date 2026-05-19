import { rupiah } from "../../utils/formatter";

export default function ListSummary({ items, subtotal }) {
  const unpurchased = items.filter((i) => !i.is_purchased);

  const byCategory = unpurchased.reduce((acc, item) => {
    const cat = item.category_name || "Other";
    acc[cat] = (acc[cat] || 0) + Number(item.total_price);
    return acc;
  }, {});

  const summaryEntries = Object.entries(byCategory);

  return (
    <div className="rounded-3xl bg-[#4A541F] p-6 text-white">
      <p className="text-xs font-bold uppercase tracking-widest text-[#c8d87a] mb-4">
        List Summary
      </p>

      <p className="text-4xl font-bold text-white mb-5">
        {rupiah(subtotal)}
      </p>

      <div className="flex flex-col gap-2 mb-6">
        {summaryEntries.length > 0 ? (
          summaryEntries.map(([cat, total]) => (
            <div key={cat} className="flex justify-between text-sm">
              <span className="text-[#c8d87a] font-medium">{cat}</span>
              <span className="font-bold text-white">{rupiah(total)}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#c8d87a]">No items yet</p>
        )}
      </div>

      <button className="w-full rounded-full bg-white py-3 text-sm font-bold text-[#4A541F] transition hover:bg-[#E8FFE8] active:scale-95">
        Checkout List
      </button>
    </div>
  );
}