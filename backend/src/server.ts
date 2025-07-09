import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { v4 as uuidv4 } from 'uuid';

// Configuration
import { config, validateConfig } from './config/index.js';
import { initDatabase, executeQuery } from './config/database.js';

// Types
import { AuthenticatedRequest } from './types/index.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tablesRoutes from './routes/tablesRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { createActiveOrder } from './controllers/orderController.js';
import staffRoutes from './routes/staffRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import loyaltyRoutes from './routes/loyaltyRoutes.js';
import managersRoutes from './routes/managersRoutes.js';

// Middlewares personnalisés
import { authenticate } from './middleware/auth.js';

// =======================================================================
// INITIALISATION DE L'APPLICATION
// =======================================================================

const app = express();

// Validation de la configuration
validateConfig();

// Debug: afficher la configuration CORS
console.log('🔧 Configuration CORS:', config.cors.origin);

// ===================== CONFIGURATION CORS =====================
// Liste des domaines autorisés (à adapter selon tes besoins)
const allowedOrigins = [
  'https://monresto.emergyne.com', // Frontend principal
  'https://saas-resto.onrender.com', // API Render (optionnel, pour tests) // Autre port local éventuel
];

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les outils type Postman (origin === undefined)
    if (!origin) return callback(null, true);
    // Autoriser tous les localhost en dev
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    // Autoriser les domaines explicitement listés
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Sinon, refuser
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Restaurant-ID']
}));

// Compression
app.use(compression());

// Parsing du body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Trop de requêtes, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Logging des requêtes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// =======================================================================
// ROUTES DE L'API
// =======================================================================

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant SaaS API opérationnelle',
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: '1.0.0'
  });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes des commandes
app.use('/api/orders', orderRoutes);

// Routes des tables (données restaurant)
app.use('/api/tables', authenticate as unknown as express.RequestHandler, tablesRoutes);

// Routes analytics
app.use('/api/analytics', authenticate as unknown as express.RequestHandler, analyticsRoutes);

// Route du personnel (staff)
app.use('/api/staff', authenticate as any, staffRoutes);
// Route managers
app.use('/api/managers', managersRoutes);
// Route générique
app.use('/api', apiRoutes);

// =======================================================================
// ROUTES ACTIVE ORDERS
// =======================================================================

// GET active orders
app.get('/api/active-orders', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID manquant' });
    }

    // Transfert automatique des commandes 'served' résiduelles
    await executeQuery(
      `INSERT INTO billing_orders (
        id, restaurant_id, order_number, table_id, customer_name, items, total_amount, status, served_at, original_order_id, notes, created_at, updated_at
      )
      SELECT id, restaurant_id, order_number, table_id, customer_name, items, total_amount, 'served', updated_at, id, notes, created_at, updated_at
      FROM active_orders
      WHERE status = 'served'
      ON DUPLICATE KEY UPDATE status = billing_orders.status`
    );
    await executeQuery('DELETE FROM active_orders WHERE status = "served"');

    const query = `
      SELECT 
        id,
        order_number,
        customer_name,
        table_id,
        items,
        total_amount,
        status,
        notes,
        created_at,
        updated_at
      FROM active_orders 
      WHERE restaurant_id = ? 
      ORDER BY created_at DESC
    `;
    
    const orders = await executeQuery(query, [restaurantId]);
    const formattedOrders = orders.map((order: any) => ({
      ...order,
      total_amount: Number(order.total_amount)
    }));
    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Erreur récupération commandes actives:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// POST new active order
app.post('/api/active-orders', authenticate as any, createActiveOrder);

