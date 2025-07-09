import { Router } from 'express';
import { executeQuery, executeTransaction } from '../config/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Route pour obtenir les managers d'un restaurant (propriétaire seulement)
router.get('/restaurant/:restaurantId', authenticate, requireRole(['owner']), async (req: any, res: any) => {
  try {
    const { restaurantId } = req.params;
    
    // Vérifier que l'utilisateur est propriétaire de ce restaurant
    const ownerCheck = await executeQuery(
      'SELECT * FROM restaurant_users WHERE user_id = ? AND restaurant_id = ? AND role = "owner"',
      [req.user.id, restaurantId]
    );

    if (ownerCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce restaurant'
      });
    }

    // Récupérer le code du restaurant
    const [restaurant] = await executeQuery('SELECT manager_code FROM restaurants WHERE id = ?', [restaurantId]);
    // Récupérer les managers
    const managers = await executeQuery(`
      SELECT 
        ru.id,
        su.email,
        su.first_name,
        su.last_name,
        su.phone,
        ru.is_active,
        ru.created_at
      FROM restaurant_users ru
      JOIN saas_users su ON ru.user_id = su.id
      WHERE ru.restaurant_id = ? AND ru.role = 'manager'
      ORDER BY su.first_name, su.last_name
    `, [restaurantId]);

    res.json({
      success: true,
      data: managers,
      manager_code: restaurant ? restaurant.manager_code : null
    });
  } catch (error) {
    console.error('Erreur récupération managers:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Route pour créer un nouveau manager (propriétaire seulement)
router.post('/', authenticate, requireRole(['owner']), async (req: any, res: any) => {
  try {
    const { email, firstName, lastName, phone, restaurantId } = req.body;

    // Validation des données
    if (!email || !firstName || !lastName || !restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Email, prénom, nom et restaurant sont obligatoires'
      });
    }

    // Vérifier que l'utilisateur est propriétaire de ce restaurant
    const ownerCheck = await executeQuery(
      'SELECT * FROM restaurant_users WHERE user_id = ? AND restaurant_id = ? AND role = "owner"',
      [req.user.id, restaurantId]
    );

    if (ownerCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce restaurant'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await executeQuery(
      'SELECT id FROM saas_users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Utiliser le mot de passe fourni par le frontend
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const userId = uuidv4();
    const restaurantUserId = uuidv4();

    const queries = [
      // Créer l'utilisateur
      {
        query: `INSERT INTO saas_users (id, email, password_hash, first_name, last_name, phone)
                VALUES (?, ?, ?, ?, ?, ?)`,
        params: [userId, email, hashedPassword, firstName, lastName, phone || null]
      },
      // Associer l'utilisateur au restaurant comme manager
      {
        query: `INSERT INTO restaurant_users (id, restaurant_id, user_id, role, is_active)
                VALUES (?, ?, ?, 'manager', true)`,
        params: [restaurantUserId, restaurantId, userId]
      }
    ];

    await executeTransaction(queries);

    // Récupérer le code du restaurant pour la réponse
    const [restaurant] = await executeQuery('SELECT manager_code FROM restaurants WHERE id = ?', [restaurantId]);

    // (Suppression de tempPassword et de son usage)

    res.status(201).json({
      success: true,
      data: {
        id: restaurantUserId,
        email,
        firstName,
        lastName,
        phone,
        manager_code: restaurant ? restaurant.manager_code : null
      },
      message: 'Manager créé avec succès'
    });

  } catch (error) {
    console.error('Erreur création manager:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Route pour supprimer un manager (propriétaire seulement)
router.delete('/:managerId', authenticate, requireRole(['owner']), async (req: any, res: any) => {
  try {
    const { managerId } = req.params;

    // Récupérer les infos du manager
    const manager = await executeQuery(
      'SELECT * FROM restaurant_users WHERE id = ? AND role = "manager"',
      [managerId]
    );

    if (manager.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Manager non trouvé'
      });
    }

    // Vérifier que l'utilisateur est propriétaire de ce restaurant
    const ownerCheck = await executeQuery(
      'SELECT * FROM restaurant_users WHERE user_id = ? AND restaurant_id = ? AND role = "owner"',
      [req.user.id, manager[0].restaurant_id]
    );

    if (ownerCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    // Supprimer l'association restaurant-utilisateur
    await executeQuery(
      'DELETE FROM restaurant_users WHERE id = ?',
      [managerId]
    );

    res.json({
      success: true,
      message: 'Manager supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression manager:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

export default router;
