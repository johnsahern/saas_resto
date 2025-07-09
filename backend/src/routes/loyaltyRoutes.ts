import express, { Request, Response } from 'express';
import { executeQuery } from '../config/database.js';
import { authenticate, requireRestaurant } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware d'authentification et de vérification du restaurant
router.use(authenticate);
router.use(requireRestaurant);

// Liste des clients fidélité
router.get('/loyalty-customers', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    if (!restaurantId) return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    const customers = await executeQuery('SELECT * FROM loyalty_customers WHERE restaurant_id = ? ORDER BY points DESC, name', [restaurantId]);
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Ajouter un client fidélité
router.post('/loyalty-customers', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const { name, phone, email } = req.body;
    if (!restaurantId || !name || !phone) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    const id = uuidv4();
    await executeQuery(
      'INSERT INTO loyalty_customers (id, restaurant_id, name, phone, email, points, total_spent, created_at) VALUES (?, ?, ?, ?, ?, 0, 0, NOW())',
      [id, restaurantId, name, phone, email || null]
    );
    res.json({ success: true, data: { id, name, phone, email, points: 0, total_spent: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Modifier un client fidélité
router.put('/loyalty-customers/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const { id } = req.params;
    const updates = req.body;
    if (!restaurantId || !id) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    const fields = Object.keys(updates).filter(f => f !== 'id' && f !== 'restaurant_id');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'Aucune donnée à mettre à jour' });
    }
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);
    await executeQuery(
      `UPDATE loyalty_customers SET ${setClause} WHERE id = ? AND restaurant_id = ?`,
      [...values, id, restaurantId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Ajouter/retirer des points à un client fidélité (et créer une transaction)
router.post('/loyalty-customers/:id/points', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const { id } = req.params;
    const { points, type, source } = req.body; // type: 'earned' ou 'redeemed'
    if (!restaurantId || !id || typeof points !== 'number' || !type) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    // Récupérer le client
    const [customer] = await executeQuery('SELECT * FROM loyalty_customers WHERE id = ? AND restaurant_id = ?', [id, restaurantId]);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Client non trouvé' });
    }
    // Calcul du nouveau solde de points
    let newPoints = customer.points;
    if (type === 'earned') newPoints += points;
    else if (type === 'redeemed') newPoints -= points;
    if (newPoints < 0) newPoints = 0;
    // Mettre à jour le client
    await executeQuery('UPDATE loyalty_customers SET points = ?, last_visit = NOW() WHERE id = ? AND restaurant_id = ?', [newPoints, id, restaurantId]);
    // Créer la transaction
    const transactionId = uuidv4();
    await executeQuery(
      'INSERT INTO loyalty_transactions (id, customer_id, restaurant_id, points, type, source, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [transactionId, id, restaurantId, points, type, source || null]
    );
    res.json({ success: true, data: { newPoints } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Historique des transactions d'un client fidélité
router.get('/loyalty-transactions', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const { customer_id } = req.query;
    if (!restaurantId || !customer_id) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    const transactions = await executeQuery(
      'SELECT * FROM loyalty_transactions WHERE restaurant_id = ? AND customer_id = ? ORDER BY created_at DESC',
      [restaurantId, customer_id]
    );
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router; 