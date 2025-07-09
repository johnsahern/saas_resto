import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de base
app.use(cors());
app.use(express.json());

// Route de test
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur backend fonctionnel',
    timestamp: new Date().toISOString()
  });
});

// Route de test API
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API backend test réussie',
    version: '1.0.0'
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: err.message 
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`🔍 Test: curl http://localhost:${PORT}/health`);
}); 