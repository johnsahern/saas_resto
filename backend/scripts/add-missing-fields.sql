-- Ajout des champs manquants à la table orders
ALTER TABLE orders
ADD COLUMN type VARCHAR(50) DEFAULT 'dine-in' AFTER status,
ADD COLUMN notes TEXT AFTER type,
ADD COLUMN created_by VARCHAR(36) AFTER notes,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
ADD COLUMN table_id VARCHAR(36) AFTER restaurant_id,
ADD FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE SET NULL;

-- Ajout de la contrainte de clé étrangère pour order_id dans order_items
ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_order_id
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Ajout des colonnes manquantes à la table restaurant_users
ALTER TABLE restaurant_users
ADD COLUMN user_id VARCHAR(36) NOT NULL AFTER restaurant_id,
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user' AFTER user_id,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER role,
ADD FOREIGN KEY (user_id) REFERENCES saas_users(id) ON DELETE CASCADE; 