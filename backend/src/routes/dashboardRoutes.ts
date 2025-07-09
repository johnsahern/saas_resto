import { Router } from 'express';
import {
  getActiveOrders,
  getDailySales,
  getSystemAlerts
} from '../controllers/dashboardController.js';
import { 
  authenticate, 
  requireRestaurant, 
  requireActiveRestaurant 
} from '../middleware/auth.js';

const router = Router();

// =======================================================================
// ROUTES DU DASHBOARD
// =======================================================================

// Obtenir les commandes actives
router.get('/active-orders', authenticate, requireRestaurant, requireActiveRestaurant, getActiveOrders);

// Obtenir les ventes quotidiennes
router.get('/daily-sales', authenticate, requireRestaurant, requireActiveRestaurant, getDailySales);

// Obtenir les alertes système
router.get('/system-alerts', authenticate, requireRestaurant, requireActiveRestaurant, getSystemAlerts);

export default router; 