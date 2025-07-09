import mysql from 'mysql2/promise';
import { config } from './index.js';

// Configuration de la connexion MySQL
const dbConfig = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  charset: 'utf8mb4',
  connectionLimit: 10,
  multipleStatements: true,
  ...(config.env === 'production' && {
    ssl: {
      rejectUnauthorized: false
    }
  })
};

// Pool de connexions
let pool: mysql.Pool;

export const initDatabase = async (): Promise<mysql.Pool> => {
  try {
    console.log('🔌 Connexion à MySQL...');
    console.log('Configuration:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    pool = mysql.createPool(dbConfig);
    
    const connection = await pool.getConnection();
    console.log('✅ Base de données MySQL connectée avec succès');
    connection.release();
    
    return pool;
  } catch (error) {
    console.error('❌ Erreur de connexion à MySQL:', error);
    throw error;
  }
};

export const getDatabase = (): mysql.Pool => {
  if (!pool) {
    throw new Error('Base de données non initialisée');
  }
  return pool;
};

export const executeQuery = async <T = any>(
  query: string, 
  params: any[] = []
): Promise<T[]> => {
  const db = getDatabase();
  
  console.log('=== EXÉCUTION REQUÊTE SQL ===');
  console.log('Query:', query);
  console.log('Params:', params);
  console.log('Types des paramètres:', params.map(p => typeof p));
  
  try {
    const [rows] = await db.execute(query, params);
    console.log('✅ Requête exécutée avec succès');
    console.log('Résultat:', rows);
    return rows as T[];
  } catch (error: any) {
    console.error('❌ Erreur SQL:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      sql: error.sql,
      stack: error.stack
    });
    throw error;
  }
};

export const executeTransaction = async (
  queries: { query: string; params: any[] }[]
): Promise<any[]> => {
  const db = getDatabase();
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    console.log('=== DÉBUT TRANSACTION ===');
    
    const results = [];
    for (const { query, params } of queries) {
      try {
        console.log('Exécution requête:', {
          query,
          params,
          paramTypes: params.map(p => typeof p)
        });
        const [result] = await connection.execute(query, params);
        results.push(result);
        console.log('Requête réussie:', {
          result,
          affectedRows: (result as any).affectedRows,
          insertId: (result as any).insertId
        });
      } catch (queryError: any) {
        console.error('Erreur requête:', {
          error: queryError,
          message: queryError.message,
          code: queryError.code,
          sqlMessage: queryError.sqlMessage,
          sqlState: queryError.sqlState,
          sql: queryError.sql,
          stack: queryError.stack,
          query,
          params,
          paramTypes: params.map(p => typeof p)
        });
        throw queryError;
      }
    }
    
    await connection.commit();
    console.log('=== TRANSACTION RÉUSSIE ===');
    return results;
  } catch (error: any) {
    console.error('=== ERREUR TRANSACTION ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.code && error.sqlMessage) {
      console.error('Erreur MySQL:', {
        code: error.code,
        message: error.sqlMessage,
        state: error.sqlState,
        query: error.sql,
        stack: error.stack
      });
    }
    
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getRestaurantIdFromContext = (req: any): string => {
  return req.user?.restaurant_id || req.headers['x-restaurant-id'];
};
