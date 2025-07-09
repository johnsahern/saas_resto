import { Request, Response } from 'express';
import { authService } from '@/services/authService';
import { db } from '@/config/database';
import { RestaurantManager } from '@/types/mysql';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password, restaurantCode } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email et mot de passe requis'
        });
      }

      const response = await authService.login(email, password, restaurantCode);

      if (!response.success) {
        return res.status(401).json(response);
      }

      res.json(response);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la connexion'
      });
    }
  },

  async validateRestaurantCode(req: Request, res: Response) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Code restaurant requis'
        });
      }

      const result = await db.query<RestaurantManager[]>(
        `SELECT rm.*, r.name
         FROM restaurant_managers rm
         JOIN restaurants r ON rm.restaurant_id = r.id
         WHERE rm.restaurant_code = $1
         AND rm.is_active = true
         AND r.is_active = true`,
        [code]
      );

      const managerRows = result[0];

      res.json({
        success: true,
        data: {
          isValid: managerRows.length > 0,
          restaurant: managerRows.length > 0 ? {
            name: managerRows[0].name
          } : null
        }
      });
    } catch (error) {
      console.error('Erreur lors de la validation du code:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la validation du code'
      });
    }
  }
}; 