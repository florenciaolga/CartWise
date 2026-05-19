import api from "../lib/axios";

export const fetchShoppingItems = (params) =>
  api.get("/shopping", { params }).then((res) => res.data);

export const addShoppingItem = (payload) =>
  api.post("/shopping", payload).then((res) => res.data);

export const updateShoppingQuantity = (id, quantity) =>
  api.put(`/shopping/${id}`, { quantity }).then((res) => res.data);

export const togglePurchased = (id) =>
  api.patch(`/shopping/${id}/purchased`).then((res) => res.data);

export const deleteShoppingItem = (id) =>
  api.delete(`/shopping/${id}`).then((res) => res.data);

export const fetchCategories = () =>
  api.get("/shopping/categories/all").then((res) => res.data);

/**
 * Moves all purchased shopping-list items into inventory,
 * then deletes them from the shopping list.
 * Expects the backend to handle the transfer atomically.
 */
export const checkoutShoppingList = () =>
  api.post("/shopping/checkout").then((res) => res.data);

/**
 * Returns inventory items whose stock === 1 (running low).
 */
export const fetchLowStockItems = () =>
  api.get("/inventory", { params: { low_stock: true } }).then((res) =>
    (res.data.items || []).filter((item) => item.stock === 1)
  );