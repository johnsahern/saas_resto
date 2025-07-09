import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import webhookRoutes from './routes/webhookRoutes';

// Chargement des variables d'environnement
dotenv.config();

// Configuration de base
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de base
app.use(helmet()); // Sécurité
// CORS sécurisé pour la production
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // En prod, configure FRONTEND_URL dans .env
}));
app.use(bodyParser.json()); // Parsing du JSON

// Middleware de journalisation
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/webhook', webhookRoutes);

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bienvenue sur l\'API Webhook de RestauManager',
    documentation: 'Pour plus d\'informations, consultez la documentation',
    endpoints: {
      health: '/api/webhook/health',
      takeawayOrders: '/api/webhook/takeaway-orders',
      deliveryOrders: '/api/webhook/delivery-orders',
      reservations: '/api/webhook/reservations'
    }
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'La ressource demandée n\'existe pas'
  });
});

// Démarrage du serveur
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur webhook démarré sur le port ${PORT}`);
    console.log(`📝 Endpoint de santé: http://localhost:${PORT}/api/webhook/health`);
  });
};

// Export pour une utilisation potentielle dans un environnement serverless
export { app, startServer };

// Démarrage direct si le fichier est exécuté directement
if (require.main === module) {
  startServer();
}
