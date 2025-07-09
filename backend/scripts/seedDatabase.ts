import { db } from '../src/config/database';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

async function seedDatabase() {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Créer un propriétaire
    const hashedPassword = await bcrypt.hash('password123', 10);
    const { rows: [owner] } = await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['John Doe', 'owner@example.com', hashedPassword, 'owner']
    );

    // Créer des restaurants
    const restaurants = [
      {
        name: 'Le Bistrot Parisien',
        slug: 'bistrot-parisien',
        description: 'Restaurant français traditionnel',
        address: '123 Rue de Paris, 75001 Paris',
        phone: '+33123456789',
        email: 'contact@bistrotparisien.com'
      },
      {
        name: 'La Trattoria',
        slug: 'trattoria',
        description: 'Restaurant italien authentique',
        address: '456 Avenue de l\'Italie, 75013 Paris',
        phone: '+33198765432',
        email: 'contact@latrattoria.com'
      }
    ];

    for (const restaurant of restaurants) {
      const { rows: [restaurantRow] } = await client.query(
        `INSERT INTO restaurants (
          name, slug, description, address, phone, email, owner_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [
          restaurant.name,
          restaurant.slug,
          restaurant.description,
          restaurant.address,
          restaurant.phone,
          restaurant.email,
          owner.id
        ]
      );

      // Créer un manager pour chaque restaurant
      const managerPassword = await bcrypt.hash('manager123', 10);
      const { rows: [manager] } = await client.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          `Manager ${restaurant.name}`,
          `manager@${restaurant.slug}.com`,
          managerPassword,
          'manager'
        ]
      );

      // Associer le manager au restaurant
      await client.query(
        `INSERT INTO restaurant_managers (
          user_id, restaurant_id, restaurant_code
        )
        VALUES ($1, $2, $3)`,
        [
          manager.id,
          restaurantRow.id,
          nanoid(10).toUpperCase()
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Base de données initialisée avec succès');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exécuter le script
seedDatabase().catch(console.error); 