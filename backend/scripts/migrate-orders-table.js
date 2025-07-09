import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'saas_resto',
  multipleStatements: true
};

const migrations = [
  // Ajout des colonnes
  `ALTER TABLE orders
   ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'dine-in' AFTER status,
   ADD COLUMN IF NOT EXISTS notes TEXT AFTER type,
   ADD COLUMN IF NOT EXISTS created_by VARCHAR(36) AFTER notes,
   ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
   ADD COLUMN IF NOT EXISTS table_id VARCHAR(36) AFTER restaurant_id;`,

  // Ajout de la clé étrangère
  `ALTER TABLE orders
   ADD CONSTRAINT fk_orders_table 
   FOREIGN KEY (table_id) 
   REFERENCES restaurant_tables(id) 
   ON DELETE SET NULL;`
];

async function runMigration() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔄 Exécution de la migration...');
    
    for (const migration of migrations) {
      try {
        await connection.query(migration);
        console.log('✅ Migration réussie:', migration.split('\n')[0]);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('ℹ️ La contrainte existe déjà');
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ Migration terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error); 