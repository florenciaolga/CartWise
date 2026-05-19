const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getShoppingItems,
  addShoppingItem,
  updateShoppingQuantity,
  togglePurchasedStatus,
  deleteShoppingItem,
  getCategories,
  checkoutShoppingList,
} = require("../controllers/shoppingController");

router.get("/categories/all", authMiddleware, getCategories);
router.get("/", authMiddleware, getShoppingItems);
router.post("/", authMiddleware, addShoppingItem);
router.post("/checkout", authMiddleware, checkoutShoppingList);

router.put("/:id", authMiddleware, updateShoppingQuantity);
router.patch("/:id/purchased", authMiddleware, togglePurchasedStatus);
router.delete("/:id", authMiddleware, deleteShoppingItem);

module.exports = router;