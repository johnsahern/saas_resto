import { Request, Response, NextFunction } from 'express';

type UserRole = 'owner' | 'manager' | 'employee';

export const checkRole = (allowedRoles: UserRole[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Non authentifié'
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role as UserRole)) {
        res.status(403).json({
          success: false,
          error: 'Accès non autorisé'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Erreur de vérification des rôles:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la vérification des rôles'
      });
    }
  };
}; 