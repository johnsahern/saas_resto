-- Ajout de la colonne permissions à la table restaurant_users
ALTER TABLE restaurant_users
ADD COLUMN permissions JSON DEFAULT '{}' AFTER role;

-- Mise à jour des permissions par défaut pour les propriétaires existants
UPDATE restaurant_users
SET permissions = '{
  "dashboard": true,
  "orders": true,
  "inventory": true,
  "staff": true,
  "tables": true,
  "delivery": true,
  "analytics": true,
  "settings": true
}'
WHERE role = 'owner';

-- Mise à jour des permissions par défaut pour les managers existants
UPDATE restaurant_users
SET permissions = '{
  "dashboard": true,
  "orders": true,
  "inventory": true,
  "staff": false,
  "tables": true,
  "delivery": true,
  "analytics": false,
  "settings": false
}'
WHERE role = 'manager'; 