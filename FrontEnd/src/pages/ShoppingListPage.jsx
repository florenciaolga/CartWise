import { useState, useEffect } from "react";
import { MdSearch, MdAdd } from "react-icons/md";
import { RiLeafLine } from "react-icons/ri";
import Sidebar from "../components/sidebar";
import useShoppingList from "../hooks/useShoppingList";
import useAddItem from "../hooks/useAddItem";
import { fetchCategories } from "../api/shoppingApi";
import ShoppingItem from "../components/shopping/ShoppingItem";
import CategoryTabs from "../components/shopping/CategoryTabs";
import ListSummary from "../components/shopping/ListSummary";
import AddItemModal from "../components/modal/AddItemModal";
import { rupiah } from "../utils/formatter";

export default function ShoppingListPage() {
  const [categories, setCategories] = useState([]);

  const {
    items, subtotal, totalItems, loading,
    searchQuery, setSearchQuery,
    activeCategoryId, setActiveCategoryId,
    handleToggle, handleQuantityChange,
    refetch,
  } = useShoppingList();

  const addItem = useAddItem(refetch);

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const unpurchased = items.filter((i) => !i.is_purchased);
  const purchased   = items.filter((i) => i.is_purchased);

  const remaining = unpurchased.length;

  const lowStockItems = [
    { name: "Milk" },
    { name: "Large Eggs" },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F4F6EE] font-manrope overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#2D3335]">Shopping List</h1>
            <p className="mt-1 text-sm text-[#5A6062] font-medium">
              Manage your weekly essentials and market finds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ACACAC]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your list..."
                className="rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-5 text-sm text-[#2D3335] outline-none focus:ring-2 focus:ring-[#7E8E21] transition w-[220px]"
              />
            </div>

            <button
              onClick={addItem.open}
              className="flex items-center gap-2 rounded-full bg-[#4A541F] px-5 py-2.5 text-sm font-bold text-[#E8FFE8] shadow transition hover:bg-[#7E8E21] active:scale-95"
            >
              <MdAdd size={18} />
              Add Item
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="mb-5">
              <CategoryTabs
                categories={categories}
                activeCategoryId={activeCategoryId}
                onSelect={setActiveCategoryId}
              />
            </div>

            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9aa0a6]">
                Current Essentials
              </p>
              {remaining > 0 && (
                <span className="rounded-full bg-[#4A541F] px-3 py-1 text-xs font-bold text-[#E8FFE8]">
                  {remaining} item{remaining > 1 ? "s" : ""} remaining
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm text-[#9aa0a6]">
                Loading...
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {unpurchased.length > 0 ? (
                  unpurchased.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                      onQuantityChange={handleQuantityChange}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-12 text-center border border-gray-100">
                    <p className="text-2xl mb-2">🛒</p>
                    <p className="text-sm font-semibold text-[#9aa0a6]">No items yet</p>
                    <p className="text-xs text-[#ACACAC] mt-1">Click "+ Add Item" to get started</p>
                  </div>
                )}

                {purchased.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {purchased.map((item) => (
                      <ShoppingItem
                        key={item.id}
                        item={item}
                        onToggle={handleToggle}
                        onQuantityChange={handleQuantityChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-[240px] shrink-0 flex flex-col gap-5">
            <ListSummary items={items} subtotal={subtotal} />

            <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-sm">
              <p className="text-sm font-bold text-[#2D3335] mb-4">Running Low</p>
              <div className="flex flex-col gap-4">
                {lowStockItems.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F6EE]">
                      <RiLeafLine size={16} className="text-[#4A541F]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#2D3335]">{item.name}</p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
                        <div className="h-full w-[20%] rounded-full bg-red-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full text-center text-xs font-bold text-[#7E8E21] hover:underline transition">
                View Full Inventory
              </button>
            </div>

            <div className="rounded-3xl bg-[#FAFAF0] border border-[#e8f0c8] p-5">
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#4A541F] mb-2">
                ✦ Smart Suggestions
              </p>
              <p className="text-xs text-[#5A6062] leading-relaxed">
                You usually buy <strong className="text-[#4A541F]">Greek Yogurt</strong> on Tuesdays.
                Would you like to add it?
              </p>
              <button
                onClick={addItem.open}
                className="mt-4 w-full rounded-full border border-[#4A541F] py-2 text-xs font-bold text-[#4A541F] hover:bg-[#4A541F] hover:text-[#E8FFE8] transition"
              >
                Add to list
              </button>
            </div>
          </div>
        </div>
      </main>

      <AddItemModal
        isOpen={addItem.isOpen}
        onClose={addItem.close}
        form={addItem.form}
        onChange={addItem.handleChange}
        categories={addItem.categories}
        onSubmit={addItem.handleSubmit}
        isSubmitting={addItem.isSubmitting}
        error={addItem.error}
      />
    </div>
  );
}