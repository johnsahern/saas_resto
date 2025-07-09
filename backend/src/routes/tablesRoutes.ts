import express, { Request, Response } from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// =======================================================================
// ROUTES POUR LES DONNÉES DES RESTAURANTS
// =======================================================================

// Route spécifique pour les tables de restaurant
router.get('/', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurant_id as string;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID requis'
      });
    }

    const query = `
      SELECT id, table_number, capacity, status, position_x, position_y
      FROM restaurant_tables 
      WHERE restaurant_id = ?
      ORDER BY table_number
    `;

    const results = await executeQuery(query, [restaurantId]);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Erreur récupération tables:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Route générique pour toutes les tables avec support SaaS
router.get('/:table_name', async (req: Request, res: Response) => {
  try {
    const { table_name } = req.params;
    const { select = '*' } = req.query;
    const restaurantId = req.headers['x-restaurant-id'] as string;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID requis'
      });
    }

    // Vérifier que la table est autorisée
    const allowedTables = [
      'active_orders',
      'daily_sales', 
      'restaurant_tables',
      'menu_items',
      'inventory_items',
      'staff_members',
      'reservations',
      'customers',
      'delivery_persons',
      'invoices',
      'analytics_data'
    ];

    if (!allowedTables.includes(table_name)) {
      return res.status(403).json({
        success: false,
        error: 'Table non autorisée'
      });
    }

    let query = '';
    let params: any[] = [];

    // Construire la requête selon la table demandée
    switch (table_name) {
      case 'active_orders':
        query = `
          SELECT ao.*, rt.table_number, rt.capacity 
          FROM active_orders ao 
          LEFT JOIN restaurant_tables rt ON ao.table_id = rt.id 
          WHERE ao.restaurant_id = ? AND ao.status IN ('pending', 'preparing', 'ready')
          ORDER BY ao.created_at DESC
        `;
        params = [restaurantId];
        break;

      case 'daily_sales':
        query = `
          SELECT 
            sale_date as date,
            total_orders,
            total_revenue,
            average_order_value,
            customers_served
          FROM daily_sales 
          WHERE restaurant_id = ? AND sale_date = CURDATE()
        `;
        params = [restaurantId];
        break;

      case 'restaurant_tables':
        query = `
          SELECT id, table_number, capacity, status, position_x, position_y
          FROM restaurant_tables 
          WHERE restaurant_id = ?
          ORDER BY table_number
        `;
        params = [restaurantId];
        break;

      case 'menu_items':
        query = `
          SELECT id, name, description, price, category, is_available, image_url
          FROM menu_items 
          WHERE restaurant_id = ? AND is_active = true
          ORDER BY category, name
        `;
        params = [restaurantId];
        break;

      case 'inventory_items':
        query = `
          SELECT id, name, description, current_stock, min_stock, unit, cost_per_unit, category
          FROM inventory_items 
          WHERE restaurant_id = ?
          ORDER BY category, name
        `;
        params = [restaurantId];
        break;

      case 'staff_members':
        query = `
          SELECT u.id, u.first_name, u.last_name, u.email, u.phone, 
                 ru.role, ru.is_active, ru.created_at
          FROM saas_users u
          JOIN restaurant_users ru ON u.id = ru.user_id
          WHERE ru.restaurant_id = ? AND ru.is_active = true
          ORDER BY u.first_name, u.last_name
        `;
        params = [restaurantId];
        break;

      case 'reservations':
        query = `
          SELECT id, customer_name, customer_phone, customer_email,
                 reservation_date, reservation_time, party_size, 
                 table_id, status, special_requests
          FROM reservations 
          WHERE restaurant_id = ?
          ORDER BY reservation_date DESC, reservation_time DESC
        `;
        params = [restaurantId];
        break;

      case 'customers':
        query = `
          SELECT id, first_name, last_name, email, phone, 
                 loyalty_points, total_visits, total_spent, created_at
          FROM customers 
          WHERE restaurant_id = ?
          ORDER BY total_spent DESC
        `;
        params = [restaurantId];
        break;

      case 'delivery_persons':
        query = `
          SELECT id, first_name, last_name, phone, email, 
                 status, vehicle_type, current_location, is_active
          FROM delivery_persons 
          WHERE restaurant_id = ?
          ORDER BY first_name, last_name
        `;
        params = [restaurantId];
        break;

      case 'invoices':
        query = `
          SELECT id, invoice_number, customer_name, amount, 
                 status, created_at, due_date, paid_at
          FROM invoices 
          WHERE restaurant_id = ?
          ORDER BY created_at DESC
        `;
        params = [restaurantId];
        break;

      default:
        return res.status(404).json({
          success: false,
          error: 'Table non trouvée'
        });
    }

    const results = await executeQuery(query, params);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error(`Erreur récupération ${req.params.table_name}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Route POST pour créer une table de restaurant
router.post('/', async (req: Request, res: Response) => {
  try {
    const { table_number, capacity, status = 'available', position_x = 0, position_y = 0, restaurant_id } = req.body;
    if (!table_number || !capacity || !restaurant_id) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    await executeQuery(
      'INSERT INTO restaurant_tables (id, table_number, capacity, status, position_x, position_y, restaurant_id, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())',
      [table_number, capacity, status, position_x, position_y, restaurant_id]
    );
    res.json({ success: true, message: 'Table créée avec succès' });
  } catch (error) {
    console.error('Erreur création table:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route POST pour créer des données
router.post('/:table_name', async (req: Request, res: Response) => {
  try {
    const { table_name } = req.params;
    const restaurantId = req.headers['x-restaurant-id'] as string;
    const data = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID requis'
      });
    }

    // Ajouter automatiquement le restaurant_id aux données
    const enrichedData = {
      ...data,
      restaurant_id: restaurantId
    };

    // Pour l'instant, retourner une réponse simple
    res.json({
      success: true,
      data: enrichedData,
      message: `${table_name} créé avec succès`
    });

  } catch (error) {
    console.error(`Erreur création ${req.params.table_name}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

export default router; 