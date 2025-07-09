import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { apiFetch } from '../../utils/api';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { showNotification, showLoading, hideLoading } = useUiStore();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mettre à jour le formulaire si l'utilisateur change
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Mettre à jour le profil via l'API backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showNotification('Utilisateur non connecté', 'error');
      return;
    }
    if (!name.trim()) {
      showNotification('Veuillez entrer votre nom', 'error');
      return;
    }
    setIsUpdating(true);
    showLoading();
    try {
      const response = await apiFetch(`${import.meta.env.VITE_API_URL}/delivery-persons/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Erreur API');
      setUser({ ...user, name: result.data.name });
      showNotification('Profil mis à jour avec succès', 'success');
      setIsEditing(false);
    } catch (err) {
      showNotification('Une erreur est survenue', 'error');
    } finally {
      hideLoading();
      setIsUpdating(false);
    }
  };

  // Annuler l'édition
  const handleCancel = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
  };

  // Ajout d'un useEffect pour afficher la réponse API au chargement du profil
  useEffect(() => {
    if (user) {
      (async () => {
        const response = await apiFetch(`${import.meta.env.VITE_API_URL}/delivery-persons/${user.id}`);
        const result = await response.json();
        console.log('[DEBUG] Réponse API profil au chargement:', result);
      })();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const response = await apiFetch(`${import.meta.env.VITE_API_URL}/delivery-persons/${user.id}`);
      const result = await response.json();
      if (result.success && result.data) {
        setUser(result.data);
      }
    }, 10000); // 10 secondes
    return () => clearInterval(interval);
  }, [user, setUser]);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Mon Profil</h2>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 text-gray-500"
                  placeholder="Votre numéro de téléphone"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Le numéro de téléphone ne peut pas être modifié car il est utilisé pour l'authentification.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nom complet</h3>
                <p className="text-lg font-medium">{user?.name || 'Non défini'}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Numéro de téléphone</h3>
                <p className="text-lg font-medium">{user?.phone || 'Non défini'}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Statut</h3>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${user?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {user?.available ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                disabled
                className="px-4 py-2 bg-gray-400 text-white rounded-md opacity-60 cursor-not-allowed"
              >
                Modifier mon profil
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Informations légales</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            En utilisant cette application, vous acceptez que votre position géographique soit 
            collectée et utilisée uniquement dans le cadre de la livraison des commandes. 
            Ces données ne sont utilisées que pendant vos heures de travail et lorsque vous êtes 
            connecté à l'application en tant que livreur disponible.
          </p>
          <p className="text-sm text-gray-600">
            Pour toute question concernant la protection de vos données ou pour exercer vos droits,
            veuillez contacter notre équipe de support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
