CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO categories (name)
VALUES
('Groceries'),
('Personal Care'),
('Beverages'),
('Cleaning Supplies'),
('Household');

CREATE TABLE shopping_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,
    category_id INTEGER NOT NULL
    REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL
    CHECK (quantity BETWEEN 1 AND 1000),
    estimated_price INTEGER NOT NULL
    CHECK (estimated_price > 0),
    is_purchased BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,
    category_id INTEGER NOT NULL
    REFERENCES categories(id),
    month INTEGER NOT NULL
    CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    monthly_limit INTEGER NOT NULL
    CHECK (monthly_limit > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,
    shopping_item_id INTEGER
    REFERENCES shopping_items(id),
    category_id INTEGER NOT NULL
    REFERENCES categories(id),
    item_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL
    CHECK (quantity > 0),
    price_per_item INTEGER NOT NULL
    CHECK (price_per_item > 0),
    total_price INTEGER NOT NULL
    CHECK (total_price > 0),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,
    category_id INTEGER NOT NULL
    REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL
    CHECK (stock BETWEEN 0 AND 1000),
    unit VARCHAR(20),
    expiration_date DATE NOT NULL,
    price_per_unit INTEGER NOT NULL
    CHECK (price_per_unit > 0),
    minimum_stock INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);