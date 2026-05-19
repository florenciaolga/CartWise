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