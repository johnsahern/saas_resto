import express from 'express';
import { executeQuery } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Liste du personnel
router.get('/', authenticate as any, async (req: any, res: any) => {
  try {
    const restaurantId = req.user?.restaurant_id || req.query.restaurant_id;
    if (!restaurantId) return res.status(400).json({ success: false, error: 'Restaurant ID requis' });
    const staff = await executeQuery('SELECT * FROM staff_members WHERE restaurant_id = ? ORDER BY last_name, first_name', [restaurantId]);
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Ajout d'un membre du personnel
router.post('/', authenticate as any, async (req: any, res: any) => {
  try {
    const data = req.body;
    const restaurantId = req.user?.restaurant_id || data.restaurant_id;
    if (!restaurantId || !data.first_name || !data.last_name) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    await executeQuery(
      `INSERT INTO staff_members (
        id, restaurant_id, employee_number, first_name, last_name, email, phone, position, department, hire_date, salary, hourly_rate, status, shift_type, emergency_contact_name, emergency_contact_phone, address, notes, avatar_url, created_at, updated_at
      ) VALUES (
        UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )`,
      [
        restaurantId,
        '', // employee_number
        data.first_name,
        data.last_name,
        data.email || '',
        data.phone || '',
        data.position || '',
        data.department || '',
        data.hire_date || null,
        data.salary || null,
        null, // hourly_rate
        data.status || 'actif',
        null, // shift_type
        null, // emergency_contact_name
        null, // emergency_contact_phone
        null, // address
        null, // notes
        null  // avatar_url
      ]
    );
    // Retourner l'objet staff nouvellement créé
    const [created] = await executeQuery(
      'SELECT * FROM staff_members WHERE restaurant_id = ? AND first_name = ? AND last_name = ? ORDER BY created_at DESC LIMIT 1',
      [restaurantId, data.first_name, data.last_name]
    );
    res.json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Modification d'un membre du personnel
router.patch('/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const restaurantId = req.user?.restaurant_id || updates.restaurant_id;
    if (!restaurantId || !id) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'restaurant_id');
    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'Aucune donnée à mettre à jour' });
    }
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);
    await executeQuery(
      `UPDATE staff_members SET ${setClause} WHERE id = ? AND restaurant_id = ?`,
      [...values, id, restaurantId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Suppression d'un membre du personnel
router.delete('/:id', authenticate as any, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user?.restaurant_id || req.body.restaurant_id;
    if (!restaurantId || !id) {
      return res.status(400).json({ success: false, error: 'Champs requis manquants' });
    }
    await executeQuery('DELETE FROM staff_members WHERE id = ? AND restaurant_id = ?', [id, restaurantId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router; 