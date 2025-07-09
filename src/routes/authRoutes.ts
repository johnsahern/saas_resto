import express from 'express';
import { authService } from '@/services/authService';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password, restaurantCode } = req.body;
    const result = await authService.login(email, password, restaurantCode);
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la connexion'
    });
  }
});

export { router }; 