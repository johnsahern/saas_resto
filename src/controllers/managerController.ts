import { Request, Response } from 'express';
import { db } from '@/config/database';
import { generateRestaurantCode } from '@/utils/codeGenerator';
import bcrypt from 'bcrypt';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface RestaurantManagerRow extends RowDataPacket {
  user_id: number;
  restaurant_id: string;
  restaurant_code: string;
}

export const managerController = {
  // Créer un nouveau manager
  async createManager(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, restaurantId } = req.body;

      // Vérifier si l'email existe déjà
      const [existingManagers] = await db.query<UserRow[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingManagers.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Un utilisateur avec cet email existe déjà'
        });
        return;
      }

      // Générer le hash du mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Générer un code unique pour le restaurant
      const restaurantCode = await generateRestaurantCode();

      // Créer le manager dans la transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Insérer l'utilisateur
        const [result] = await connection.execute<ResultSetHeader>(
          `INSERT INTO users (name, email, password, role)
           VALUES (?, ?, ?, 'manager')`,
          [name, email, hashedPassword]
        );

        // Lier le manager au restaurant
        await connection.execute(
          `INSERT INTO restaurant_managers (user_id, restaurant_id, restaurant_code)
           VALUES (?, ?, ?)`,
          [result.insertId, restaurantId, restaurantCode]
        );

        await connection.commit();

        res.status(201).json({
          success: true,
          data: {
            id: result.insertId,
            name,
            email,
            role: 'manager',
            restaurantId,
            restaurantCode
          }
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Erreur lors de la création du manager:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du manager'
      });
    }
  },

  // Récupérer tous les managers d'un restaurant
  async getManagersByRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;

      const [managers] = await db.query<UserRow[]>(
        `SELECT 
          u.id,
          u.name,
          u.email,
          u.created_at,
          u.updated_at,
          rm.restaurant_id,
          rm.restaurant_code,
          r.name as restaurant_name,
          u.is_active
         FROM users u
         JOIN restaurant_managers rm ON u.id = rm.user_id
         JOIN restaurants r ON rm.restaurant_id = r.id
         WHERE rm.restaurant_id = ?
         AND u.role = 'manager'`,
        [restaurantId]
      );

      res.json({
        success: true,
        data: managers
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des managers:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des managers'
      });
    }
  },

  // Mettre à jour un manager
  async updateManager(req: Request, res: Response): Promise<void> {
    try {
      const { managerId } = req.params;
      const { name, email, password, isActive, restaurantCode } = req.body;

      let updateQuery = 'UPDATE users SET';
      const values = [];

      if (name) {
        updateQuery += ' name = ?,';
        values.push(name);
      }

      if (email) {
        updateQuery += ' email = ?,';
        values.push(email);
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateQuery += ' password = ?,';
        values.push(hashedPassword);
      }

      if (typeof isActive === 'boolean') {
        updateQuery += ' is_active = ?,';
        values.push(isActive);
      }

      // Supprimer la dernière virgule
      updateQuery = updateQuery.slice(0, -1);
      updateQuery += ' WHERE id = ?';
      values.push(managerId);

      const [result] = await db.execute<ResultSetHeader>(updateQuery, values);

      if (restaurantCode) {
        await db.execute(
          'UPDATE restaurant_managers SET restaurant_code = ? WHERE user_id = ?',
          [restaurantCode, managerId]
        );
      }

      // Récupérer l'utilisateur mis à jour
      const [updatedUsers] = await db.query<UserRow[]>(
        'SELECT * FROM users WHERE id = ?',
        [managerId]
      );

      res.json({
        success: true,
        data: updatedUsers[0]
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du manager:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour du manager'
      });
    }
  },

  // Désactiver un manager
  async deactivateManager(req: Request, res: Response): Promise<void> {
    try {
      const { managerId } = req.params;

      await db.execute(
        'UPDATE users SET is_active = false WHERE id = ?',
        [managerId]
      );

      res.json({
        success: true,
        message: 'Manager désactivé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la désactivation du manager:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la désactivation du manager'
      });
    }
  },

  // Générer un nouveau code restaurant
  async generateRestaurantCode(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const newCode = await generateRestaurantCode();

      res.json({
        success: true,
        code: newCode
      });
    } catch (error) {
      console.error('Erreur lors de la génération du code:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération du code'
      });
    }
  },

  // Valider un code restaurant
  async validateRestaurantCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;

      const [managers] = await db.query<RestaurantManagerRow[]>(
        'SELECT * FROM restaurant_managers WHERE restaurant_code = ?',
        [code]
      );

      res.json({
        success: true,
        isValid: managers.length > 0
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