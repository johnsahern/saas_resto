import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeTransaction } from '../config/database.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.js';
import { config } from '../config/index.js';
import { 
  SaasUser, 
  Restaurant, 
  RestaurantUser, 
  LoginRequest, 
  RegisterRestaurantRequest,
  ApiResponse,
  AuthResponse 
} from '../types/index.js';

// =======================================================================
// CONNEXION UTILISATEUR
// =======================================================================

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== CONNEXION ===');
    console.log('Body:', req.body);
    
    const { email, password, restaurant_slug, manager_code } = req.body;

    // Vérifier l'utilisateur
    const users = await executeQuery<SaasUser>(
      'SELECT * FROM saas_users WHERE email = ?',
      [email]
    );
    console.log('Utilisateur trouvé:', users.length > 0);

    if (users.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
      return;
    }

    const user = users[0];
    console.log('Informations utilisateur:', {
      id: user.id,
      email: user.email,
      is_super_admin: user.is_super_admin
    });

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('Mot de passe valide:', isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
      return;
    }

    // === Connexion manager par code ===
    if (manager_code) {
      // Chercher le restaurant par code
      const restaurants = await executeQuery(
        'SELECT * FROM restaurants WHERE manager_code = ?',
        [manager_code]
      );
      if (restaurants.length === 0) {
        res.status(404).json({ success: false, error: 'Code restaurant invalide' });
        return;
      }
      const restaurant = restaurants[0];
      // Vérifier que l'utilisateur est bien manager de ce restaurant
      const restaurantUsers = await executeQuery<RestaurantUser>(
        'SELECT * FROM restaurant_users WHERE user_id = ? AND restaurant_id = ? AND role = "manager" AND is_active = true',
        [user.id, restaurant.id]
      );
      if (restaurantUsers.length === 0) {
        res.status(403).json({ success: false, error: 'Accès non autorisé à ce restaurant' });
        return;
      }
      const restaurantUser = restaurantUsers[0];
      // Générer les tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        is_super_admin: user.is_super_admin,
        restaurant_id: restaurant.id,
        role: restaurantUser.role
      };
      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);
      res.json({
        success: true,
        data: {
          token,
          refresh_token: refreshToken,
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: null
          },
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            role: restaurantUser.role
          }
        }
      });
      return;
    }

    // Récupérer tous les restaurants de l'utilisateur
    const userRestaurants = await executeQuery(
      `SELECT r.*, ru.role, ru.is_active
       FROM restaurants r
       JOIN restaurant_users ru ON r.id = ru.restaurant_id
       WHERE ru.user_id = ? AND ru.is_active = true
       ORDER BY r.name`,
      [user.id]
    );
    console.log('Restaurants utilisateur:', userRestaurants.length);

    let restaurant = null;
    let restaurantUser = null;

    if (restaurant_slug) {
      // Si un slug spécifique est fourni
      console.log('Vérification accès restaurant:', restaurant_slug);
      
      const restaurants = await executeQuery(
        'SELECT * FROM restaurants WHERE slug = ?',
        [restaurant_slug]
      );

      if (restaurants.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Restaurant non trouvé'
        });
        return;
      }

      restaurant = restaurants[0];

      // Vérifier l'association utilisateur-restaurant
      const restaurantUsers = await executeQuery<RestaurantUser>(
        'SELECT * FROM restaurant_users WHERE user_id = ? AND restaurant_id = ? AND is_active = true',
        [user.id, restaurant.id]
      );

      if (restaurantUsers.length === 0) {
        res.status(403).json({
          success: false,
          error: 'Accès non autorisé à ce restaurant'
        });
        return;
      }

      restaurantUser = restaurantUsers[0];
    } else {
      // Aucun slug fourni - gestion automatique
      if (userRestaurants.length === 0) {
        res.status(403).json({
          success: false,
          error: 'Aucun restaurant associé à ce compte'
        });
        return;
      } else if (userRestaurants.length === 1) {
        // Un seul restaurant - sélection automatique
        restaurant = userRestaurants[0];
        restaurantUser = {
          role: restaurant.role,
          permissions: restaurant.permissions
        };
        console.log('Restaurant sélectionné automatiquement:', restaurant.name);
      } else {
        // Plusieurs restaurants - retourner la liste pour sélection
        const restaurantList = userRestaurants.map(r => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          role: r.role
        }));

        res.json({
          success: true,
          requiresRestaurantSelection: true,
          restaurants: restaurantList,
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
          }
        });
        return;
      }
    }

    // Générer les tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      is_super_admin: user.is_super_admin,
      restaurant_id: restaurant?.id,
      role: restaurantUser?.role
    };
    console.log('Payload du token:', tokenPayload);

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    console.log('Tokens générés:', {
      token: token ? 'Présent' : 'Absent',
      refreshToken: refreshToken ? 'Présent' : 'Absent'
    });

    // Préparer la réponse
    const response = {
      success: true,
      data: {
        token,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: null
        },
        restaurant: restaurant ? {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          role: restaurantUser?.role
        } : null
      }
    };
    console.log('Réponse:', response);

    res.json(response);
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// =======================================================================
// INSCRIPTION D'UN NOUVEAU RESTAURANT (SaaS)
// =======================================================================

