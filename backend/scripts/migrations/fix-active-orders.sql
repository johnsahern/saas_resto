-- Supprimer la table existante
DROP TABLE IF EXISTS active_orders;

-- Recréer la table avec la bonne structure
CREATE TABLE active_orders (
  id VARCHAR(36) NOT NULL,
  restaurant_id VARCHAR(36) NOT NULL,
  order_number VARCHAR(255) NOT NULL,
  table_id VARCHAR(36),
  customer_name VARCHAR(255),
  items JSON NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 