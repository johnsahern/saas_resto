import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import OwnerLogin from './pages/OwnerLogin';
import ManagerLogin from './pages/ManagerLogin';
import RestaurantSelection from './pages/RestaurantSelection';
import RegisterOwner from './pages/RegisterOwner';
import { Dashboard } from './components/Dashboard';
import { Orders } from './components/Orders';
import { Inventory } from './components/Inventory';
import { Staff } from './components/Staff';
import { Delivery } from './components/Delivery';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { Reservations } from './components/Reservations';
import { OnlineOrders } from './components/OnlineOrders';
import { Billing } from './components/Billing';
import { Loyalty } from './components/Loyalty';
import { OnlineOrdersAnalytics } from './components/OnlineOrdersAnalytics';
import { History } from './components/History';
import NotFound from './pages/NotFound';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔐 État authentification:', { isAuthenticated, isLoading, path: location.pathname });

  // Afficher le spinner pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Liste des routes publiques
  const publicRoutes = ['/', '/owner-login', '/manager-login', '/register-owner', '/restaurant-selection'];
  
  // Si l'utilisateur est authentifié et essaie d'accéder à une route publique
  if (isAuthenticated && publicRoutes.includes(location.pathname)) {
    console.log('👉 Redirection vers /dashboard (utilisateur authentifié sur route publique)');
    return <Navigate to="/dashboard" replace />;
  }

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (!isAuthenticated && !publicRoutes.includes(location.pathname)) {
    console.log('👉 Redirection vers / (utilisateur non authentifié sur route protégée)');
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Login />} />
      <Route path="/owner-login" element={<OwnerLogin />} />
      <Route path="/manager-login" element={<ManagerLogin />} />
      <Route path="/register-owner" element={<RegisterOwner />} />
      <Route path="/restaurant-selection" element={<RestaurantSelection />} />

      {/* Routes protégées */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/online-orders" element={<OnlineOrders />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/loyalty" element={<Loyalty />} />
        <Route path="/analytics-online" element={<OnlineOrdersAnalytics />} />
        <Route path="/history" element={<History />} />
      </Route>

      {/* Route 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
