-- Réorganisation des colonnes de la table restaurant_settings
ALTER TABLE restaurant_settings
MODIFY COLUMN restaurant_id VARCHAR(36) AFTER id,
ADD FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE; 