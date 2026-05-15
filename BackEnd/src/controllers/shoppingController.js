const pool = require("../config/db");

const getShoppingItems = async (req, res) => {
  try {
    const user_id = req.user.id;

    const search = req.query.search || "";

    const category_id = req.query.category_id;

    let query = `
      SELECT
        shopping_items.id,
        shopping_items.name,
        shopping_items.quantity,
        shopping_items.price_per_unit,
        shopping_items.is_purchased,
        shopping_items.created_at,
        categories.name AS category_name,
        (
          shopping_items.quantity *
          shopping_items.price_per_unit
        ) AS total_price
      FROM shopping_items
      JOIN categories
      ON shopping_items.category_id = categories.id
      WHERE shopping_items.user_id = $1
    `;

    const values = [user_id];

    if (search) {
      query += `
        AND shopping_items.name ILIKE $2
      `;

      values.push(`%${search}%`);
    }

    if (category_id) {
      if (search) {
        query += `
          AND shopping_items.category_id = $3
        `;

        values.push(category_id);
      } else {
        query += `
          AND shopping_items.category_id = $2
        `;

        values.push(category_id);
      }
    }

    query += `
      ORDER BY
      shopping_items.is_purchased ASC,
      shopping_items.created_at DESC
    `;

    const items = await pool.query(query, values);

    const subtotal = items.rows.reduce(
      (sum, item) =>
        sum + Number(item.total_price),
      0
    );

    res.json({
      subtotal,
      total_items: items.rows.length,
      items: items.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const addShoppingItem = async (req, res) => {
  try {
    const { name, quantity, price_per_unit, category_id } = req.body;

    const user_id = req.user.id;

    if (
      !name ||
      !quantity ||
      !price_per_unit ||
      !category_id
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        error: "Item name must be 2-100 characters",
      });
    }

    if (quantity < 1 || quantity > 1000) {
      return res.status(400).json({
        error: "Quantity must be between 1-1000",
      });
    }

    if (price_per_unit <= 0) {
      return res.status(400).json({
        error: "Price per unit must be greater than 0",
      });
    }

    const category = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [category_id]
    );

    if (category.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid category",
      });
    }

    const newItem = await pool.query(
      `
      INSERT INTO shopping_items
      (
        user_id,
        category_id,
        name,
        quantity,
        price_per_unit
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        user_id,
        category_id,
        name,
        quantity,
        price_per_unit,
      ]
    );

    res.status(201).json({
      message: "Shopping item added successfully",
      item: newItem.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const updateShoppingQuantity = async (req, res) => {
  try {
    const user_id = req.user.id;

    const item_id = req.params.id;

    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({
        error: "Quantity is required",
      });
    }

    if (quantity < 1 || quantity > 1000) {
      return res.status(400).json({
        error: "Quantity must be between 1-1000",
      });
    }

    const existingItem = await pool.query(
      `
      SELECT *
      FROM shopping_items
      WHERE id = $1
      AND user_id = $2
      `,
      [item_id, user_id]
    );

    if (existingItem.rows.length === 0) {
      return res.status(404).json({
        error: "Shopping item not found",
      });
    }

    const updatedItem = await pool.query(
      `
      UPDATE shopping_items
      SET quantity = $1,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [quantity, item_id]
    );

    res.json({
      message: "Quantity updated successfully",
      item: updatedItem.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const togglePurchasedStatus = async (req, res) => {
  try {
    const user_id = req.user.id;

    const item_id = req.params.id;

    const existingItem = await pool.query(
      `
      SELECT *
      FROM shopping_items
      WHERE id = $1
      AND user_id = $2
      `,
      [item_id, user_id]
    );

    if (existingItem.rows.length === 0) {
      return res.status(404).json({
        error: "Shopping item not found",
      });
    }

    const currentStatus =
      existingItem.rows[0].is_purchased;

    const updatedItem = await pool.query(
      `
      UPDATE shopping_items
      SET
        is_purchased = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [!currentStatus, item_id]
    );

    res.json({
      message: "Purchased status updated",
      item: updatedItem.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const deleteShoppingItem = async (req, res) => {
  try {
    const user_id = req.user.id;

    const item_id = req.params.id;

    const existingItem = await pool.query(
      `
      SELECT *
      FROM shopping_items
      WHERE id = $1
      AND user_id = $2
      `,
      [item_id, user_id]
    );

    if (existingItem.rows.length === 0) {
      return res.status(404).json({
        error: "Shopping item not found",
      });
    }

    await pool.query(
      `
      DELETE FROM shopping_items
      WHERE id = $1
      `,
      [item_id]
    );

    res.json({
      message: "Shopping item deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await pool.query(
      `
      SELECT *
      FROM categories
      ORDER BY name ASC
      `
    );

    res.json(categories.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  getShoppingItems,
  addShoppingItem,
  updateShoppingQuantity,
  togglePurchasedStatus,
  deleteShoppingItem,
  getCategories,
};