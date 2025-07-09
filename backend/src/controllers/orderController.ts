import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeTransaction } from '../config/database.js';
import { AuthenticatedRequest, Order, OrderItem, ApiResponse } from '../types/index.js';
import { ResultSetHeader, OkPacket } from 'mysql2';
import { addLoyaltyPoints } from '../utils/loyaltyUtils.js';

// =======================================================================
// OBTENIR TOUTES LES COMMANDES D'UN RESTAURANT
// =======================================================================

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const { status, type, page = 1, limit = 20, date } = req.query;

    if (!restaurantId) {
      res.status(400).json({
        success: false,
        error: 'Restaurant ID requis'
      } as ApiResponse);
      return;
    }

    let whereClause = 'WHERE o.restaurant_id = ?';
    const params: any[] = [restaurantId];

    // Filtres
    if (status) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    if (type) {
      whereClause += ' AND o.type = ?';
      params.push(type);
    }

    if (date) {
      whereClause += ' AND DATE(o.created_at) = ?';
      params.push(date);
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    
    // Requête pour les commandes avec leurs articles
    const ordersQuery = `
      SELECT 
        o.*,
        rt.table_number,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', oi.id,
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity,
            'options', oi.options,
            'notes', oi.notes
          ) SEPARATOR '|||'
        ) as items
      FROM orders o
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT o.id) as total
      FROM orders o
      ${whereClause}
    `;

    const [orders, counts] = await Promise.all([
      executeQuery(ordersQuery, [...params, Number(limit), offset]),
      executeQuery(countQuery, params)
    ]);

    const total = counts[0]?.total || 0;
    const totalPages = Math.ceil(total / Number(limit));

    // Formater les résultats
    const formattedOrders = orders.map((order: any) => {
      let items = [];
      if (order.items) {
        items = order.items.split('|||').map((item: string) => JSON.parse(item));
      }
      return {
        ...order,
        items
      };
    });

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          total,
          totalPages,
          currentPage: Number(page),
          limit: Number(limit)
        }
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des commandes'
    } as ApiResponse);
  }
};

// =======================================================================
// OBTENIR UNE COMMANDE PAR ID
// =======================================================================

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurantId = req.user?.restaurant_id;

    const orderQuery = `
      SELECT 
        o.*,
        rt.table_number,
        rt.capacity
      FROM orders o
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      WHERE o.id = ? AND o.restaurant_id = ?
    `;

    const orders = await executeQuery(orderQuery, [id, restaurantId]);

    if (orders.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Commande non trouvée'
      } as ApiResponse);
      return;
    }

    // Récupérer les articles de la commande
    const items = await executeQuery(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at',
      [id]
    );

    const order = {
      ...orders[0],
      items
    };

    res.json({
      success: true,
      data: order
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur récupération commande:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    } as ApiResponse);
  }
};

