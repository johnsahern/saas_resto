import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Chargement des variables d'environnement
dotenv.config();

// Configuration MySQL
export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'saas_resto',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configuration du token Botpress
export const BOTPRESS_TOKEN = process.env.BOTPRESS_TOKEN || "";
if (!BOTPRESS_TOKEN) {
  console.warn("⚠️ BOTPRESS_TOKEN n'est pas défini. La sécurité du webhook peut être compromise.");
}
