import { useState, useEffect } from "react";
import { addShoppingItem, fetchCategories } from "../api/shoppingApi";

const INITIAL_FORM = {
  name: "",
  price_per_unit: "",
  quantity: 1,
  category_id: "",
};

export default function useQuickAdd(onSuccess) {
  const [isOpen, setIsOpen]             = useState(false);
  const [form, setForm]                 = useState(INITIAL_FORM);
  const [categories, setCategories]     = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState("");

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.rows ?? [];
        setCategories(list);
      })
      .catch((err) => console.error("Failed to fetch categories:", err.response ?? err));
  }, []);

  const open = () => {
    setForm(INITIAL_FORM);
    setError("");
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim())                                         { setError("Grocery name is required."); return; }
    if (form.name.trim().length < 2)                               { setError("Item name must be at least 2 characters."); return; }
    if (!form.price_per_unit || Number(form.price_per_unit) <= 0) { setError("Price per unit must be greater than 0."); return; }
    if (!form.quantity || Number(form.quantity) < 1)              { setError("Quantity must be at least 1."); return; }
    if (!form.category_id)                                        { setError("Please select a category."); return; }

    setIsSubmitting(true);
    setError("");

    try {
      await addShoppingItem({
        name:           form.name.trim(),
        price_per_unit: Number(form.price_per_unit),
        quantity:       Number(form.quantity),
        category_id:    Number(form.category_id),
      });
      close();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to add item. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen, open, close,
    form, handleChange,
    categories,
    handleSubmit, isSubmitting, error,
  };
}