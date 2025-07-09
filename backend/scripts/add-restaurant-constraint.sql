-- Ajouter la contrainte de clé étrangère pour restaurant_id dans orders
ALTER TABLE orders
ADD CONSTRAINT fk_orders_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
ON DELETE CASCADE;

-- Ajouter un index sur restaurant_id dans orders
ALTER TABLE orders
ADD INDEX idx_restaurant_id (restaurant_id);

-- Ajouter la colonne slug
ALTER TABLE restaurants
ADD COLUMN slug VARCHAR(255) UNIQUE AFTER name,
ADD COLUMN status VARCHAR(50) DEFAULT 'pending' AFTER whatsapp_number; 