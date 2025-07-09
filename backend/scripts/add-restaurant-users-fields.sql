-- Ajout des colonnes manquantes à la table restaurant_users
ALTER TABLE restaurant_users
ADD COLUMN user_id VARCHAR(36) NOT NULL AFTER restaurant_id,
ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user' AFTER user_id,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER role,
ADD FOREIGN KEY (user_id) REFERENCES saas_users(id) ON DELETE CASCADE; 