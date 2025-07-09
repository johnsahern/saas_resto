import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Obtenir le chemin du répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'saas_resto',
  port: parseInt(process.env.DB_PORT || '3306'),
  multipleStatements: true
};

async function runMigrations() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Créer la table des migrations si elle n'existe pas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Lire tous les fichiers de migration
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Exécuter chaque migration
    for (const file of migrationFiles) {
      const migrationName = path.basename(file);

      // Vérifier si la migration a déjà été exécutée
      const [rows] = await connection.execute(
        'SELECT id FROM migrations WHERE name = ?',
        [migrationName]
      );

      if ((rows as any[]).length === 0) {
        console.log(`Exécution de la migration: ${migrationName}`);

        // Lire et exécuter le fichier SQL
        const sql = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf8'
        );

        // Séparer les instructions SQL par DELIMITER
        const statements = sql.split('DELIMITER');
        
        for (let i = 0; i < statements.length; i++) {
          const stmt = statements[i].trim();
          if (!stmt) continue;

          if (i === 0) {
            // Premier bloc (sans DELIMITER)
            const queries = stmt
              .split(';')
              .filter(s => s.trim())
              .map(s => s.trim());

            // Exécuter d'abord les instructions CREATE TABLE
            for (const query of queries) {
              if (query.toUpperCase().startsWith('CREATE TABLE')) {
                await connection.query(query);
              }
            }

            // Puis exécuter les autres instructions
            for (const query of queries) {
              if (!query.toUpperCase().startsWith('CREATE TABLE')) {
                await connection.query(query);
              }
            }
          } else {
            // Blocs avec DELIMITER
            const delimiterMatch = stmt.match(/^\/\/([\s\S]*?)\/\//);
            if (delimiterMatch) {
              await connection.query(delimiterMatch[1]);
            }
          }
        }

        await connection.execute(
          'INSERT INTO migrations (name) VALUES (?)',
          [migrationName]
        );
        console.log(`Migration ${migrationName} exécutée avec succès`);
      } else {
        console.log(`Migration ${migrationName} déjà exécutée`);
      }
    }

    // Créer le trigger pour mettre à jour le timestamp après les migrations
    console.log('Création du trigger update_restaurants_updated_at...');
    await connection.query(`
      DROP TRIGGER IF EXISTS update_restaurants_updated_at;
      CREATE TRIGGER update_restaurants_updated_at
      BEFORE UPDATE ON restaurants
      FOR EACH ROW
      SET NEW.updated_at = CURRENT_TIMESTAMP;
    `);

    console.log('Toutes les migrations ont été exécutées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'exécution des migrations:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Exécuter les migrations
runMigrations(); 