export const registerRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      restaurant_name, 
      restaurant_address, 
      restaurant_phone, 
      restaurant_email, 
      owner_first_name, 
      owner_last_name, 
      owner_email, 
      password 
    }: RegisterRestaurantRequest = req.body;

    // Validation des données
    if (!restaurant_name || !restaurant_email || !owner_email || !password || !owner_first_name || !owner_last_name) {
      res.status(400).json({
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis'
      } as ApiResponse);
      return;
    }

    // Générer un slug à partir du nom du restaurant
    const slug = restaurant_name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Vérifier si le slug ou l'email restaurant existe déjà
    const existingRestaurant = await executeQuery(
      'SELECT id FROM restaurants WHERE slug = ? OR email = ?',
      [slug, restaurant_email]
    );

    if (existingRestaurant.length > 0) {
      res.status(409).json({
        success: false,
        error: 'Ce nom de restaurant ou email existe déjà'
      } as ApiResponse);
      return;
    }

    // Vérifier si l'email utilisateur existe déjà
    const existingUser = await executeQuery(
      'SELECT id FROM saas_users WHERE email = ?',
      [owner_email]
    );

    if (existingUser.length > 0) {
      res.status(409).json({
        success: false,
        error: 'Cet email utilisateur existe déjà'
      } as ApiResponse);
      return;
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

    // Générer un code manager unique (5 chiffres)
    async function generateUniqueManagerCode() {
      let code;
      let exists = true;
      while (exists) {
        code = Math.floor(10000 + Math.random() * 90000).toString();
        const rows = await executeQuery('SELECT id FROM restaurants WHERE manager_code = ?', [code]);
        exists = rows.length > 0;
      }
      return code;
    }

    const managerCode = await generateUniqueManagerCode();

    // Transaction pour créer le restaurant et l'utilisateur
    const restaurantId = uuidv4();
    const userId = uuidv4();

    const queries = [
      // Créer le restaurant
      {
        query: `INSERT INTO restaurants (id, name, slug, manager_code, address, phone, email, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        params: [
          restaurantId,
          restaurant_name,
          slug,
          managerCode,
          restaurant_address || null,
          restaurant_phone || null,
          restaurant_email
        ]
      },
      // Créer l'utilisateur
      {
        query: `INSERT INTO saas_users (id, email, password_hash, first_name, last_name, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        params: [
          userId,
          owner_email,
          hashedPassword,
          owner_first_name,
          owner_last_name
        ]
      },
      // Associer l'utilisateur au restaurant comme propriétaire
      {
        query: `INSERT INTO restaurant_users (id, user_id, restaurant_id, role, is_active, created_at, updated_at)
                VALUES (?, ?, ?, 'owner', true, NOW(), NOW())`,
        params: [uuidv4(), userId, restaurantId]
      },
      // Créer les paramètres par défaut du restaurant
      {
        query: `INSERT INTO restaurant_settings (id, restaurant_id, currency, tax_rate, created_at, updated_at)
                VALUES (?, ?, 'XOF', 20.00, NOW(), NOW())`,
        params: [uuidv4(), restaurantId]
      }
    ];

    await executeTransaction(queries);

    // Générer un token pour l'utilisateur nouvellement créé
    const tokenPayload = {
      userId,
      email: owner_email,
      restaurant_id: restaurantId,
      role: 'owner'
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const response: AuthResponse = {
      token,
      refresh_token: refreshToken,
      user: {
        id: userId,
        email: owner_email,
        first_name: owner_first_name,
        last_name: owner_last_name
      },
      restaurant: {
        id: restaurantId,
        name: restaurant_name,
        slug: slug,
        role: 'owner'
      }
    };

    res.status(201).json({
      success: true,
      data: response,
      message: 'Restaurant créé avec succès!'
    } as ApiResponse<AuthResponse>);

  } catch (error) {
    console.error('Erreur d\'inscription restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    } as ApiResponse);
  }
};

// =======================================================================
// OBTENIR LES RESTAURANTS D'UN UTILISATEUR
// =======================================================================

export const getUserRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId || (req as any).user?.id;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      } as ApiResponse);
      return;
    }

    const restaurants = await executeQuery(
      `SELECT r.*, ru.role, ru.permissions, ru.is_active
       FROM restaurants r
       JOIN restaurant_users ru ON r.id = ru.restaurant_id
       WHERE ru.user_id = ? AND ru.is_active = true
       ORDER BY r.name`,
      [userId]
    );

    res.json({
      success: true,
      data: restaurants,
      message: 'Restaurants récupérés avec succès'
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur récupération restaurants:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    } as ApiResponse);
  }
};

