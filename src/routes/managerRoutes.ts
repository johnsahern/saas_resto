import express from 'express';
import { managerController } from '@/controllers/managerController';
import { authMiddleware } from '@/middleware/auth';
import { checkRole } from '@/middleware/checkRole';

const router = express.Router();

// Routes protégées nécessitant une authentification
router.use(authMiddleware);

// Routes accessibles uniquement aux propriétaires
router.post('/managers', checkRole(['owner']), managerController.createManager);
router.get('/managers/restaurant/:restaurantId', checkRole(['owner']), managerController.getManagersByRestaurant);
router.patch('/managers/:managerId', checkRole(['owner']), managerController.updateManager);
router.patch('/managers/:managerId/deactivate', checkRole(['owner']), managerController.deactivateManager);
router.post('/restaurants/:restaurantId/generate-code', checkRole(['owner']), managerController.generateRestaurantCode);

// Route accessible à tous pour la validation du code restaurant
router.post('/restaurants/validate-code', managerController.validateRestaurantCode);

export default router; 