import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '@/config/database';
import { User, RestaurantManager } from '@/types/mysql';

interface JwtPayload {
  userId: string;
  role: string;
  restaurantId?: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Vérifier et décoder le token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'votre_secret_jwt'
    ) as JwtPayload;

    // Récupérer les informations de l'utilisateur
    const result = await db.query<User[]>(
      'SELECT id, role, is_super_admin FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    const userRows = result[0];

    if (userRows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé ou inactif'
      });
      return;
    }

    const user = userRows[0];

    // Si c'est un manager, vérifier l'association avec le restaurant
    if (user.role === 'manager' && decoded.restaurantId) {
      const managerResult = await db.query<RestaurantManager[]>(
        `SELECT rm.* 
         FROM restaurant_managers rm
         WHERE rm.user_id = $1 
         AND rm.restaurant_id = $2 
         AND rm.is_active = true`,
        [user.id, decoded.restaurantId]
      );

      const managerRows = managerResult[0];

      if (managerRows.length === 0) {
        res.status(403).json({
          success: false,
          error: 'Accès non autorisé à ce restaurant'
        });
        return;
      }
    }

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: user.id,
      role: user.role,
      restaurantId: decoded.restaurantId,
      is_super_admin: user.is_super_admin
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
      return;
    }

    console.error('Erreur d\'authentification:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'authentification'
    });
  }
}; 