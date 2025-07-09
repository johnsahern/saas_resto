import mysql from 'mysql2/promise';

async function checkActiveOrdersTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'saas_resto'
  });

  try {
    console.log('=== VÉRIFICATION DE LA TABLE ACTIVE_ORDERS ===');

    // Vérifier si la table existe
    const [tables] = await connection.execute(
      'SHOW TABLES LIKE "active_orders"'
    );

    if (tables.length === 0) {
      console.log('❌ La table active_orders n\'existe pas');
      console.log('Création de la table...');

      await connection.execute(`
        CREATE TABLE active_orders (
          id VARCHAR(36) NOT NULL,
          restaurant_id VARCHAR(36) NOT NULL,
          order_number VARCHAR(255) NOT NULL,
          table_id VARCHAR(36),
          customer_name VARCHAR(255),
          items JSON NOT NULL,
          total_amount INT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      console.log('✅ Table active_orders créée avec succès');
    } else {
      console.log('✅ La table active_orders existe');
      
      // Vérifier la structure de la table
      const [columns] = await connection.execute(
        'SHOW COLUMNS FROM active_orders'
      );
      
      console.log('\nStructure actuelle de la table:');
      columns.forEach(col => {
        console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      });
    }

    // Vérifier les contraintes
    const [constraints] = await connection.execute(
      'SELECT * FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
      ['saas_resto', 'active_orders']
    );

    console.log('\nContraintes:');
    constraints.forEach(constraint => {
      console.log(`${constraint.CONSTRAINT_NAME}: ${constraint.CONSTRAINT_TYPE}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await connection.end();
  }
}

checkActiveOrdersTable().catch(console.error); 