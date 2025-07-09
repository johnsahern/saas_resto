import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStatistics
} from '../controllers/orderController.js';
import { 
  authenticate, 
  requireRestaurant, 
  requireActiveRestaurant,
  requireRole 
} from '../middleware/auth.js';

const router = Router();

// Tous les middlewares nécessaires pour les routes de commandes
router.use(authenticate);
router.use(requireRestaurant);
router.use(requireActiveRestaurant);

// =======================================================================
// ROUTES DES COMMANDES
// =======================================================================

// Obtenir toutes les commandes (avec filtres et pagination)
router.get('/', getOrders);

// Obtenir les statistiques des commandes
router.get('/statistics', getOrderStatistics);

// Obtenir une commande par ID
router.get('/:id', getOrderById);

// Créer une nouvelle commande
router.post('/', createOrder);

// Mettre à jour le statut d'une commande
router.patch('/:id/status', updateOrderStatus);

// Supprimer une commande (restrictions appliquées)
router.delete('/:id', requireRole(['owner', 'admin', 'manager']), deleteOrder);

export default router;
