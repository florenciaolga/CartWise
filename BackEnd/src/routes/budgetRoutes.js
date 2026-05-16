const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  setBudget,
  getBudgetTracker,
} = require("../controllers/budgetController");

router.get("/", authMiddleware, getBudgetTracker);
router.post("/", authMiddleware, setBudget);

module.exports = router;