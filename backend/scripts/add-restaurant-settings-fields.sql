-- Ajout des colonnes manquantes à la table restaurant_settings
ALTER TABLE restaurant_settings
ADD COLUMN currency VARCHAR(10) DEFAULT 'EUR' AFTER restaurant_id,
ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 20.00 AFTER currency; 