const express = require("express");
const cors = require("cors"); 

const pool = require("./config/db");

const app = express();

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const shoppingRoutes = require("./routes/shoppingRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/shopping", shoppingRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "CartWise API running",
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database connection failed",
    });
  }
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = app;