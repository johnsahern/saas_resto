import { Router } from 'express';
import { 
  login, 
  registerRestaurant, 
  getUserRestaurants, 
  refreshToken, 
  logout,
  verifyToken,
  deliveryLogin
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// =======================================================================
// ROUTES D'AUTHENTIFICATION PUBLIQUES
// =======================================================================

// Connexion utilisateur
router.post('/login', login);

// Inscription d'un nouveau restaurant (SaaS)
router.post('/register-restaurant', registerRestaurant);

// Rafraîchir le token
router.post('/refresh-token', refreshToken);

// Connexion livreur (public)
router.post('/delivery-login', deliveryLogin);

// =======================================================================
// ROUTES D'AUTHENTIFICATION PROTÉGÉES
// =======================================================================

// Vérifier la validité du token
router.get('/verify', authenticate, verifyToken);

// Obtenir les restaurants d'un utilisateur
router.get('/user-restaurants', authenticate, getUserRestaurants);

// Déconnexion
router.post('/logout', authenticate, logout);

export default router;
