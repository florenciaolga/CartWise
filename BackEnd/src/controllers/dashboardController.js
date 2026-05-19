const pool = require("../config/db");

const getDashboardData = async (req, res) => {
  try {
    const user_id = req.user.id;

    const currentDate = new Date();

    const month =
      currentDate.getMonth() + 1;

    const year =
      currentDate.getFullYear();

    const budgetResult = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(monthly_limit),
          0
        ) AS total_budget
      FROM budgets
      WHERE user_id = $1
      AND month = $2
      AND year = $3
      `,
      [user_id, month, year]
    );

    const total_budget = Number(
      budgetResult.rows[0].total_budget
    );

    // TOTAL SPENT
    const spendingResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            SUM(total_price),
            0
          ) AS total_spent
        FROM transactions
        WHERE user_id = $1
        AND EXTRACT(MONTH FROM transaction_date) = $2
        AND EXTRACT(YEAR FROM transaction_date) = $3
        `,
        [user_id, month, year]
      );

    const total_spent = Number(
      spendingResult.rows[0].total_spent
    );

    let previousMonth = month - 1;

    let previousYear = year;

    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear--;
    }

    const previousSpendingResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            SUM(total_price),
            0
          ) AS previous_spending
        FROM transactions
        WHERE user_id = $1
        AND EXTRACT(MONTH FROM transaction_date) = $2
        AND EXTRACT(YEAR FROM transaction_date) = $3
        `,
        [
          user_id,
          previousMonth,
          previousYear,
        ]
      );

    const previous_spending = Number(
      previousSpendingResult.rows[0]
        .previous_spending
    );

    let spending_change_percentage = 0;

    if (previous_spending > 0) {
      spending_change_percentage =
        Number(
          (
            ((total_spent -
              previous_spending) /
              previous_spending) *
            100
          ).toFixed(1)
        );
    }

    const total_remaining =
      total_budget - total_spent;

    const percentage_used =
      total_budget > 0
        ? Number(
            (
              (total_spent /
                total_budget) *
              100
            ).toFixed(1)
          )
        : 0;

    const expiringSoonResult =
      await pool.query(
        `
        SELECT
          name,
          expiration_date
        FROM inventory_items
        WHERE user_id = $1
        AND expiration_date >= CURRENT_DATE
        AND expiration_date <= CURRENT_DATE + INTERVAL '3 days'
        ORDER BY expiration_date ASC
        LIMIT 3
        `,
        [user_id]
      );

    const shoppingPendingResult =
      await pool.query(
        `
        SELECT COUNT(*) AS pending_count
        FROM shopping_items
        WHERE user_id = $1
        AND is_purchased = false
        `,
        [user_id]
      );

    const pending_shopping_count =
      Number(
        shoppingPendingResult.rows[0]
          .pending_count
      );

    const lowStockResult =
      await pool.query(
        `
        SELECT COUNT(*) AS low_stock_count
        FROM inventory_items
        WHERE user_id = $1
        AND stock <= minimum_stock
        `,
        [user_id]
      );

    const low_stock_count = Number(
      lowStockResult.rows[0]
        .low_stock_count
    );

    const recentTransactionsResult =
      await pool.query(
        `
        SELECT
          transactions.id,
          transactions.item_name,
          transactions.total_price,
          transactions.transaction_date,
          categories.name AS category_name
        FROM transactions
        JOIN categories
        ON transactions.category_id = categories.id
        WHERE transactions.user_id = $1
        ORDER BY transaction_date DESC
        LIMIT 3
        `,
        [user_id]
      );

    res.json({
      budget_progress: {
        total_budget,
        total_spent,
        total_remaining,
        percentage_used,
        spending_change_percentage,
      },

      expiring_soon:
        expiringSoonResult.rows,

      monthly_spending:
        total_spent,

      shopping_pending:
        pending_shopping_count,

      inventory_alerts:
        low_stock_count,

      recent_transactions:
        recentTransactionsResult.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  getDashboardData,
};