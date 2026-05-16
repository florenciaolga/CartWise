const pool = require("../config/db");

const getInventoryItems = async (req, res) => {
  try {
    const user_id = req.user.id;

    const search = req.query.search || "";

    const category_id = req.query.category_id;

    let query = `
      SELECT
        inventory_items.id,
        inventory_items.name,
        inventory_items.stock,
        inventory_items.expiration_date,
        inventory_items.price_per_unit,
        inventory_items.minimum_stock,
        inventory_items.created_at,
        categories.name AS category_name
      FROM inventory_items
      JOIN categories
      ON inventory_items.category_id = categories.id
      WHERE inventory_items.user_id = $1
    `;

    const values = [user_id];

    if (search) {
      query += `
        AND inventory_items.name ILIKE $2
      `;

      values.push(`%${search}%`);
    }

    if (category_id) {
      if (search) {
        query += `
          AND inventory_items.category_id = $3
        `;

        values.push(category_id);
      } else {
        query += `
          AND inventory_items.category_id = $2
        `;

        values.push(category_id);
      }
    }

    query += `
      ORDER BY inventory_items.created_at DESC
    `;

    const itemsResult = await pool.query(
      query,
      values
    );

    const today = new Date();

const items = itemsResult.rows.map((item) => {
    const stock = parseInt(item.stock);

    const minimumStock = parseInt(
        item.minimum_stock
    );

    const expirationDate = new Date(
        item.expiration_date
    );

    const today = new Date();

    const diffTime =
        expirationDate.getTime() -
        today.getTime();

    const diffDays = Math.ceil(
        diffTime / (1000 * 60 * 60 * 24)
    );

    const is_out_of_stock =
        stock === 0;

    const is_low_stock =
        stock <= minimumStock;

    const is_expired =
        diffDays < 0;

    const is_expiring_soon =
        diffDays >= 0 &&
        diffDays <= 3;

    const total_value =
    stock * Number(item.price_per_unit);

    return {
        ...item,
        stock,
        minimum_stock: minimumStock,
        is_low_stock,
        is_out_of_stock,
        is_expired,
        is_expiring_soon,
        total_value,
    };
    });

    const low_stock_count =
      items.filter(
        (item) => item.is_low_stock
      ).length;

    const expired_count =
      items.filter(
        (item) => item.is_expired
      ).length;

    const expiring_soon_count =
      items.filter(
        (item) => item.is_expiring_soon
      ).length;

    res.json({
      total_items: items.length,
      low_stock_count,
      expired_count,
      expiring_soon_count,
      items,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const addInventoryItem = async (req, res) => {
  try {
    const {
      name,
      stock,
      expiration_date,
      price_per_unit,
      category_id,
    } = req.body;

    const user_id = req.user.id;

    if (
      !name ||
      stock === undefined ||
      !expiration_date ||
      price_per_unit === undefined ||
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

    if (stock < 0 || stock > 1000) {
      return res.status(400).json({
        error: "Stock must be between 0-1000",
      });
    }

    if (price_per_unit <= 0) {
      return res.status(400).json({
        error: "Price per unit must be greater than 0",
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

    const newItem = await pool.query(
      `
      INSERT INTO inventory_items
      (
        user_id,
        category_id,
        name,
        stock,
        expiration_date,
        price_per_unit,
        minimum_stock
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        user_id,
        category_id,
        name,
        stock,
        expiration_date,
        price_per_unit,
        1,
      ]
    );

    await pool.query(
      `
      INSERT INTO transactions
      (
        user_id,
        category_id,
        item_name,
        quantity,
        price_per_item,
        total_price
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        user_id,
        category_id,
        name,
        stock,
        price_per_unit,
        stock * price_per_unit,
      ]
    );

    res.status(201).json({
      message: "Inventory item added successfully",
      item: newItem.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const updateInventoryStock = async (req, res) => {
  try {
    const user_id = req.user.id;

    const item_id = req.params.id;

    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({
        error: "Stock is required",
      });
    }

    if (stock < 0 || stock > 1000) {
      return res.status(400).json({
        error: "Stock must be between 0-1000",
      });
    }

    const existingItem = await pool.query(
      `
      SELECT *
      FROM inventory_items
      WHERE id = $1
      AND user_id = $2
      `,
      [item_id, user_id]
    );

    if (existingItem.rows.length === 0) {
      return res.status(404).json({
        error: "Inventory item not found",
      });
    }

    const updatedItem = await pool.query(
      `
      UPDATE inventory_items
      SET
        stock = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [stock, item_id]
    );

    res.json({
      message: "Inventory stock updated successfully",
      item: updatedItem.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const user_id = req.user.id;

    const item_id = req.params.id;

    const existingItem = await pool.query(
      `
      SELECT *
      FROM inventory_items
      WHERE id = $1
      AND user_id = $2
      `,
      [item_id, user_id]
    );

    if (existingItem.rows.length === 0) {
      return res.status(404).json({
        error: "Inventory item not found",
      });
    }

    await pool.query(
      `
      DELETE FROM inventory_items
      WHERE id = $1
      `,
      [item_id]
    );

    res.json({
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  getInventoryItems,
  addInventoryItem,
  updateInventoryStock,
  deleteInventoryItem,
};