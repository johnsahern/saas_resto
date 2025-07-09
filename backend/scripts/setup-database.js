#!/usr/bin/env node

/**
 * Script de configuration de la base de données MySQL
 * Compatible avec XAMPP et Hostinger
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const databaseName = process.env.DB_NAME || 'restaurant_saas';

console.log('='.repeat(60));
console.log('🔧 CONFIGURATION DE LA BASE DE DONNÉES RESTAURANT SAAS');
console.log('='.repeat(60));

async function setupDatabase() {
  let connection;
  
  try {
    console.log('📍 Connexion à MySQL...');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   User: ${config.user}`);
    
    // Connexion sans spécifier la base de données
    connection = await mysql.createConnection(config);
    console.log('✅ Connexion MySQL établie');
    
    // Lire le script SQL
    const schemaPath = path.join(process.cwd(), '..', 'database', 'schema.sql');
    console.log(`📄 Lecture du schéma: ${schemaPath}`);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Fichier schema.sql non trouvé: ${schemaPath}`);
    }
    
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schéma SQL chargé');
    
    // Remplacer le nom de la base de données dans le script si nécessaire
    const modifiedScript = sqlScript.replace(/restaurant_saas/g, databaseName);
    
    console.log('🔄 Exécution du script SQL...');
    await connection.query(modifiedScript);
    console.log('✅ Base de données créée et configurée');
    
    // Vérifier la création des tables
    await connection.query(`USE ${databaseName}`);
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log(`📊 ${tables.length} tables créées:`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    console.log('='.repeat(60));
    console.log('🎉 CONFIGURATION TERMINÉE AVEC SUCCÈS!');
    console.log('🚀 PRÊT POUR LA PRODUCTION!');
    console.log('='.repeat(60));
    console.log('📝 Prochaines étapes:');
    console.log('   1. Copiez .env.example vers .env');
    console.log('   2. Modifiez les paramètres dans .env selon votre configuration');
    console.log('   3. Lancez le serveur: npm run dev');
    console.log('   4. Utilisez /saas-registration pour créer vos restaurants');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Suggestions pour résoudre l\'erreur de connexion:');
      console.log('   • Vérifiez que MySQL est démarré (XAMPP Control Panel)');
      console.log('   • Vérifiez les paramètres de connexion dans .env');
      console.log('   • Pour XAMPP: MySQL doit être en état "Running"');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}



// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
