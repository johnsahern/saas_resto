import express, { Request, Response } from 'express';
import { executeQuery } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// =======================================================================
// ROUTES ANALYTICS
// =======================================================================

// Appliquer l'authentification à toutes les routes
router.use(authenticate);

// Analytics commandes en ligne
router.get('/online-orders', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurant_id as string;
    const startDate = req.query.start_date as string;

    if (!restaurantId || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID et start_date requis'
      });
    }

    console.log('[ANALYTICS] /online-orders', { restaurantId, startDate });

    // Requête SQL pour récupérer les vraies données des commandes en ligne
    // Correction du formatage des dates et conversion des valeurs en nombres
    const sql = `SELECT 
      DATE_FORMAT(created_at, '%Y-%m-%d') as date,
      COUNT(*) as total_orders,
      CAST(SUM(total_amount) AS DECIMAL(10,2)) as total_revenue,
      CAST(AVG(total_amount) AS DECIMAL(10,2)) as average_order_value
    FROM orders
    WHERE restaurant_id = ? AND created_at >= ?
    GROUP BY DATE(created_at)
    ORDER BY date DESC`;

    console.log('[ANALYTICS] SQL:', sql);
    const results = await executeQuery(sql, [restaurantId, startDate]);
    console.log('[ANALYTICS] Résultat SQL:', results);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Erreur analytics online-orders:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Analytics plats populaires depuis order_items
router.get('/popular-dishes', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurant_id as string;
    const startDate = req.query.start_date as string;

    if (!restaurantId || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID et start_date requis'
      });
    }

    console.log('[ANALYTICS] /popular-dishes', { restaurantId, startDate });

    // Requête pour récupérer les plats les plus populaires
    // Correction: la colonne s'appelle 'name' et non 'item_name'
    const sql = `SELECT 
      name,
      SUM(quantity) as total_quantity
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.restaurant_id = ? AND o.created_at >= ?
    GROUP BY name
    ORDER BY total_quantity DESC
    LIMIT 5`;

    console.log('[ANALYTICS] Popular dishes SQL:', sql);
    const results = await executeQuery(sql, [restaurantId, startDate]);
    console.log('[ANALYTICS] Popular dishes résultat:', results);

    // Formater les données avec des couleurs
    const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];
    const formattedResults = results.map((item: any, index: number) => ({
      name: item.name,
      value: Number(item.total_quantity),
      color: colors[index] || '#6B7280'
    }));

    res.json({
      success: true,
      data: formattedResults
    });

  } catch (error) {
    console.error('Erreur analytics popular-dishes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Analytics affluence par créneaux horaires depuis order_items
router.get('/time-slots', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurant_id as string;
    const startDate = req.query.start_date as string;

    if (!restaurantId || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID et start_date requis'
      });
    }

    console.log('[ANALYTICS] /time-slots', { restaurantId, startDate });

    // Requête pour récupérer l'affluence par créneaux horaires
    const sql = `SELECT 
      HOUR(o.created_at) as hour_slot,
      COUNT(DISTINCT oi.order_id) as order_count
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.restaurant_id = ? AND o.created_at >= ?
    GROUP BY HOUR(o.created_at)
    ORDER BY hour_slot`;

    console.log('[ANALYTICS] Time slots SQL:', sql);
    const results = await executeQuery(sql, [restaurantId, startDate]);
    console.log('[ANALYTICS] Time slots résultat:', results);

    // Formater les données avec les créneaux horaires étendus (6h-22h)
    const timeSlots = [
      '6h-7h', '7h-8h', '8h-9h', '9h-10h', '10h-11h',
      '11h-12h', '12h-13h', '13h-14h', '14h-15h', '15h-16h', 
      '16h-17h', '17h-18h', '18h-19h', '19h-20h', '20h-21h', '21h-22h'
    ];

    const formattedResults = timeSlots.map((slot, index) => {
      const hour = index + 6; // Les créneaux commencent à 6h
      const found = results.find((r: any) => r.hour_slot === hour);
      return {
        slot,
        orders: found ? Number(found.order_count) : 0
      };
    });

    res.json({
      success: true,
      data: formattedResults
    });

  } catch (error) {
    console.error('Erreur analytics time-slots:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Analytics commandes actives
router.get('/active-orders', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurant_id as string;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID requis'
      });
    }

    // Pour l'instant, retourner des données de test
    const results = {
      total_active_orders: 0,
      pending_orders: 0,
      preparing_orders: 0,
      ready_orders: 0,
      total_value: 0
    };

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Erreur analytics active-orders:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Analytics stats commandes actives
router.get('/active-orders-stats', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurant_id as string;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    console.log('Request params:', { restaurantId, startDate, endDate });

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID requis'
      });
    }

    // Récupérer les commandes actives avec leurs statuts
    const query = `
      SELECT status, COUNT(*) as count
      FROM orders
      WHERE restaurant_id = ?
      AND created_at BETWEEN ? AND ?
      AND status IN ('pending', 'preparing', 'ready', 'cancelled')
      GROUP BY status
    `;

    console.log('Executing query:', query);
    console.log('Query params:', [restaurantId, startDate, endDate]);

    const results = await executeQuery(query, [restaurantId, startDate, endDate]);
    console.log('Raw query results:', results);

    // S'assurer que chaque statut a une entrée
    const defaultStatuses = ['pending', 'preparing', 'ready', 'cancelled'];
    const formattedResults = defaultStatuses.map(status => {
      const found = results.find((r: any) => r.status === status);
      return {
        status,
        count: found ? found.count : 0
      };
    });

    console.log('Formatted results:', formattedResults);

    res.json({
      success: true,
      data: formattedResults
    });

  } catch (error) {
    console.error('Erreur analytics active-orders-stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Analytics commandes facturées
router.get('/billing-orders', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurant_id as string;
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID requis'
      });
    }
    const results = await executeQuery(
      `SELECT * FROM billing_orders WHERE restaurant_id = ?`,
      [restaurantId]
    );
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Erreur analytics billing-orders:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Analytics stats facturation
router.get('/billing-orders-stats', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurant_id as string;
    const startDate = req.query.start_date as string;
    const endDate = req.query.end_date as string;

    console.log('Request params:', { restaurantId, startDate, endDate });

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID requis'
      });
    }

    // Récupérer les commandes facturées
    const query = `
      SELECT COUNT(*) as count
      FROM billing_orders
      WHERE restaurant_id = ?
      AND served_at BETWEEN ? AND ?
    `;

    console.log('Executing query:', query);
    console.log('Query params:', [restaurantId, startDate, endDate]);

    const results = await executeQuery(query, [restaurantId, startDate, endDate]);
    console.log('Raw query results:', results);

    const formattedResults = results[0] ? [{ status: 'served', count: results[0].count }] : [];
    console.log('Formatted results:', formattedResults);

    res.json({
      success: true,
      data: formattedResults
    });

  } catch (error) {
    console.error('Erreur analytics billing-orders-stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Analytics articles du menu
router.get('/menu-items', async (req: Request, res: Response) => {
  try {
    const restaurantId = req.query.restaurant_id as string;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID requis'
      });
    }

    res.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Erreur analytics menu-items:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

export default router; 