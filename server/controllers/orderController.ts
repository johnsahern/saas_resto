import { Request, Response } from 'express';
import { mysqlPool } from '../config';
import { RowDataPacket } from 'mysql2';

/**
 * Fonctions utilitaires pour traiter les commandes
 */

// Fonction pour extraire le prix des items formatés
const extractPriceFromFormattedItem = (item: string): number => {
  const priceMatch = item.match(/(\d+) FCFA/);
  return priceMatch ? parseInt(priceMatch[1]) : 0;
};

// Fonction pour extraire la quantité des items formatés
const extractQuantityFromFormattedItem = (item: string): number => {
  const qtyMatch = item.match(/\((\d+) x/);
  return qtyMatch ? parseInt(qtyMatch[1]) : 1;
};

// Fonction pour extraire le nom du plat/dessert
const extractNameFromFormattedItem = (item: string): string => {
  const nameMatch = item.match(/^(.*?)\s*\(/);
  return nameMatch ? nameMatch[1].trim() : item;
};

// Fonction pour convertir une heure "HH:MM" ou ISO en DATETIME MySQL
const convertTimeToISOString = (timeString: string): string | null => {
  if (!timeString || typeof timeString !== 'string') return null;
  // Si déjà au format ISO, on convertit au format MySQL
  if (timeString.includes('T')) {
    return new Date(timeString).toISOString().slice(0, 19).replace('T', ' ');
  }
  // Si format simple HH:MM, on convertit
  const timeMatch = timeString.match(/^\d{1,2}:\d{2}$/);
  if (timeMatch) {
    const today = new Date();
    const [h, m] = timeString.split(':');
    today.setHours(parseInt(h), parseInt(m), 0, 0);
    return today.toISOString().slice(0, 19).replace('T', ' ');
  }
  return null;
};

/**
 * Contrôleur pour les commandes à emporter
 */
export const createTakeawayOrder = async (req: Request, res: Response) => {
  const connection = await mysqlPool.getConnection();
  try {
    const { restaurant_id, Nom_Prenom, Numero_whatsapp, items, delivery_address, notes } = req.body;
    
    // Validation des données
    if (!restaurant_id || !Nom_Prenom || !items) {
      return res.status(400).json({ 
        success: false,
        error: 'Données incomplètes',
        message: 'Le restaurant_id, les informations client ou de commande sont manquantes'
      });
    }
    
    // Extraction des informations des items
    const platsItem = items.find((item: any) => item.name === 'Plats');
    const dessertsItem = items.find((item: any) => item.name === 'Desserts');
    const heureRecupItem = items.find((item: any) => item.name === 'Heure de récupération');
    const heureSoumissionItem = items.find((item: any) => item.name === 'Heure de soumission');
    
    // Calcul du montant total
    let totalAmount = 0;
    let orderItems: any[] = [];
    
    // Traitement des plats
    if (platsItem && platsItem.detail) {
      const platsList = platsItem.detail.split(', ');
      for (const plat of platsList) {
        if (!plat.trim()) continue;
        
        const name = extractNameFromFormattedItem(plat);
        const quantity = extractQuantityFromFormattedItem(plat);
        // Le prix extrait est déjà le prix unitaire, pas besoin de division
        const unitPrice = extractPriceFromFormattedItem(plat);
        
        totalAmount += unitPrice * quantity;
        
        orderItems.push({
          name,
          quantity,
          price: unitPrice,
          category: 'plat'
        });
      }
    }
    
    // Traitement des desserts
    if (dessertsItem && dessertsItem.detail) {
      const dessertsList = dessertsItem.detail.split(', ');
      for (const dessert of dessertsList) {
        if (!dessert.trim()) continue;
        
        const name = extractNameFromFormattedItem(dessert);
        const quantity = extractQuantityFromFormattedItem(dessert);
        // Le prix extrait est déjà le prix unitaire, pas besoin de division
        const unitPrice = extractPriceFromFormattedItem(dessert);
        
        totalAmount += unitPrice * quantity;
        
        orderItems.push({
          name,
          quantity,
          price: unitPrice,
          category: 'dessert'
        });
      }
    }
    
    // Insertion de la commande dans MySQL
    const [orderIdRows] = await connection.query<RowDataPacket[]>("SELECT UUID() AS id");
    const orderId = (orderIdRows as RowDataPacket[])[0].id;
    const orderNumber = `TO-${Date.now().toString().slice(-6)}`;
    const estimatedDeliveryTime = heureRecupItem ? convertTimeToISOString(heureRecupItem.detail) : null;
    await connection.query(
      `INSERT INTO orders (id, restaurant_id, customer_name, customer_phone, order_number, total_amount, status, customer_address, estimated_delivery_time, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [orderId, restaurant_id, Nom_Prenom, Numero_whatsapp, orderNumber, totalAmount, 'pending', delivery_address, estimatedDeliveryTime, notes || null]
    );
    
    // Insertion des articles de la commande
    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (id, order_id, name, quantity, price, options, restaurant_id) VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
        [orderId, item.name, item.quantity, item.price, JSON.stringify({ category: item.category }), restaurant_id]
      );
    }
    
    // Mise à jour ou création du client fidèle
    const [loyaltyRows] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM loyalty_customers WHERE phone = ? AND restaurant_id = ? LIMIT 1`,
      [Numero_whatsapp, restaurant_id]
    );
    
    if ((loyaltyRows as RowDataPacket[]).length === 0) {
      // Nouveau client
      await connection.query(
        `INSERT INTO loyalty_customers (id, restaurant_id, name, phone, points, total_spent, last_visit, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())`,
        [restaurant_id, Nom_Prenom, Numero_whatsapp, 10, totalAmount]
      );
    } else {
      // Client existant
      const client = (loyaltyRows as RowDataPacket[])[0];
      await connection.query(
        `UPDATE loyalty_customers SET total_spent = ?, points = ?, last_visit = NOW() WHERE id = ?`,
        [client.total_spent + totalAmount, client.points + Math.floor(totalAmount / 1000), client.id]
      );
    }
    
    // Réponse de succès
    res.status(201).json({ 
      success: true, 
      message: 'Commande à emporter créée avec succès',
      orderId,
      orderNumber,
      totalAmount,
      items: orderItems.length
    });
    
  } catch (error: any) {
    console.error('Erreur lors du traitement de la commande à emporter:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors du traitement de la commande'
    });
  } finally {
    connection.release();
  }
};

/**
 * Contrôleur pour les commandes avec livraison
 */
export const createDeliveryOrder = async (req: Request, res: Response) => {
  const connection = await mysqlPool.getConnection();
  try {
    const { restaurant_id, Nom_Prenom, Numero_whatsapp, items, delivery_address, notes } = req.body;
    // Validation des données
    if (!restaurant_id || !Nom_Prenom || !items || !delivery_address) {
      return res.status(400).json({ 
        success: false,
        error: 'Données incomplètes',
        message: 'Le restaurant_id, les informations client, de commande ou l\'adresse de livraison sont manquantes'
      });
    }
    // Extraction des informations des items
    const platsItem = items.find((item: any) => item.name === 'Plats');
    const dessertsItem = items.find((item: any) => item.name === 'Desserts');
    const heureRecupItem = items.find((item: any) => item.name === 'Heure de récupération');
    // Calcul du montant total
    let totalAmount = 0;
    let orderItems: any[] = [];
    if (platsItem && platsItem.detail) {
      const platsList = platsItem.detail.split(', ');
      for (const plat of platsList) {
        if (!plat.trim()) continue;
        const name = extractNameFromFormattedItem(plat);
        const quantity = extractQuantityFromFormattedItem(plat);
        const unitPrice = extractPriceFromFormattedItem(plat);
        totalAmount += unitPrice * quantity;
        orderItems.push({ name, quantity, price: unitPrice, category: 'plat' });
      }
    }
    if (dessertsItem && dessertsItem.detail) {
      const dessertsList = dessertsItem.detail.split(', ');
      for (const dessert of dessertsList) {
        if (!dessert.trim()) continue;
        const name = extractNameFromFormattedItem(dessert);
        const quantity = extractQuantityFromFormattedItem(dessert);
        const unitPrice = extractPriceFromFormattedItem(dessert);
        totalAmount += unitPrice * quantity;
        orderItems.push({ name, quantity, price: unitPrice, category: 'dessert' });
      }
    }
    // Insertion de la commande dans MySQL
    const [orderIdRows] = await connection.query<RowDataPacket[]>("SELECT UUID() AS id");
    const orderId = (orderIdRows as RowDataPacket[])[0].id;
    const orderNumber = `DL-${Date.now().toString().slice(-6)}`;
    const estimatedDeliveryTime = heureRecupItem ? convertTimeToISOString(heureRecupItem.detail) : null;
    await connection.query(
      `INSERT INTO orders (id, restaurant_id, customer_name, customer_phone, order_number, total_amount, status, customer_address, estimated_delivery_time, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [orderId, restaurant_id, Nom_Prenom, Numero_whatsapp, orderNumber, totalAmount, 'pending', delivery_address, estimatedDeliveryTime, notes || null]
    );
    // Insertion des articles de la commande
    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (id, order_id, name, quantity, price, options, restaurant_id) VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
        [orderId, item.name, item.quantity, item.price, JSON.stringify({ category: item.category }), restaurant_id]
      );
    }
    // Fidélité client
    const [loyaltyRows] = await connection.query<RowDataPacket[]>(
      `SELECT * FROM loyalty_customers WHERE phone = ? AND restaurant_id = ? LIMIT 1`,
      [Numero_whatsapp, restaurant_id]
    );
    if ((loyaltyRows as RowDataPacket[]).length === 0) {
      await connection.query(
        `INSERT INTO loyalty_customers (id, restaurant_id, name, phone, points, total_spent, last_visit, created_at) VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())`,
        [restaurant_id, Nom_Prenom, Numero_whatsapp, 10, totalAmount]
      );
    } else {
      const client = (loyaltyRows as RowDataPacket[])[0];
      await connection.query(
        `UPDATE loyalty_customers SET total_spent = ?, points = ?, last_visit = NOW() WHERE id = ?`,
        [client.total_spent + totalAmount, client.points + Math.floor(totalAmount / 1000), client.id]
      );
    }
    res.status(201).json({ 
      success: true, 
      message: 'Commande avec livraison créée avec succès',
      orderId,
      orderNumber,
      totalAmount,
      items: orderItems.length
    });
  } catch (error: any) {
    console.error('Erreur lors du traitement de la commande avec livraison:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors du traitement de la commande'
    });
  } finally {
    connection.release();
  }
};
