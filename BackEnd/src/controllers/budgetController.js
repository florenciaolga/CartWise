const pool = require("../config/db");

const setBudget = async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      category_id,
      month,
      year,
      monthly_limit,
    } = req.body;

    if (
      !category_id ||
      !month ||
      !year ||
      !monthly_limit
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        error: "Month must be between 1-12",
      });
    }

    if (monthly_limit <= 0) {
      return res.status(400).json({
        error: "Monthly limit must be greater than 0",
      });
    }

    const category = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE id = $1
      `,
      [category_id]
    );

    if (category.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid category",
      });
    }

    const existingBudget = await pool.query(
      `
      SELECT *
      FROM budgets
      WHERE user_id = $1
      AND category_id = $2
      AND month = $3
      AND year = $4
      `,
      [
        user_id,
        category_id,
        month,
        year,
      ]
    );

    let budget;

    if (existingBudget.rows.length > 0) {
      budget = await pool.query(
        `
        UPDATE budgets
        SET monthly_limit = $1
        WHERE id = $2
        RETURNING *
        `,
        [
          monthly_limit,
          existingBudget.rows[0].id,
        ]
      );
    } else {
      budget = await pool.query(
        `
        INSERT INTO budgets
        (
          user_id,
          category_id,
          month,
          year,
          monthly_limit
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          user_id,
          category_id,
          month,
          year,
          monthly_limit,
        ]
      );
    }

    res.json({
      message: "Budget saved successfully",
      budget: budget.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const getBudgetTracker = async (req, res) => {
  try {
    const user_id = req.user.id;

    const currentDate = new Date();

    const month =
      currentDate.getMonth() + 1;

    const year =
      currentDate.getFullYear();

    const budgetsResult = await pool.query(
      `
      SELECT
        budgets.id,
        budgets.category_id,
        budgets.monthly_limit,
        categories.name AS category_name
      FROM budgets
      JOIN categories
      ON budgets.category_id = categories.id
      WHERE budgets.user_id = $1
      AND budgets.month = $2
      AND budgets.year = $3
      `,
      [user_id, month, year]
    );

    const budgets = [];

    let total_budget = 0;

    let total_spent = 0;

    for (const budget of budgetsResult.rows) {
      const transactionResult =
        await pool.query(
          `
          SELECT
            COALESCE(
              SUM(total_price),
              0
            ) AS spent
          FROM transactions
          WHERE user_id = $1
          AND category_id = $2
          AND EXTRACT(MONTH FROM transaction_date) = $3
          AND EXTRACT(YEAR FROM transaction_date) = $4
          `,
          [
            user_id,
            budget.category_id,
            month,
            year,
          ]
        );

      const spent = Number(
        transactionResult.rows[0].spent
      );

      const remaining =
        budget.monthly_limit - spent;

      const percentage_used =
        (
          (spent / budget.monthly_limit) *
          100
        ).toFixed(1);

      const is_over_budget =
        spent > budget.monthly_limit;

      total_budget += Number(
        budget.monthly_limit
      );

      total_spent += spent;

      budgets.push({
        ...budget,
        spent,
        remaining,
        percentage_used:
          Number(percentage_used),
        is_over_budget,
      });
    }

    res.json({
      total_budget,
      total_spent,
      total_remaining:
        total_budget - total_spent,
      budgets,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  setBudget,
  getBudgetTracker,
};