import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { executeQuery } from '../config/database.js';
import { SaasUser, RestaurantUser, AuthenticatedRequest, User } from '../types/index.js';

interface TokenPayload {
  userId: string;
  email: string;
  is_super_admin?: boolean;
  restaurant_id?: string;
  role?: string;
}

// Middleware d'authentification principal
export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    console.log('=== AUTHENTIFICATION ===');
    console.log('Headers:', req.headers);
    
    const token = extractToken(req);
    console.log('Token extrait:', token ? 'Présent' : 'Absent');
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token d\'authentification requis'
      });
      return;
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    console.log('Token décodé:', decoded);

    // Cas livreur : delivery_person_id dans le token
    if (decoded.delivery_person_id) {
      (req as AuthenticatedRequest).user = {
        id: decoded.delivery_person_id,
        delivery_person_id: decoded.delivery_person_id,
        restaurant_id: decoded.restaurant_id,
        role: decoded.role || 'delivery',
      };
      return next();
    }

    // Cas utilisateur classique (admin, manager, etc.)
    // Récupérer l'utilisateur depuis la base de données
    const users = await executeQuery<SaasUser>(
      'SELECT * FROM saas_users WHERE id = ?',
      [decoded.userId]
    );
    console.log('Utilisateur trouvé:', users.length > 0);
    
    if (users.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    const user = users[0];
    console.log('Informations utilisateur:', {
      id: user.id,
      email: user.email,
      is_super_admin: user.is_super_admin,
      restaurant_id: decoded.restaurant_id,
      role: decoded.role
    });

    // Ajouter les informations de l'utilisateur à la requête
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      restaurant_id: decoded.restaurant_id || '',
      role: decoded.role || 'user',
      is_super_admin: user.is_super_admin,
      userId: user.id
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
};

// Middleware pour vérifier qu'un utilisateur appartient à un restaurant
export const requireRestaurant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
      return;
    }

    if (req.user.is_super_admin) {
      next();
      return;
    }

    if (!req.user.restaurant_id) {
      res.status(403).json({
        success: false,
        error: 'Accès restaurant requis'
      });
      return;
    }

    // Cas livreur : on ne vérifie pas dans restaurant_users
    if (req.user.role === 'delivery' || req.user.delivery_person_id) {
      // On vérifie juste que le restaurant_id du token correspond à la requête (optionnel)
      return next();
    }

    // Vérifier que l'utilisateur est bien associé au restaurant (cas admin/manager)
    const restaurantUsers = await executeQuery<RestaurantUser>(
      'SELECT * FROM restaurant_users WHERE user_id = ? AND restaurant_id = ? AND is_active = true',
      [req.user.id, req.user.restaurant_id]
    );

    if (restaurantUsers.length === 0) {
      res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce restaurant'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Erreur de vérification restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Middleware pour vérifier les rôles
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
      return;
    }

    if (req.user.is_super_admin) {
      next();
      return;
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Permissions insuffisantes'
      });
      return;
    }

    next();
  };
};

// Middleware pour vérifier les permissions spécifiques
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
      return;
    }

    if (req.user.is_super_admin) {
      next();
      return;
    }

    // Note: Permissions système pas encore implémenté
    next();
  };
};

// Middleware pour vérifier qu'un restaurant est actif
export const requireActiveRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.restaurant_id) {
      res.status(403).json({
        success: false,
        error: 'Restaurant requis'
      });
      return;
    }

    // Vérifier que le restaurant est actif
    const restaurants = await executeQuery(
      'SELECT * FROM restaurants WHERE id = ? AND is_active = true',
      [req.user.restaurant_id]
    );

    if (restaurants.length === 0) {
      res.status(403).json({
        success: false,
        error: 'Restaurant inactif ou non trouvé'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Erreur de vérification restaurant actif:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Fonction utilitaire pour extraire le token
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Alternative: cookie ou query param
  return req.query.token as string || null;
};

// Fonction pour générer un token JWT
export const generateToken = (payload: object): string => {
  try {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Erreur génération token:', error);
    throw new Error('Impossible de générer le token');
  }
};

// Fonction pour générer un refresh token
export const generateRefreshToken = (payload: object): string => {
  try {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '7d'
    });
  } catch (error) {
    console.error('Erreur génération refresh token:', error);
    throw new Error('Impossible de générer le refresh token');
  }
};

export default {
  authenticate,
  requireRestaurant,
  requireRole,
  requirePermission,
  requireActiveRestaurant,
  generateToken,
  generateRefreshToken
};
