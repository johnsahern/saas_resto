import { Request, Response, NextFunction } from 'express';
import { BOTPRESS_TOKEN } from '../config';

/**
 * Middleware pour vérifier l'authentification via le token Botpress
 */
export const verifyBotpressToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-botpress-token'];
  
  if (!token || token !== BOTPRESS_TOKEN) {
    return res.status(401).json({ 
      success: false,
      error: 'Accès non autorisé',
      message: 'Token Botpress invalide ou manquant'
    });
  }
  
  next();
};
