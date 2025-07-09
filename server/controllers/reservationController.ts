import { Request, Response } from 'express';
import { mysqlPool } from '../config';
import { RowDataPacket } from 'mysql2';

/**
 * Contrôleur pour les réservations
 */
export const createReservation = async (req: Request, res: Response) => {
  const connection = await mysqlPool.getConnection();
  try {
    const { restaurant_id, Nom_Prenom, Numero_whatsapp, Date_Reservation, Heure_Reservation, Nombre_Personnes, Notes, Heure_Soumission } = req.body;
    
    // Validation des données
    if (!restaurant_id || !Nom_Prenom || !Numero_whatsapp || !Date_Reservation || !Heure_Reservation || !Nombre_Personnes) {
      return res.status(400).json({ 
        success: false,
        error: 'Données incomplètes',
        message: 'Le restaurant_id ou les informations de réservation sont incomplètes'
      });
    }
    
    // Générer un id unique (UUID v4)
    const [reservationIdRows] = await connection.query<RowDataPacket[]>("SELECT UUID() AS id");
    const reservationId = (reservationIdRows as RowDataPacket[])[0].id;
    
    // Conversion de la date au format MySQL
    const createdAt = Heure_Soumission
      ? new Date(Heure_Soumission).toISOString().slice(0, 19).replace('T', ' ')
      : new Date().toISOString().slice(0, 19).replace('T', ' ');

    await connection.query(
      `INSERT INTO reservations (id, restaurant_id, customer_name, customer_phone, date, time, party_size, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reservationId, restaurant_id, Nom_Prenom, Numero_whatsapp, Date_Reservation, Heure_Reservation, parseInt(Nombre_Personnes), 'confirmed', Notes || '', createdAt]
    );
    
    // Fidélité client
    const [loyaltyRows] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM loyalty_customers WHERE phone = ? AND restaurant_id = ? LIMIT 1`,
      [Numero_whatsapp, restaurant_id]
    );
    if ((loyaltyRows as RowDataPacket[]).length === 0) {
      await connection.query(
        `INSERT INTO loyalty_customers (id, restaurant_id, name, phone, points, total_spent, last_visit, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())`,
        [restaurant_id, Nom_Prenom, Numero_whatsapp, 5, 0]
      );
    } else {
      const client = (loyaltyRows as RowDataPacket[])[0];
      await connection.query(
        `UPDATE loyalty_customers SET points = ?, last_visit = NOW() WHERE id = ?`,
        [client.points + 5, client.id]
      );
    }
    
    // Réponse de succès
    res.status(201).json({ 
      success: true, 
      message: 'Réservation créée avec succès',
      reservationId,
      customerName: Nom_Prenom,
      date: Date_Reservation,
      time: Heure_Reservation,
      partySize: parseInt(Nombre_Personnes)
    });
    
  } catch (error: any) {
    console.error('Erreur lors du traitement de la réservation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors du traitement de la réservation'
    });
  } finally {
    connection.release();
  }
};