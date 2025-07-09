import express from 'express';
import { createTakeawayOrder, createDeliveryOrder } from '../controllers/orderController';
import { createReservation } from '../controllers/reservationController';

const router = express.Router();

// Toutes les routes sont maintenant publiques (pas de verifyBotpressToken)
router.post('/takeaway-orders', createTakeawayOrder);
router.post('/delivery-orders', createDeliveryOrder);
router.post('/reservations', createReservation);

// Route de santé pour vérifier si le serveur fonctionne
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Le serveur webhook est opérationnel',
    timestamp: new Date().toISOString()
  });
});

export default router;
