import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
// import { supabase } from './lib/supabase'; // Supprimé

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Components
import NotificationContainer from './components/ui/Notification';

// Store
import { useAuthStore } from './store/authStore';
import { useUiStore } from './store/uiStore';
import { apiFetch } from './utils/api';

const DeliveryRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/dashboard/delivery/${id}`} replace />;
};

function App() {
  const { user, setUser } = useAuthStore();
  const { loading } = useUiStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('delivery_token');
        const userId = localStorage.getItem('delivery_person_id');
        if (token && userId) {
          // Appel à l'API backend pour charger le profil
          const response = await apiFetch(`${import.meta.env.VITE_API_URL}/delivery-persons/${userId}`);
          const result = await response.json();
          if (result.success && result.data) {
            setUser(result.data);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setInitialized(true);
      }
    };
    checkAuth();
  }, [setUser]);

  if (!initialized) {
    return <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-700">Chargement de l'application...</p>
      </div>
    </div>;
  }

  return (
    <div className="app-container min-h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-3 text-gray-700">Chargement...</p>
          </div>
        </div>
      )}
      <NotificationContainer />
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/dashboard/*" element={
          user ? <Dashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="/delivery/:id" element={<DeliveryRedirect />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;