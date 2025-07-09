import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuthStore();
  const [restaurantName, setRestaurantName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[DEBUG] restaurant_id utilisé:', user?.restaurant_id);
    const fetchRestaurantName = async () => {
      if (user?.restaurant_id) {
        try {
          const response = await apiFetch(`${import.meta.env.VITE_API_URL}/restaurants/${user.restaurant_id}`);
          const result = await response.json();
          console.log('[DEBUG] Réponse API restaurant:', result);
          if (result.success && result.data && result.data.name) {
            setRestaurantName(result.data.name);
          } else {
            setRestaurantName('Mon Restaurant');
          }
        } catch (e) {
          console.log('[DEBUG] Erreur API restaurant:', e);
          setRestaurantName('Mon Restaurant');
        }
      }
    };
    fetchRestaurantName();
  }, [user?.restaurant_id]);

  if (!user || !user.restaurant_id) {
    return null; // ou un loader si tu préfères
  }

  const handleLogout = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      try {
        await logout();
        navigate('/login');
      } catch (e) {
        alert('Erreur lors de la déconnexion.');
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10 h-16">
      <div className="h-full flex items-center justify-between px-4 w-full">
        {/* Bloc gauche : nom restaurant seul */}
        <div className="flex items-center min-w-0 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800 break-words whitespace-pre-line leading-tight text-left">
            {restaurantName || 'Mon Restaurant'}
          </h1>
        </div>
        {/* Bloc droit : nom livreur + logout */}
        <div className="flex items-center min-w-0 flex-shrink-0">
          <span className="text-base font-medium text-gray-700 break-words whitespace-pre-line leading-tight text-right mr-2">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Se déconnecter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
