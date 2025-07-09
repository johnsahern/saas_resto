import express, { Request, Response } from 'express';
import { executeQuery } from '../config/database.js';
import { Router } from 'express';
import { authenticate, requireRestaurant } from '../middleware/auth.js';
import { createActiveOrder } from '../controllers/orderController.js';

const router = express.Router();

// =======================================================================
// ROUTES API
// =======================================================================

// Middleware d'authentification pour toutes les routes
router.use(authenticate);
router.use(requireRestaurant);

// Order Items
router.get('/order-items', async (req: Request, res: Response) => {
  try {
    console.log('>>> ROUTE /api/order-items appelée');
    const restaurantId = req.query.restaurant_id as string;
    const orderIds = req.query.order_ids ? (req.query.order_ids as string).split(',') : [];
    if (!restaurantId || !orderIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID et order_ids requis'
      });
    }
    const placeholders = orderIds.map(() => '?').join(',');
    console.log('orderIds:', orderIds, 'restaurantId:', restaurantId);
    const items = await executeQuery(
      `SELECT * FROM order_items WHERE restaurant_id = ? AND order_id IN (${placeholders})`,
      [restaurantId, ...orderIds]
    );
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Erreur order-items:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Route pour créer une nouvelle commande active
router.post('/active-orders', createActiveOrder);

// Route pour récupérer le nom du restaurant à partir de son ID
router.get('/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Si l'utilisateur est un livreur, il ne peut accéder qu'à son propre restaurant
    if (req.user && req.user.role === 'delivery' && req.user.restaurant_id !== id) {
      return res.status(403).json({ success: false, error: 'Accès interdit à ce restaurant' });
    }
    const [restaurant] = await executeQuery('SELECT name FROM restaurants WHERE id = ?', [id]);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant non trouvé' });
    }
    res.json({ success: true, data: { name: restaurant.name } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// === STAFF MEMBERS CRUD ===

// Liste du personnel
router.get('/api/staff', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurant_id as string;
    if (!restaurantId) return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    const staff = await executeQuery('SELECT * FROM staff_members WHERE restaurant_id = ? ORDER BY last_name, first_name', [restaurantId]);
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Ajout d'un membre du personnel
router.post('/api/staff', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const restaurantId = req.user?.restaurant_id || data.restaurant_id;
    if (!restaurantId || !data.first_name || !data.last_name) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    await executeQuery(
      'INSERT INTO staff_members (id, restaurant_id, first_name, last_name, email, phone, position, department, hire_date, salary, status, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [restaurantId, data.first_name, data.last_name, data.email || '', data.phone || '', data.position || '', data.department || '', data.hire_date || null, data.salary || null, data.status || 'actif']
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Modification d'un membre du personnel
router.patch('/api/staff/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const restaurantId = req.user?.restaurant_id || updates.restaurant_id;
    if (!restaurantId || !id) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'restaurant_id');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'Aucune donnée à mettre à jour' });
    }
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);
    await executeQuery(
      `UPDATE staff_members SET ${setClause} WHERE id = ? AND restaurant_id = ?`,
      [...values, id, restaurantId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Suppression d'un membre du personnel
router.delete('/api/staff/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    if (!restaurantId || !id) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    await executeQuery('DELETE FROM staff_members WHERE id = ? AND restaurant_id = ?', [id, restaurantId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// =======================================================================
// PARAMÈTRES RESTAURANT (multi-restaurant)
// =======================================================================

// Lecture des paramètres du restaurant courant
router.get('/restaurant-settings', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    const [settings] = await executeQuery('SELECT * FROM restaurant_settings WHERE restaurant_id = ? LIMIT 1', [restaurantId]);
    if (!settings) {
      return res.status(404).json({ success: false, error: 'Paramètres non trouvés' });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Mise à jour des paramètres du restaurant courant
router.put('/restaurant-settings', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    const updates = req.body;
    if (updates.opening_hours && typeof updates.opening_hours !== 'string') {
      updates.opening_hours = JSON.stringify(updates.opening_hours);
    }
    if (updates.payment_methods && typeof updates.payment_methods !== 'string') {
      updates.payment_methods = JSON.stringify(updates.payment_methods);
    }
    const fields = Object.keys(updates).filter(f => f !== 'restaurant_id' && f !== 'id');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'Aucune donnée à mettre à jour' });
    }
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);
    await executeQuery(
      `UPDATE restaurant_settings SET ${setClause} WHERE restaurant_id = ?`,
      [...values, restaurantId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PATCH /orders/:id - Mise à jour du statut d'une commande
router.patch('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: "Le champ 'status' est requis." });
    }
    // Mise à jour du statut
    const result = await executeQuery(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    // Correction robuste : on vérifie si le résultat est vide (aucune ligne modifiée)
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(404).json({ success: false, error: "Commande non trouvée." });
    }
    // Retourne la commande mise à jour
    const [updatedOrder] = await executeQuery('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Erreur PATCH /orders/:id', error);
    res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
});

// PATCH - Mise à jour de la position du livreur (current_location)
router.patch('/delivery-persons/:id/location', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { current_location } = req.body;
    const user = req.user;
    if (!user || user.role !== 'delivery' || user.id !== id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }
    if (!current_location) {
      return res.status(400).json({ success: false, error: 'Champ current_location requis' });
    }
    await executeQuery(
      'UPDATE delivery_persons SET current_location = ? WHERE id = ?',
      [JSON.stringify(current_location), id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PATCH - Mise à jour du statut du livreur (available)
router.patch('/delivery-persons/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    const user = req.user;
    if (!user || user.role !== 'delivery' || user.id !== id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }
    if (typeof available !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Champ available requis (booléen)' });
    }
    await executeQuery(
      'UPDATE delivery_persons SET available = ? WHERE id = ?',
      [available ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET - Récupérer le profil du livreur (y compris le statut)
router.get('/delivery-persons/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user || user.role !== 'delivery' || user.id !== id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' });
    }
    const [deliveryPerson] = await executeQuery(
      'SELECT id, name, phone, available, restaurant_id FROM delivery_persons WHERE id = ?',
      [id]
    );
    if (!deliveryPerson) {
      return res.status(404).json({ success: false, error: 'Livreur non trouvé' });
    }
    // On force le champ available à être un booléen côté API
    deliveryPerson.available = deliveryPerson.available === 1 || deliveryPerson.available === true;
    res.json({ success: true, data: deliveryPerson });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET - Récupérer les livraisons assignées à un livreur
router.get('/deliveries', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const delivery_person_id = req.query.delivery_person_id || user?.id;
    const restaurant_id = user?.restaurant_id;
    if (!delivery_person_id || !restaurant_id) {
      return res.status(400).json({ success: false, error: 'delivery_person_id et restaurant_id requis' });
    }
    const deliveries = await executeQuery(
      'SELECT * FROM deliveries WHERE delivery_person_id = ? AND restaurant_id = ? ORDER BY created_at DESC',
      [delivery_person_id, restaurant_id]
    );
    res.json({ success: true, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET - Détail d'une livraison par ID (avec infos de la commande)
router.get('/deliveries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 1. Récupérer la livraison
    const [delivery] = await executeQuery('SELECT * FROM deliveries WHERE id = ?', [id]);
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Livraison non trouvée' });
    }
    // 2. Récupérer la commande associée
    let order = null;
    if (delivery.order_id) {
      const [orderResult] = await executeQuery(
        'SELECT id, customer_name, customer_phone, customer_address FROM orders WHERE id = ?',
        [delivery.order_id]
      );
      order = orderResult || null;
    }
    // 3. Retourner la livraison enrichie
    res.json({ success: true, data: { ...delivery, order } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// PATCH - Mise à jour du statut d'une livraison
router.patch('/deliveries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'Statut requis' });
    await executeQuery('UPDATE deliveries SET status = ? WHERE id = ?', [status, id]);
    const [updated] = await executeQuery('SELECT * FROM deliveries WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET - Toutes les livraisons du restaurant (pour l'admin)
router.get('/all-deliveries', async (req, res) => {
  try {
    const restaurant_id = req.user?.restaurant_id || req.query.restaurant_id;
    if (!restaurant_id) {
      return res.status(400).json({ success: false, error: 'restaurant_id requis' });
    }
    const deliveries = await executeQuery(
      'SELECT * FROM deliveries WHERE restaurant_id = ? ORDER BY created_at DESC',
      [restaurant_id]
    );
    res.json({ success: true, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET - Analyses des commandes en ligne pour un restaurant (agrégats par jour)
router.get('/analytics/online-orders', async (req, res) => {
  try {
    const restaurant_id = req.user?.restaurant_id || req.query.restaurant_id;
    const start_date = req.query.start_date;
    if (!restaurant_id || !start_date) {
      return res.status(400).json({ success: false, error: 'restaurant_id et start_date requis' });
    }
    // LOG DEBUG
    console.log('[API] /analytics/online-orders', { restaurant_id, start_date });
    const sql = `SELECT 
      DATE(created_at) as date,
      COUNT(*) as total_orders,
      SUM(total_amount) as total_revenue,
      AVG(total_amount) as average_order_value
    FROM orders
    WHERE restaurant_id = ? AND created_at >= ?
    GROUP BY DATE(created_at)
    ORDER BY date DESC`;
    console.log('[API] SQL:', sql);
    const orders = await executeQuery(sql, [restaurant_id, start_date]);
    console.log('[API] Résultat SQL:', orders);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('[API] Erreur /analytics/online-orders:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router;
