import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../config/database.js';

export interface AddLoyaltyPointsParams {
  name: string;
  phone: string;
  restaurant_id: string;
  points: number;
  source: string;
}

export async function addLoyaltyPoints({ name, phone, restaurant_id, points, source }: AddLoyaltyPointsParams) {
  if (!phone || !restaurant_id) return;
  // Chercher le client fidélité
  let [customer] = await executeQuery(
    'SELECT * FROM loyalty_customers WHERE phone = ? AND restaurant_id = ?',
    [phone, restaurant_id]
  );
  if (!customer) {
    // Créer le client fidélité s’il n’existe pas
    const id = uuidv4();
    await executeQuery(
      'INSERT INTO loyalty_customers (id, restaurant_id, name, phone, points, total_spent, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())',
      [id, restaurant_id, name || '', phone, points]
    );
    customer = { id };
  } else {
    // Ajouter les points
    await executeQuery(
      'UPDATE loyalty_customers SET points = points + ? WHERE id = ?',
      [points, customer.id]
    );
  }
  // Créer la transaction fidélité
  await executeQuery(
    'INSERT INTO loyalty_transactions (id, customer_id, restaurant_id, points, type, source, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [uuidv4(), customer.id, restaurant_id, points, 'earned', source]
  );
} 