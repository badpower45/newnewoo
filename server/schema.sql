-- Enable UUID extension if we want to use UUIDs, but we'll stick to SERIAL/INTEGER for consistency with existing app unless specified otherwise.
-- However, products use TEXT ids in the current sqlite setup (e.g. '1', '2'). We will keep that for products.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'customer',
  default_branch_id INTEGER,
  loyalty_points INTEGER DEFAULT 0
);

-- 2. Branches Table
CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  coverage_radius_km DECIMAL(5, 2) DEFAULT 5.0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Products Table (Refactored: No price/stock here)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, -- Keeping TEXT to match existing IDs like '1', '2' or UUIDs
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  image TEXT,
  is_organic BOOLEAN DEFAULT FALSE,
  is_weighted BOOLEAN DEFAULT FALSE,
  weight TEXT,
  is_new BOOLEAN DEFAULT FALSE,
  barcode TEXT UNIQUE
);

-- 4. Branch Products (Inventory & Pricing)
CREATE TABLE IF NOT EXISTS branch_products (
  branch_id INTEGER NOT NULL,
  product_id TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (branch_id, product_id),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Cart Table
CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  product_id TEXT,
  quantity INTEGER DEFAULT 1,
  substitution_preference VARCHAR(50) DEFAULT 'call_me',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  branch_id INTEGER, -- Track which branch fulfilled the order
  total DECIMAL(10, 2),
  items JSONB, -- Storing items as JSONB is more efficient in PG than TEXT
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',
  delivery_slot_id INTEGER,
  payment_method VARCHAR(20) DEFAULT 'cod',
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_transaction_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- 7. Conversations (Live Chat)
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER,
  customer_name TEXT,
  agent_id INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (agent_id) REFERENCES users(id)
);

-- 8. Messages (Live Chat)
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER,
  sender_id INTEGER,
  sender_type TEXT,
  message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- 9. Delivery Slots Table
CREATE TABLE IF NOT EXISTS delivery_slots (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 20,
  current_orders INTEGER DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 15.00,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(branch_id, date, start_time),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_branch_products_branch ON branch_products(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_products_product ON branch_products(product_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_delivery_slots_date ON delivery_slots(date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
