const pool = require("../config/db");

const getNotifications = async (
  req,
  res
) => {
  try {
    const user_id = req.user.id;

    const currentDate = new Date();

    const month =
      currentDate.getMonth() + 1;

    const year =
      currentDate.getFullYear();

    const notifications = [];

    // EXPIRED ITEMS
    const expiredResult =
      await pool.query(
        `
        SELECT
          id,
          name,
          expiration_date
        FROM inventory_items
        WHERE user_id = $1
        AND expiration_date < CURRENT_DATE
        `,
        [user_id]
      );

    for (const item of expiredResult.rows) {
      notifications.push({
        type: "expired",
        item_id: item.id,
        item_name: item.name,
        expiration_date:
          item.expiration_date,
      });
    }

    const expiringSoonResult =
      await pool.query(
        `
        SELECT
          id,
          name,
          expiration_date
        FROM inventory_items
        WHERE user_id = $1
        AND expiration_date >= CURRENT_DATE
        AND expiration_date <= CURRENT_DATE + INTERVAL '3 days'
        `,
        [user_id]
      );

    for (const item of expiringSoonResult.rows) {
      const expirationDate =
        new Date(item.expiration_date);

      const timeDifference =
        expirationDate - currentDate;

      const days_remaining =
        Math.ceil(
          timeDifference /
            (1000 * 60 * 60 * 24)
        );

      notifications.push({
        type: "expiring_soon",
        item_id: item.id,
        item_name: item.name,
        expiration_date:
          item.expiration_date,
        days_remaining,
      });
    }

    const lowStockResult =
      await pool.query(
        `
        SELECT
          id,
          name,
          stock,
          minimum_stock
        FROM inventory_items
        WHERE user_id = $1
        AND stock <= minimum_stock
        `,
        [user_id]
      );

    for (const item of lowStockResult.rows) {
      notifications.push({
        type: "low_stock",
        item_id: item.id,
        item_name: item.name,
        stock: item.stock,
        minimum_stock:
          item.minimum_stock,
      });
    }

    const budgetsResult =
      await pool.query(
        `
        SELECT
          budgets.category_id,
          budgets.monthly_limit,
          categories.name AS category_name
        FROM budgets
        JOIN categories
        ON budgets.category_id =
        categories.id
        WHERE budgets.user_id = $1
        AND budgets.month = $2
        AND budgets.year = $3
        `,
        [user_id, month, year]
      );

    for (const budget of budgetsResult.rows) {
      const spendingResult =
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
        spendingResult.rows[0].spent
      );

      const percentage_used =
        (
          (spent /
            budget.monthly_limit) *
          100
        );

      if (percentage_used >= 90) {
        notifications.push({
          type: "budget_alert",
          category_id:
            budget.category_id,
          category_name:
            budget.category_name,
          monthly_limit:
            budget.monthly_limit,
          spent,
          percentage_used:
            Number(
              percentage_used.toFixed(
                1
              )
            ),
        });
      }
    }

    const priorityOrder = {
      expired: 1,
      expiring_soon: 2,
      budget_alert: 3,
      low_stock: 4,
    };

    notifications.sort((a, b) => {
      return (
        priorityOrder[a.type] -
        priorityOrder[b.type]
      );
    });

    res.json({
      total_notifications:
        notifications.length,

      notifications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  getNotifications,
};