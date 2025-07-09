// Script de test pour vérifier les routes API liées aux livreurs et livraisons (login automatique)
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const deliveryPersonId = '5abf33f8-5810-11f0-8688-8c859064ad64';
const restaurantId = '05d2f728-6cc4-48af-9213-4977fce805da';
const phone = '+2290159190099';
const name = 'BIlly';

// Route de login livreur (à adapter si besoin)
const LOGIN_URL = `${BASE_URL}/auth/delivery-login`;

async function getToken() {
  try {
    const res = await axios.post(LOGIN_URL, { phone, name });
    if (res.data && res.data.token) {
      console.log('✅ Token JWT obtenu');
      return res.data.token;
    } else {
      throw new Error('Token non trouvé dans la réponse');
    }
  } catch (err) {
    console.error('Erreur lors du login livreur:', err.response?.data || err.message);
    process.exit(1);
  }
}

async function testGetDeliveryPerson(headers) {
  try {
    const res = await axios.get(`${BASE_URL}/delivery-persons/${deliveryPersonId}`, { headers });
    console.log('Profil livreur:', res.data);
  } catch (err) {
    console.error('Erreur GET /delivery-persons/:id', err.response?.data || err.message);
  }
}

async function testGetDeliveries(headers) {
  try {
    const res = await axios.get(`${BASE_URL}/deliveries`, {
      headers,
      params: {
        delivery_person_id: deliveryPersonId,
        restaurant_id: restaurantId,
      },
    });
    console.log('Livraisons assignées:', res.data);
  } catch (err) {
    console.error('Erreur GET /deliveries', err.response?.data || err.message);
  }
}

async function main() {
  console.log('--- Test API livreur (login automatique) ---');
  const token = await getToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  await testGetDeliveryPerson(headers);
  await testGetDeliveries(headers);
}

main(); 