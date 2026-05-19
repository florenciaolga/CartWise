import { useState, useEffect, useCallback } from "react";
import {
  fetchShoppingItems,
  updateShoppingQuantity,
  togglePurchased,
  deleteShoppingItem,
} from "../api/shoppingApi";

export default function useShoppingList() {
  const [items, setItems]               = useState([]);
  const [subtotal, setSubtotal]         = useState(0);
  const [totalItems, setTotalItems]     = useState(0);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(null); // null = All Items

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery)      params.search      = searchQuery;
      if (activeCategoryId) params.category_id = activeCategoryId;

      const data = await fetchShoppingItems(params);
      setItems(data.items || []);
      setSubtotal(data.subtotal || 0);
      setTotalItems(data.total_items || 0);
    } catch (err) {
      console.error("Shopping list fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategoryId]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id) => {
    try {
      await togglePurchased(id);
      load();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleQuantityChange = async (id, newQty) => {
    if (newQty < 1 || newQty > 1000) return;
    try {
      await updateShoppingQuantity(id, newQty);
      load();
    } catch (err) {
      console.error("Quantity update error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteShoppingItem(id);
      load();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return {
    items, subtotal, totalItems, loading,
    searchQuery, setSearchQuery,
    activeCategoryId, setActiveCategoryId,
    handleToggle, handleQuantityChange, handleDelete,
    refetch: load,
  };
}