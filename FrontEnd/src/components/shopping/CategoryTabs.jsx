export default function CategoryTabs({ categories, activeCategoryId, onSelect }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all
          ${activeCategoryId === null
            ? "bg-[#4A541F] text-[#E8FFE8]"
            : "text-[#5A6062] hover:bg-gray-100"
          }`}
      >
        All Items
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all
            ${activeCategoryId === cat.id
              ? "bg-[#4A541F] text-[#E8FFE8]"
              : "text-[#5A6062] hover:bg-gray-100"
            }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}