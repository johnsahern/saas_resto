import { Request, Response } from 'express';
import { executeQuery } from '../config/database.js';

// =======================================================================
// CONTRÔLEUR DASHBOARD - DONNÉES PRINCIPALES
// =======================================================================

/**
 * Récupérer les commandes actives du restaurant
 */
export const getActiveOrders = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID manquant'
      });
    }

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
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des commandes actives'
    });
  }
};

/**
 * Récupérer les ventes quotidiennes du restaurant
 */
export const getDailySales = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID manquant'
      });
    }

    const query = `
      SELECT 
        id,
        date,
        total_revenue,
        total_orders,
        customers_served,
        average_order_value,
        created_at,
        updated_at
      FROM daily_sales 
      WHERE restaurant_id = ? 
      ORDER BY date DESC
      LIMIT 30
    `;
    
    const sales = await executeQuery(query, [restaurantId]);
    
    res.json({
      success: true,
      data: sales
    });
    
  } catch (error) {
    console.error('Erreur récupération ventes quotidiennes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des ventes quotidiennes'
    });
  }
};

/**
 * Récupérer les alertes système du restaurant
 */
export const getSystemAlerts = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurant_id;
    const { is_read } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID manquant'
      });
    }

    let query = `
      SELECT 
        id,
        title,
        message,
        type,
        priority,
        is_read,
        created_at,
        expires_at
      FROM system_alerts 
      WHERE restaurant_id = ?
    `;
    
    const params: (string | number)[] = [restaurantId];
    
    // Filtrer par statut de lecture si spécifié
    if (is_read !== undefined) {
      query += ' AND is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY priority DESC, created_at DESC';
    
    const alerts = await executeQuery(query, params);
    
    res.json({
      success: true,
      data: alerts
    });
    
  } catch (error) {
    console.error('Erreur récupération alertes système:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des alertes système'
    });
  }
}; 