// =======================================================================
// CRÉER UNE NOUVELLE COMMANDE
// =======================================================================

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const {
      order_number,
      table_id,
      customer_name,
      items,
      total_amount,
      status = 'pending',
      notes
    } = req.body;

    console.log('=== CRÉATION COMMANDE ===');
    console.log('Données reçues:', {
      restaurantId,
      order_number,
      table_id,
      customer_name,
      items: typeof items === 'string' ? 'JSON string' : items,
      total_amount,
      status,
      notes
    });

    // Validation du restaurant
    if (!restaurantId) {
      console.log('Restaurant ID manquant');
      res.status(400).json({
        success: false,
        error: 'Restaurant ID requis'
      } as ApiResponse);
      return;
    }

    // Validation du numéro de commande
    if (!order_number) {
      console.log('Numéro de commande manquant');
      res.status(400).json({
        success: false,
        error: 'Numéro de commande requis'
      } as ApiResponse);
      return;
    }

    // Validation des items
    if (!items) {
      console.log('Items manquants');
      res.status(400).json({
        success: false,
        error: 'Les articles sont requis'
      } as ApiResponse);
      return;
    }

    // Parsing des items si nécessaire
    let parsedItems;
    try {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
      
      if (!Array.isArray(parsedItems)) {
        throw new Error('Les articles doivent être un tableau');
      }

      // Validation de chaque item
      parsedItems.forEach((item: any, index: number) => {
        if (!item.name || typeof item.name !== 'string') {
          throw new Error(`L'item ${index} doit avoir un nom valide`);
        }
        if (!item.quantity || typeof item.quantity !== 'number') {
          throw new Error(`L'item ${index} doit avoir une quantité valide`);
        }
        if (typeof item.price !== 'number') {
          throw new Error(`L'item ${index} doit avoir un prix valide`);
        }
      });

    } catch (e: any) {
      console.log('Erreur validation items:', e.message);
      res.status(400).json({
        success: false,
        error: `Format des articles invalide: ${e.message}`
      } as ApiResponse);
      return;
    }

    // Valider le montant total
    if (typeof total_amount !== 'number') {
      console.log('Montant total invalide:', total_amount);
      res.status(400).json({
        success: false,
        error: 'Le montant total doit être un nombre'
      } as ApiResponse);
      return;
    }

    console.log('Validation des données OK');

    // Insérer dans active_orders
    const query = `
      INSERT INTO active_orders (
        id,
        restaurant_id,
        order_number,
        table_id,
        customer_name,
        items,
        total_amount,
        status,
        notes,
        created_at,
        updated_at
      ) VALUES (
        UUID(),
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        NOW(),
        NOW()
      )
    `;

    const itemsJson = typeof items === 'string' ? items : JSON.stringify(items);
    const params = [
      restaurantId,
      order_number,
      table_id || null,
      customer_name || null,
      itemsJson,
      total_amount, // Prix en FCFA
      status,
      notes || ''
    ];

    console.log('Requête SQL:', {
      query,
      params,
      paramTypes: params.map(p => typeof p)
    });

    try {
      const result = await executeQuery(query, params);
      console.log('Résultat insertion:', result);

      const insertId = (result[0] as any).insertId;

      // Attribution automatique de points fidélité (10pts)
      if (customer_name && req.body.customer_phone) {
        await addLoyaltyPoints({
          name: customer_name,
          phone: req.body.customer_phone,
          restaurant_id: restaurantId,
          points: 10,
          source: 'order'
        });
      }

      res.json({
        success: true,
        data: {
          id: insertId,
          message: 'Commande créée avec succès'
        }
      } as ApiResponse);

    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création de la commande dans la base de données'
      } as ApiResponse);
    }

  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la commande'
    } as ApiResponse);
  }
};

// =======================================================================
// METTRE À JOUR LE STATUT D'UNE COMMANDE
// =======================================================================

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const restaurantId = req.user?.restaurant_id;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Statut invalide'
      } as ApiResponse);
      return;
    }

    // Vérifier que la commande existe et appartient au restaurant
    const orders = await executeQuery(
      'SELECT * FROM orders WHERE id = ? AND restaurant_id = ?',
      [id, restaurantId]
    );

    if (orders.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Commande non trouvée'
      } as ApiResponse);
      return;
    }

    const order = orders[0];
    const queries = [];

    // Mettre à jour le statut
    queries.push({
      query: 'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      params: [status, id]
    });

    // Si la commande est servie et qu'elle est sur table, libérer la table
    if (status === 'served' && order.table_id && order.type === 'dine-in') {
      queries.push({
        query: `UPDATE restaurant_tables SET status = 'available' WHERE id = ?`,
        params: [order.table_id]
      });
    }

    // Si la commande est annulée et qu'elle est sur table, libérer la table
    if (status === 'cancelled' && order.table_id && order.type === 'dine-in') {
      queries.push({
        query: `UPDATE restaurant_tables SET status = 'available' WHERE id = ?`,
        params: [order.table_id]
      });
    }

    await executeTransaction(queries);

    res.json({
      success: true,
      message: 'Statut de commande mis à jour'
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur mise à jour statut commande:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    } as ApiResponse);
  }
};

// =======================================================================
// SUPPRIMER UNE COMMANDE
// =======================================================================

