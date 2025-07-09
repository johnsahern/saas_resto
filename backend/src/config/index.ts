import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

export const config = {
  // Environnement
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  // Base de données MySQL
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'saas_resto'
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // Bcrypt
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
  },
  
  // CORS
  cors: {
    // En production, configure FRONTEND_URL dans .env (ex: https://monresto.emergyne.com)
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true
  },
  
  // Upload de fichiers
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10) // 100 requests
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log'
  }
};

// Validation de la configuration
export const validateConfig = (): void => {
  const required = [
    'DB_HOST',
    'DB_USER', 
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Variables d\'environnement manquantes:', missing);
    if (config.env === 'production') {
      throw new Error(`Variables d'environnement requises manquantes: ${missing.join(', ')}`);
    } else {
      console.warn('⚠️  Mode développement: utilisation des valeurs par défaut');
    }
  }
};

export default config;
