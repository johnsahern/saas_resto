-- Ajout de la contrainte de clé étrangère pour order_id dans order_items
ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_order_id
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Ajouter la contrainte de clé étrangère pour restaurant_id dans orders
ALTER TABLE orders
ADD CONSTRAINT fk_orders_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
ON DELETE CASCADE;

-- Ajouter un index sur restaurant_id dans orders
ALTER TABLE orders
ADD INDEX idx_restaurant_id (restaurant_id); 