// PATCH active orders
app.patch('/api/active-orders/:id/status', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const restaurantId = req.user?.restaurant_id;
    console.log('[DEBUG] PATCH /api/active-orders/:id/status', { id, status, restaurantId });

    // Vérifier que la commande existe
    const orders = await executeQuery(
      'SELECT * FROM active_orders WHERE id = ? AND restaurant_id = ?',
      [id, restaurantId]
    );
    if (orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    }
    const order = orders[0];

    // Mettre à jour le statut
    await executeQuery('UPDATE active_orders SET status = ? WHERE id = ?', [status, id]);

    // Sécurisation : si la commande est (ou devient) "servi", transférer et supprimer
    const finalOrder = status === 'served' ? order : { ...order, status };
    const billingRestaurantId = finalOrder.restaurant_id || restaurantId;
    if (finalOrder.status === 'served') {
      console.log('[DEBUG] Transfert vers billing_orders (sécurisé):', {
        ...finalOrder,
        restaurant_id: billingRestaurantId
      });
      await executeQuery(
        `INSERT INTO billing_orders (
          id, restaurant_id, order_number, table_id, customer_name, customer_phone, items, total_amount, status, served_at, original_order_id, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, NOW(), NOW())`,
        [
          finalOrder.id,
          billingRestaurantId,
          finalOrder.order_number,
          finalOrder.table_id,
          finalOrder.customer_name,
          finalOrder.customer_phone, // Ajout du champ
          finalOrder.items,
          finalOrder.total_amount,
          'served',
          finalOrder.id, // original_order_id
          finalOrder.notes
        ]
      );
      console.log('[DEBUG] INSERT billing_orders OK pour id:', finalOrder.id);
      // Attribution automatique de points fidélité (10pts)
      if (finalOrder.customer_name && finalOrder.customer_phone) {
        await addLoyaltyPoints({
          name: finalOrder.customer_name,
          phone: finalOrder.customer_phone,
          restaurant_id: billingRestaurantId,
          points: 10,
          source: 'order_served'
        });
      }
      await executeQuery('DELETE FROM active_orders WHERE id = ?', [id]);
      console.log('[DEBUG] DELETE active_orders OK pour id:', id);
    }

    res.json({ success: true, message: 'Statut mis à jour' });
  } catch (error) {
    console.error('Erreur update status active order:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// =======================================================================
// ROUTES API TEMPORAIRES (pour corriger les 404)
// =======================================================================

// Order Items
app.get('/api/order-items', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.query.restaurant_id;
    const orderIds = req.query.order_ids ? req.query.order_ids.split(',') : [];
    if (!restaurantId || !orderIds.length) {
      return res.status(400).json({ success: false, error: 'Restaurant ID et order_ids requis' });
    }
    // Ajout de logs pour le debug
    const placeholders = orderIds.map(() => '?').join(',');
    console.log('orderIds:', orderIds, 'restaurantId:', restaurantId);
    console.log('Query:', `SELECT * FROM order_items WHERE restaurant_id = ? AND order_id IN (${placeholders})`, [restaurantId, ...orderIds]);
    const items = await executeQuery(
      `SELECT * FROM order_items WHERE restaurant_id = ? AND order_id IN (${placeholders})`,
      [restaurantId, ...orderIds]
    );
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Réservations
app.get('/api/reservations', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    // Sélectionner les réservations du restaurant
    const reservations = await executeQuery(
      `SELECT id, customer_name, customer_phone, date, time, party_size, status, notes, created_at, updated_at
       FROM reservations WHERE restaurant_id = ? ORDER BY date DESC, time DESC`,
      [restaurantId]
    );
    res.json({ success: true, data: reservations });
  } catch (error) {
    console.error('Erreur récupération réservations:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// === FONCTION UTILITAIRE FIDÉLITÉ ===
interface AddLoyaltyPointsParams {
  name: string;
  phone: string;
  restaurant_id: string;
  points: number;
  source: string;
}
async function addLoyaltyPoints({ name, phone, restaurant_id, points, source }: AddLoyaltyPointsParams) {
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

// === AJOUT FIDÉLITÉ APRÈS CRÉATION RÉSERVATION ===
app.post('/api/reservations', authenticate as any, async (req: any, res: any) => {
  try {
    const data = req.body;
    const { customer_name, customer_phone, date, time, party_size, status = 'confirmed', notes = '', restaurant_id } = data;
    if (!restaurant_id) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    // Insertion réelle dans la base avec UUID généré
    const id = uuidv4();
    const insertQuery = `
      INSERT INTO reservations (id, customer_name, customer_phone, date, time, party_size, status, notes, restaurant_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const params = [id, customer_name, customer_phone, date, time, party_size, status, notes, restaurant_id];
    await executeQuery(insertQuery, params);
    // Attribution automatique de points fidélité (5pts)
    await addLoyaltyPoints({
      name: customer_name,
      phone: customer_phone,
      restaurant_id,
      points: 5,
      source: 'reservation'
    });
    // Retourner la réservation insérée
    res.json({
      success: true,
      data: {
        id,
        customer_name,
        customer_phone,
        date,
        time,
        party_size,
        status,
        notes,
        restaurant_id
      }
    });
  } catch (error) {
    console.error('Erreur création réservation:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.patch('/api/reservations/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // On ne met à jour que les champs autorisés
    const allowedFields = ['status', 'customer_name', 'customer_phone', 'date', 'time', 'party_size', 'notes'];
    const setClauses = [];
    const params = [];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        params.push(updates[field]);
      }
    }
    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, error: 'Aucune donnée à mettre à jour' });
    }
    params.push(id);
    const updateQuery = `UPDATE reservations SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await executeQuery(updateQuery, params);
    // Retourner la réservation mise à jour
    const [reservation] = await executeQuery('SELECT * FROM reservations WHERE id = ?', [id]);
    res.json({ success: true, data: reservation });
  } catch (error) {
    console.error('Erreur mise à jour réservation:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.delete('/api/reservations/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    res.json({ success: true, message: `Réservation ${id} supprimée` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Inventaire
app.get('/api/inventory', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.query.restaurant_id || req.user?.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    const items = await executeQuery(
      'SELECT * FROM inventory WHERE restaurant_id = ? ORDER BY item_name',
      [restaurantId]
    );
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.post('/api/inventory', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    const { name, current_stock, min_stock, unit, cost_per_unit, supplier_id, category } = req.body;
    if (!restaurantId || !name || typeof current_stock === 'undefined' || typeof min_stock === 'undefined' || !unit) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    await executeQuery(
      'INSERT INTO inventory (id, restaurant_id, item_name, current_stock, min_stock, unit, cost_per_unit, supplier_id, category, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [restaurantId, name, current_stock, min_stock, unit, cost_per_unit || 0, supplier_id || null, category || null]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// === Retrait de stock connecté à MySQL ===
app.post('/api/inventory/withdraw-stock', authenticate as any, async (req: any, res: any) => {
  try {
    const { inventory_id, quantity, notes } = req.body;
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    if (!restaurantId || !inventory_id || !quantity) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    // Insérer dans stock_withdrawals
    await executeQuery(
      'INSERT INTO stock_withdrawals (id, inventory_item_id, quantity, withdrawal_date, withdrawal_time, notes, created_by, restaurant_id) VALUES (UUID(), ?, ?, CURDATE(), CURTIME(), ?, ?, ?)',
      [inventory_id, quantity, notes || '', req.user?.userId || null, restaurantId]
    );
    // Mettre à jour le stock courant
    await executeQuery(
      'UPDATE inventory SET current_stock = current_stock - ? WHERE id = ? AND restaurant_id = ?',
      [quantity, inventory_id, restaurantId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.post('/api/inventory/add-stock', authenticate as any, async (req: any, res: any) => {
  try {
    const { inventory_id, quantity, notes } = req.body;
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    if (!restaurantId || !inventory_id || !quantity) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    // Insérer dans stock_additions (adapté à la structure réelle)
    await executeQuery(
      'INSERT INTO stock_additions (id, inventory_item_id, date, quantity, notes, created_by, restaurant_id) VALUES (UUID(), ?, CURDATE(), ?, ?, ?, ?)',
      [inventory_id, quantity, notes || '', req.user?.userId || null, restaurantId]
    );
    // Mettre à jour le stock courant
    await executeQuery(
      'UPDATE inventory SET current_stock = current_stock + ? WHERE id = ? AND restaurant_id = ?',
      [quantity, inventory_id, restaurantId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.patch('/api/inventory/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    const updates = req.body;
    if (!restaurantId || !id) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    // Construction dynamique de la requête
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'restaurant_id');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'Aucune donnée à mettre à jour' });
    }
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);
    await executeQuery(
      `UPDATE inventory SET ${setClause} WHERE id = ? AND restaurant_id = ?`,
      [...values, id, restaurantId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Livreurs
app.get('/api/delivery-persons', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    const deliveryPersons = await executeQuery(
      'SELECT * FROM delivery_persons WHERE restaurant_id = ? ORDER BY name',
      [restaurantId]
    );
    res.json({ success: true, data: deliveryPersons });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.post('/api/delivery-persons', authenticate as any, async (req: any, res: any) => {
  try {
    const { name, phone, available = true, current_location = null, rating = null } = req.body;
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    if (!name || !phone || !restaurantId) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    // Insertion réelle dans la base (avec restaurant_id)
    const insertQuery = `
      INSERT INTO delivery_persons (id, name, phone, available, current_location, rating, restaurant_id)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?)
    `;
    await executeQuery(insertQuery, [name, phone, available, current_location, rating, restaurantId]);
    // Retourner le livreur inséré
    const [created] = await executeQuery(
      'SELECT * FROM delivery_persons WHERE restaurant_id = ? AND name = ? AND phone = ? ORDER BY id DESC LIMIT 1',
      [restaurantId, name, phone]
    );
    res.json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.patch('/api/delivery-persons/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    console.log('[PATCH /api/delivery-persons/:id] Body reçu:', req.body);
    if (typeof available !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Champ available requis (boolean)' });
    }
    await executeQuery(
      'UPDATE delivery_persons SET available = ? WHERE id = ?',
      [available, id]
    );
    const [updated] = await executeQuery('SELECT * FROM delivery_persons WHERE id = ?', [id]);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.delete('/api/delivery-persons/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    res.json({ success: true, message: `Livreur ${id} supprimé` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Commandes facturées
app.get('/api/billing-orders', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    const orders = await executeQuery(
      'SELECT * FROM billing_orders WHERE restaurant_id = ? ORDER BY served_at DESC',
      [restaurantId]
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Commandes en ligne
app.get('/api/online-orders', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    // On considère qu'une commande en ligne a le type 'online' ou 'delivery' ou 'takeaway'
    const orders = await executeQuery(
      `SELECT * FROM orders WHERE restaurant_id = ? AND (type = 'online' OR type = 'delivery' OR type = 'takeaway') ORDER BY created_at DESC`,
      [restaurantId]
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Livraisons
app.get('/api/deliveries', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    // Récupérer les livraisons depuis la base
    const deliveries = await executeQuery(
      'SELECT * FROM deliveries WHERE restaurant_id = ? ORDER BY created_at DESC',
      [restaurantId]
    );
    res.json({ success: true, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Création d'une livraison
app.post('/api/deliveries', authenticate as any, async (req: any, res: any) => {
  try {
    const { order_id, delivery_person_id, status = 'assigned', notes = '' } = req.body;
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    if (!order_id || !delivery_person_id || !restaurantId) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    await executeQuery(
      'INSERT INTO deliveries (id, order_id, delivery_person_id, status, notes, restaurant_id, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, NOW())',
      [order_id, delivery_person_id, status, notes, restaurantId]
    );
    res.json({ success: true, message: 'Livraison créée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Récompenses fidélité
app.get('/api/loyalty-rewards', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    const rewards = await executeQuery(
      'SELECT * FROM loyalty_rewards WHERE restaurant_id = ? ORDER BY created_at DESC',
      [restaurantId]
    );
    res.json({ success: true, data: rewards });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.post('/api/loyalty-rewards', authenticate as any, async (req: any, res: any) => {
  try {
    const { name, description, points_cost, image, valid_until, restaurant_id } = req.body;
    if (!restaurant_id || !name || !points_cost) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    const id = uuidv4();
    await executeQuery(
      `INSERT INTO loyalty_rewards (id, restaurant_id, name, description, points_cost, image, valid_until, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, restaurant_id, name, description || null, points_cost, image || null, valid_until || null]
    );
    res.json({ success: true, data: { id, name, description, points_cost, image, valid_until, restaurant_id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.patch('/api/loyalty-rewards/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    res.json({ success: true, data: { id, ...updates } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.delete('/api/loyalty-rewards/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await executeQuery('DELETE FROM loyalty_rewards WHERE id = ?', [id]);
    res.json({ success: true, message: `Récompense ${id} supprimée` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Menus restaurant
app.get('/api/restaurant-menus', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.query.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }

    console.log('=== RÉCUPÉRATION DES MENUS ===');
    console.log('Restaurant ID:', restaurantId);

    const menus = await executeQuery(
      'SELECT * FROM menu_dishes WHERE restaurant_id = ? AND is_available = true',
      [restaurantId]
    );

    console.log('Menus trouvés:', menus);

    res.json({ success: true, data: menus });
  } catch (error) {
    console.error('Erreur récupération menus:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.post('/api/restaurant-menus', authenticate as any, async (req: any, res: any) => {
  try {
    const { name, description, price, category, is_available, restaurant_id } = req.body;
    console.log('Données reçues:', { name, description, price, category, is_available, restaurant_id });

    if (!restaurant_id) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }

    // Validation du prix
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      console.log('Prix invalide:', price);
      return res.status(400).json({ success: false, error: 'Prix invalide' });
    }
    console.log('Prix converti:', numericPrice);

    // Insertion avec UUID généré côté serveur
    const menuId = uuidv4();
    console.log('UUID généré:', menuId);

    try {
      await executeQuery(
        `INSERT INTO menu_dishes (id, name, description, price, category, is_available, restaurant_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [menuId, name, description, numericPrice, category, is_available, restaurant_id]
      );
      console.log('Insertion réussie');
    } catch (dbError) {
      console.error('Erreur SQL:', dbError);
      throw dbError;
    }

    // Récupérer l'élément inséré
    const [insertedItem] = await executeQuery(
      'SELECT * FROM menu_dishes WHERE id = ?',
      [menuId]
    );
    console.log('Élément récupéré:', insertedItem);

    // Formater le prix en nombre pour la réponse
    const formattedItem = {
      ...insertedItem,
      price: parseFloat(insertedItem.price)
    };
    console.log('Élément formaté:', formattedItem);

    res.json({ success: true, data: formattedItem });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du menu:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.patch('/api/restaurant-menus/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    res.json({ success: true, data: { id, ...updates } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.delete('/api/restaurant-menus/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    res.json({ success: true, message: `Menu ${id} supprimé` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Actions commandes
app.post('/api/orders/transfer-to-billing', authenticate as any, async (req: any, res: any) => {
  try {
    const data = req.body;
    res.json({ success: true, data: { ...data, transferred: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// === AJOUT FIDÉLITÉ APRÈS CRÉATION COMMANDE ===
// (À adapter selon la route de création de commande, exemple pour /api/orders)
app.post('/api/orders', authenticate as any, async (req: any, res: any) => {
  try {
    const data = req.body;
    // ... logique d'insertion de la commande ...
    // Supposons que tu as customer_name, customer_phone, restaurant_id
    const { customer_name, customer_phone, restaurant_id } = data;
    // ... insertion commande ...
    // Attribution automatique de points fidélité (10pts)
    await addLoyaltyPoints({
      name: customer_name,
      phone: customer_phone,
      restaurant_id,
      points: 10,
      source: 'order'
    });
    // ... retourne la commande créée ...
    res.json({ success: true, data: {/* ... */} });
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// === ANALYTICS DASHBOARD ===

// 1. Ventes (commandes servies)
app.get('/api/analytics/billing-orders', authenticate as any, async (req: any, res: any) => {
  try {
    const { restaurant_id, start_date } = req.query;
    if (!restaurant_id) return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    const rows = await executeQuery(
      `SELECT * FROM billing_orders WHERE restaurant_id = ? AND served_at >= ? ORDER BY served_at DESC`,
      [restaurant_id, start_date || '1970-01-01']
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// 2. Commandes actives
app.get('/api/analytics/active-orders', authenticate as any, async (req: any, res: any) => {
  try {
    const { restaurant_id } = req.query;
    if (!restaurant_id) return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    const rows = await executeQuery(
      `SELECT * FROM active_orders WHERE restaurant_id = ? ORDER BY created_at DESC`,
      [restaurant_id]
    );
    // Statistiques globales
    const total_active_orders = rows.length;
    const total_value = rows.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
    res.json({ success: true, data: { total_active_orders, total_value, orders: rows } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// 3. Items du menu
app.get('/api/analytics/menu-items', authenticate as any, async (req: any, res: any) => {
  try {
    const { restaurant_id } = req.query;
    if (!restaurant_id) return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    const rows = await executeQuery(
      `SELECT * FROM menu_dishes WHERE restaurant_id = ? ORDER BY created_at DESC`,
      [restaurant_id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// 4. Ventes quotidiennes
app.get('/api/daily-sales', authenticate as any, async (req: any, res: any) => {
  try {
    const { restaurant_id } = req.query;
    if (!restaurant_id) return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    const rows = await executeQuery(
      `SELECT * FROM daily_sales WHERE restaurant_id = ? ORDER BY date DESC`,
      [restaurant_id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// =======================================================================
// ROUTES DASHBOARD TEMPORAIRES (à refactoriser)
// =======================================================================

// Route daily-sales temporaire
app.get('/api/daily-sales', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID manquant' });
    }
    // Pour l'instant, retourner un tableau vide
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route system-alerts temporaire
app.get('/api/system-alerts', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID manquant' });
    }
    // Pour l'instant, retourner un tableau vide
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// =======================================================================
// ROUTES HISTORIQUE (ANALYSE & HISTORY)
// =======================================================================

// GET /api/history/orders?date=YYYY-MM-DD
app.get('/api/history/orders', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const { date } = req.query;
    if (!restaurantId || !date) {
      return res.status(400).json({ success: false, error: 'Restaurant ID et date requis' });
    }
    // Commandes actives du jour
    const activeOrders = await executeQuery(
      `SELECT id, order_number, customer_name, table_id, items, total_amount, status, created_at
       FROM active_orders
       WHERE restaurant_id = ? AND DATE(created_at) = ?`,
      [restaurantId, date]
    );
    // Commandes facturées du jour
    const billingOrders = await executeQuery(
      `SELECT id, order_number, customer_name, table_id, items, total_amount, 'served' as status, served_at as created_at
       FROM billing_orders
       WHERE restaurant_id = ? AND DATE(served_at) = ?`,
      [restaurantId, date]
    );
    // Formatage commun
    const allOrders = [
      ...activeOrders.map((order: any) => ({ ...order, source: 'active' })),
      ...billingOrders.map((order: any) => ({ ...order, source: 'billing' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json({ success: true, data: allOrders });
  } catch (error) {
    console.error('Erreur historique commandes:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// GET /api/history/stock-movements?date=YYYY-MM-DD
app.get('/api/history/stock-movements', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const { date } = req.query;
    if (!restaurantId || !date) {
      return res.status(400).json({ success: false, error: 'Restaurant ID et date requis' });
    }
    // Ajouts de stock du jour
    const stockAdditions = await executeQuery(
      `SELECT sa.id, 'addition' as type, i.item_name, sa.quantity, sa.created_at as date, sa.notes, sa.created_by
       FROM stock_additions sa
       JOIN inventory i ON sa.inventory_item_id = i.id
       WHERE sa.restaurant_id = ? AND DATE(sa.date) = ?`,
      [restaurantId, date]
    );
    // Retraits de stock du jour
    const stockWithdrawals = await executeQuery(
      `SELECT sw.id, 'withdrawal' as type, i.item_name, sw.quantity, sw.withdrawal_date as date, sw.withdrawal_time as time, sw.notes, sw.created_by
       FROM stock_withdrawals sw
       JOIN inventory i ON sw.inventory_item_id = i.id
       WHERE sw.restaurant_id = ? AND DATE(sw.withdrawal_date) = ?`,
      [restaurantId, date]
    );
    const allMovements = [
      ...stockAdditions,
      ...stockWithdrawals
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json({ success: true, data: allMovements });
  } catch (error) {
    console.error('Erreur historique stock:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// === Fournisseurs ===
app.get('/api/suppliers', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.query.restaurant_id || req.user?.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    const suppliers = await executeQuery(
      'SELECT * FROM suppliers WHERE restaurant_id = ? ORDER BY name',
      [restaurantId]
    );
    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.post('/api/suppliers', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    const { name, contact_person, phone, email, address, notes } = req.body;
    if (!restaurantId || !name) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    await executeQuery(
      'INSERT INTO suppliers (id, restaurant_id, name, contact_person, phone, email, address, notes, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW())',
      [restaurantId, name, contact_person || '', phone || '', email || '', address || '', notes || '']
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.patch('/api/suppliers/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    const updates = req.body;
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
      `UPDATE suppliers SET ${setClause} WHERE id = ? AND restaurant_id = ?`,
      [...values, id, restaurantId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.delete('/api/suppliers/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    if (!restaurantId || !id) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    await executeQuery(
      'DELETE FROM suppliers WHERE id = ? AND restaurant_id = ?',
      [id, restaurantId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// === PRÉSENCE DU PERSONNEL ===

// Récupérer la présence (filtrable par staff_member_id, date, etc.)
app.get('/api/staff_attendance', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id || req.query.restaurant_id;
    if (!restaurantId) {
      return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    }
    const { staff_member_id, start_date, end_date, date } = req.query;
    let query = 'SELECT * FROM staff_attendance WHERE restaurant_id = ?';
    const params: any[] = [restaurantId];
    if (staff_member_id) {
      query += ' AND staff_member_id = ?';
      params.push(staff_member_id);
    }
    if (date) {
      query += ' AND attendance_date = ?';
      params.push(date);
    } else {
      if (start_date) {
        query += ' AND attendance_date >= ?';
        params.push(start_date);
      }
      if (end_date) {
        query += ' AND attendance_date <= ?';
        params.push(end_date);
      }
    }
    query += ' ORDER BY attendance_date DESC, clock_in_time DESC';
    const records = await executeQuery(query, params);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Enregistrer une présence (création ou update si déjà existant pour ce staff/date)
app.post('/api/staff_attendance', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    const {
      staff_member_id,
      attendance_date,
      clock_in_time,
      clock_out_time,
      break_start_time,
      break_end_time,
      status,
      total_hours,
      overtime_hours,
      notes,
      approved_by
    } = req.body;
    if (!restaurantId || !staff_member_id || !attendance_date) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    // Helper pour convertir undefined en null
    const toNull = (v: any) => v === undefined ? null : v;
    // Helper pour formater la date au format YYYY-MM-DD sans conversion UTC
    function toDateString(date: any) {
      if (!date) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
      if (typeof date === 'string' && date.includes('T')) return date.split('T')[0];
      return date;
    }
    const attendanceDateSql = toDateString(attendance_date);
    // Vérifier si un enregistrement existe déjà pour ce staff et cette date
    const existing = await executeQuery(
      'SELECT * FROM staff_attendance WHERE staff_member_id = ? AND attendance_date = ? AND restaurant_id = ?',
      [staff_member_id, attendanceDateSql, restaurantId]
    );
    if (existing.length > 0) {
      // Mise à jour
      const id = existing[0].id;
      await executeQuery(
        `UPDATE staff_attendance SET clock_in_time = ?, clock_out_time = ?, break_start_time = ?, break_end_time = ?, status = ?, total_hours = ?, overtime_hours = ?, notes = ?, approved_by = ?, updated_at = NOW() WHERE id = ?`,
        [
          toNull(clock_in_time),
          toNull(clock_out_time),
          toNull(break_start_time),
          toNull(break_end_time),
          status,
          toNull(total_hours),
          toNull(overtime_hours),
          toNull(notes),
          toNull(approved_by),
          id
        ]
      );
      const [updated] = await executeQuery('SELECT * FROM staff_attendance WHERE id = ?', [id]);
      return res.json({ success: true, data: updated });
    } else {
      // Création
      await executeQuery(
        `INSERT INTO staff_attendance (id, staff_member_id, attendance_date, clock_in_time, clock_out_time, break_start_time, break_end_time, status, total_hours, overtime_hours, notes, approved_by, restaurant_id, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          staff_member_id,
          attendanceDateSql,
          toNull(clock_in_time),
          toNull(clock_out_time),
          toNull(break_start_time),
          toNull(break_end_time),
          status,
          toNull(total_hours),
          toNull(overtime_hours),
          toNull(notes),
          toNull(approved_by),
          restaurantId
        ]
      );
      const [created] = await executeQuery(
        'SELECT * FROM staff_attendance WHERE staff_member_id = ? AND attendance_date = ? AND restaurant_id = ?',
        [staff_member_id, attendanceDateSql, restaurantId]
      );
      return res.json({ success: true, data: created });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// =======================================================================
// MIDDLEWARE DE GESTION DES ERREURS
// =======================================================================
app.use('/api', loyaltyRoutes);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('=== ERREUR SERVEUR ===');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  
  if (err.code && err.sqlMessage) {
    console.error('Erreur MySQL:', {
      code: err.code,
      message: err.sqlMessage,
      state: err.sqlState,
      query: err.sql
    });
  }

  res.status(500).json({
    success: false,
    error: config.env === 'development' ? err.message : 'Erreur interne du serveur'
  });
});

// =======================================================================
// DÉMARRAGE DU SERVEUR
// =======================================================================

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // Initialiser la base de données
    console.log('🔄 Initialisation de la base de données...');
    await initDatabase();
    
    // Démarrer le serveur
    const server = app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('🚀 RESTAURANT SAAS API DÉMARRÉE');
      console.log('='.repeat(60));
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environnement: ${config.env}`);
      console.log(`💾 Base de données: MySQL (${config.db.host}:${config.db.port})`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('Erreur lors de la démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();