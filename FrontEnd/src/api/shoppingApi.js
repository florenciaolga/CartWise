import api from "../lib/axios";

export const addShoppingItem = (payload) =>
  api.post("/shopping", payload).then((res) => res.data);

export const fetchCategories = () =>
  api.get("/shopping/categories/all").then((res) => res.data);