// =======================================================================
// RAFRAÎCHIR LE TOKEN
// =======================================================================

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        success: false,
        error: 'Refresh token requis'
      } as ApiResponse);
      return;
    }

    // Vérifier le refresh token
    const decoded = jwt.verify(refresh_token, config.jwt.secret) as any;
    
    // Récupérer l'utilisateur
    const users = await executeQuery<SaasUser>(
      'SELECT * FROM saas_users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      } as ApiResponse);
      return;
    }

    const user = users[0];

    // Générer un nouveau token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      is_super_admin: user.is_super_admin
    };

    const newToken = generateToken(tokenPayload);

    res.json({
      success: true,
      data: { token: newToken },
      message: 'Token rafraîchi avec succès'
    } as ApiResponse);

  } catch (error) {
    console.error('Erreur refresh token:', error);
    res.status(401).json({
      success: false,
      error: 'Refresh token invalide'
    } as ApiResponse);
  }
};

// =======================================================================
// DÉCONNEXION
// =======================================================================

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== VÉRIFICATION TOKEN ===');
    
    // Si on arrive ici, c'est que le middleware authenticate a validé le token
    const user = req.user;
    console.log('Utilisateur du token:', user);

    if (!user) {
      console.log('❌ Utilisateur non trouvé dans la requête');
      res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
      return;
    }

    // Vérifier que l'utilisateur existe toujours
    const users = await executeQuery<SaasUser>(
      'SELECT * FROM saas_users WHERE id = ?',
      [user.userId]
    );

    if (users.length === 0) {
      console.log('❌ Utilisateur non trouvé');
      res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    // Vérifier l'accès au restaurant si un ID est présent
    if (user.restaurant_id) {
      const restaurantUsers = await executeQuery<RestaurantUser>(
        'SELECT * FROM restaurant_users WHERE user_id = ? AND restaurant_id = ? AND is_active = true',
        [user.userId, user.restaurant_id]
      );

      if (restaurantUsers.length === 0) {
        console.log('❌ Accès restaurant non autorisé');
        res.status(401).json({
          success: false,
          error: 'Accès restaurant non autorisé'
        });
        return;
      }
    }

    console.log('✅ Token valide');
    res.json({
      success: true,
      message: 'Token valide'
    });
  } catch (error) {
    console.error('❌ Erreur vérification token:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

export const deliveryLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, name } = req.body;
    if (!phone || !name) {
      res.status(400).json({ success: false, error: 'Champs requis manquants.' });
      return;
    }

    // Recherche du livreur par téléphone
    const results = await executeQuery(
      `SELECT * FROM delivery_persons WHERE phone = ?`,
      [phone]
    );
    if (results.length === 0) {
      res.status(401).json({ success: false, error: 'Livreur non trouvé.' });
      return;
    }
    // Si plusieurs résultats, filtrer par nom
    const deliveryPerson = results.find((p: any) =>
      (p.name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim()).toLowerCase() === name.toLowerCase()
    );
    if (!deliveryPerson) {
      res.status(401).json({ success: false, error: 'Nom incorrect.' });
      return;
    }

    // Générer le token JWT
    const tokenPayload = {
      delivery_person_id: deliveryPerson.id,
      restaurant_id: deliveryPerson.restaurant_id,
      role: 'delivery'
    };
    const token = generateToken(tokenPayload);

    res.json({
      success: true,
      token,
      delivery_person: {
        id: deliveryPerson.id,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        restaurant_id: deliveryPerson.restaurant_id,
        available: deliveryPerson.available, // ou status si c'est le champ booléen
      }
    });
  } catch (error) {
    console.error('Erreur deliveryLogin:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur.' });
  }
};

export default {
  login,
  registerRestaurant,
  getUserRestaurants,
  refreshToken,
  logout,
  verifyToken,
  deliveryLogin
};
