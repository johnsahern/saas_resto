// Utilitaire pour les appels API backend avec gestion du token et des erreurs
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('delivery_token');
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
  console.log('[DEBUG] Appel API URL:', url, 'Options:', options);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    // Déconnexion automatique si token invalide/expiré
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_person_id');
    window.location.href = '/login';
    throw new Error('Session expirée, veuillez vous reconnecter.');
  }
  return response;
} 