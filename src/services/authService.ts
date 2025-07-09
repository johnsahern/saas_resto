import { db } from '@/config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Restaurant, RestaurantManager, QueryResult, JWTPayload } from '@/types/mysql';

interface RestaurantResponse {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      is_super_admin: boolean;
    };
    token: string;
    restaurant?: RestaurantResponse;
  };
  requiresRestaurantSelection?: boolean;
  restaurants?: RestaurantResponse[];
  error?: string;
}

export const authService = {
  async login(email: string, password: string, restaurantCode?: string): Promise<LoginResponse> {
    try {
      // Vérifier les informations de l'utilisateur
      const result = await db.query<User[]>(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      const userRows = result[0];

      if (userRows.length === 0) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect'
        };
      }

      const user = userRows[0];

      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Email ou mot de passe incorrect'
        };
      }

      // Gérer la connexion en fonction du rôle
      if (user.role === 'owner') {
        // Pour un propriétaire, récupérer tous ses restaurants
        const restaurantResult = await db.query<Restaurant[]>(
          `SELECT r.id, r.name, r.slug, 'owner' as role
           FROM restaurants r
           WHERE r.owner_id = $1 AND r.is_active = true`,
          [user.id]
        );

        const restaurantRows = restaurantResult[0];
        const restaurants: RestaurantResponse[] = restaurantRows.map(r => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          role: 'owner'
        }));

        // Si un code de restaurant est fourni, vérifier et connecter directement
        if (restaurantCode) {
          const restaurant = restaurants.find(r => r.slug === restaurantCode);
          if (!restaurant) {
            return {
              success: false,
              error: 'Restaurant non trouvé'
            };
          }

          const payload: JWTPayload = {
            userId: user.id,
            role: user.role,
            restaurantId: restaurant.id
          };

          const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'votre_secret_jwt',
            { expiresIn: '24h' }
          );

          return {
            success: true,
            data: {
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_super_admin: user.is_super_admin
              },
              token,
              restaurant
            }
          };
        }

        // Si plusieurs restaurants et pas de code fourni, demander la sélection
        if (restaurants.length > 1) {
          return {
            success: true,
            requiresRestaurantSelection: true,
            restaurants
          };
        }

        // Si un seul restaurant, connecter directement
        if (restaurants.length === 1) {
          const payload: JWTPayload = {
            userId: user.id,
            role: user.role,
            restaurantId: restaurants[0].id
          };

          const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'votre_secret_jwt',
            { expiresIn: '24h' }
          );

          return {
            success: true,
            data: {
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_super_admin: user.is_super_admin
              },
              token,
              restaurant: restaurants[0]
            }
          };
        }

        return {
          success: false,
          error: 'Aucun restaurant trouvé'
        };
      }

      // Pour un manager, vérifier le code du restaurant
      if (user.role === 'manager') {
        if (!restaurantCode) {
          return {
            success: false,
            error: 'Code restaurant requis'
          };
        }

        const managerResult = await db.query<RestaurantManager[]>(
          `SELECT rm.*, r.name, r.slug
           FROM restaurant_managers rm
           JOIN restaurants r ON rm.restaurant_id = r.id
           WHERE rm.user_id = $1 
           AND rm.restaurant_code = $2
           AND rm.is_active = true
           AND r.is_active = true`,
          [user.id, restaurantCode]
        );

        const managerRows = managerResult[0];

        if (managerRows.length === 0) {
          return {
            success: false,
            error: 'Code restaurant invalide'
          };
        }

        const restaurant: RestaurantResponse = {
          id: managerRows[0].restaurant_id,
          name: managerRows[0].name || '',
          slug: managerRows[0].slug || '',
          role: 'manager'
        };

        const payload: JWTPayload = {
          userId: user.id,
          role: user.role,
          restaurantId: restaurant.id
        };

        const token = jwt.sign(
          payload,
          process.env.JWT_SECRET || 'votre_secret_jwt',
          { expiresIn: '24h' }
        );

        return {
          success: true,
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              is_super_admin: user.is_super_admin
            },
            token,
            restaurant
          }
        };
      }

      return {
        success: false,
        error: 'Type d\'utilisateur non supporté'
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de la connexion'
      };
    }
  }
}; 