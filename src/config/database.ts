import mysql, { PoolOptions, Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

const config: PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'saas_resto',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Créer un pool de connexions
const pool: Pool = mysql.createPool(config);

// Fonction pour exécuter des requêtes
export const db = {
  query: async <T extends RowDataPacket[]>(sql: string, params?: any[]): Promise<[T, any]> => {
    return await pool.query<T>(sql, params);
  },
  execute: async <T extends ResultSetHeader>(sql: string, params?: any[]): Promise<[T, any]> => {
    return await pool.execute<T>(sql, params);
  },
  getConnection: async () => {
    return await pool.getConnection();
  }
}; 