export const deleteOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const restaurantId = req.user?.restaurant_id;

    // Vérifier que la commande existe et peut être supprimée
    const orders = await executeQuery(
      'SELECT * FROM orders WHERE id = ? AND restaurant_id = ?',
      [id, restaurantId]
    );

    if (orders.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Commande non trouvée'
      } as ApiResponse);
      return;
    }

    const order = orders[0];

    // Ne pas permettre la suppression de commandes déjà servies
    if (order.status === 'served') {
      res.status(400).json({
        success: false,
        error: 'Impossible de supprimer une commande déjà servie'
      } as ApiResponse);
      return;
    }

    const queries = [
      // Supprimer les articles de la commande
      {
        query: 'DELETE FROM order_items WHERE order_id = ?',
        params: [id]
      },
      // Supprimer la commande
      {
        query: 'DELETE FROM orders WHERE id = ?',
        params: [id]
      }
    ];

    // Si la commande était sur table, libérer la table
    if (order.table_id && order.type === 'dine-in') {
      queries.unshift({
        query: `UPDATE restaurant_tables SET status = 'available' WHERE id = ?`,
        params: [order.table_id]
      });
    }

    await executeTransaction(queries);

    res.json({
      success: true,
      message: 'Commande supprimée avec succès'
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur suppression commande:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    } as ApiResponse);
  }
};

// =======================================================================
// STATISTIQUES DES COMMANDES
// =======================================================================

export const getOrderStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const { period = 'today' } = req.query;

    let dateCondition = '';
    if (period === 'today') {
      dateCondition = 'AND DATE(created_at) = CURDATE()';
    } else if (period === 'week') {
      dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing_orders,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready_orders,
        SUM(CASE WHEN status = 'served' THEN 1 ELSE 0 END) as served_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN type = 'dine-in' THEN 1 ELSE 0 END) as dine_in_orders,
        SUM(CASE WHEN type = 'takeaway' THEN 1 ELSE 0 END) as takeaway_orders,
        SUM(CASE WHEN type = 'delivery' THEN 1 ELSE 0 END) as delivery_orders
      FROM orders 
      WHERE restaurant_id = ? ${dateCondition}
    `, [restaurantId]);

    res.json({
      success: true,
      data: stats[0]
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur statistiques commandes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    } as ApiResponse);
  }
};

// =======================================================================
// FONCTIONS UTILITAIRES
// =======================================================================

const generateOrderNumber = async (restaurantId: string): Promise<string> => {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  // Compter les commandes du jour
  const count = await executeQuery(
    'SELECT COUNT(*) as count FROM orders WHERE restaurant_id = ? AND DATE(created_at) = CURDATE()',
    [restaurantId]
  );
  
  const orderCount = count[0].count + 1;
  return `ORD-${today}-${orderCount.toString().padStart(4, '0')}`;
};

// =======================================================================
// CRÉER UNE NOUVELLE COMMANDE ACTIVE
// =======================================================================

export const createActiveOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const {
      order_number,
      table_id,
      customer_name,
      items,
      total_amount,
      notes
    } = req.body;

    if (!restaurantId) {
      res.status(400).json({
        success: false,
        error: 'Restaurant ID manquant'
      } as ApiResponse);
      return;
    }

    // Validation des données
    if (!order_number || !items || total_amount === undefined) {
      res.status(400).json({
        success: false,
        error: 'Données de commande incomplètes'
      } as ApiResponse);
      return;
    }

    const query = `
      INSERT INTO active_orders (
        id,
        restaurant_id,
        order_number,
        table_id,
        customer_name,
        items,
        total_amount,
        status,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const orderId = uuidv4();
    const params = [
      orderId,
      restaurantId,
      order_number,
      table_id || null,
      customer_name || null,
      items,
      total_amount,
      'pending',
      notes || ''
    ];

    const result = await executeQuery(query, params);
    console.log('Résultat insertion:', result);

    // Attribution automatique de points fidélité (10pts)
    if (customer_name && req.body.customer_phone) {
      await addLoyaltyPoints({
        name: customer_name,
        phone: req.body.customer_phone,
        restaurant_id: restaurantId,
        points: 10,
        source: 'order'
      });
    }

    res.json({
      success: true,
      data: {
        id: orderId,
        message: 'Commande créée avec succès'
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur création commande active:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la commande'
    } as ApiResponse);
  }
};

export default {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStatistics,
  createActiveOrder
};
