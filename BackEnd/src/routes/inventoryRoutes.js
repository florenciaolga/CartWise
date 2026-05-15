const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getInventoryItems,
  addInventoryItem,
  updateInventoryStock,
  deleteInventoryItem,
} = require("../controllers/inventoryController");

router.get(
  "/",
  authMiddleware,
  getInventoryItems
);

router.post("/", authMiddleware, addInventoryItem);
router.put("/:id", authMiddleware, updateInventoryStock);
router.delete("/:id", authMiddleware, deleteInventoryItem);

module.exports = router;