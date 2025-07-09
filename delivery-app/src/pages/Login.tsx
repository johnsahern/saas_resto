import { useState } from 'react';
// import { supabase } from '../lib/supabase'; // Supprimé
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import Spinner from '../components/ui/Spinner';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { setUser } = useAuthStore();
  const { showNotification } = useUiStore();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!phone || !name) {
      setErrorMsg('Veuillez remplir tous les champs');
      return;
    }
    setIsLoading(true);
    try {
      // Appel à la nouvelle route d'authentification livreur
      const response = await fetch(`${API_URL}/auth/delivery-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name })
      });
      const result = await response.json();
      console.log('[DEBUG] Réponse API login:', result);
      if (!result.success || !result.token) {
        throw new Error(result.error || 'Identifiants invalides.');
      }
      // Stocker le token JWT (ici dans localStorage, à adapter si besoin)
      localStorage.setItem('delivery_token', result.token);
      const data = result.delivery_person;
      const userObj = {
        id: data.id,
        email: data.email || '',
        name: data.name || data.first_name + (data.last_name ? ' ' + data.last_name : ''),
        phone: data.phone,
        available: data.available === 1, // booléen fiable
        restaurant_id: data.restaurant_id,
      };
      console.log('[DEBUG] user construit après login:', userObj);
      setUser(userObj);
      showNotification(`Bienvenue, ${data.first_name}!`, 'success');
    } catch (error: any) {
      setErrorMsg(error.message || 'Erreur lors de la connexion. Vérifiez vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-amber-50 to-emerald-200 flex flex-col justify-center py-8 px-2">
      <div className="mx-auto w-full max-w-xs flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg mb-2 border-4 border-emerald-200 animate-bounce-slow">
            {/* Icône moto de livraison stylisée */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-emerald-500" viewBox="0 0 48 48" fill="none">
              <circle cx="14" cy="36" r="4" stroke="currentColor" strokeWidth="2.5" fill="white"/>
              <circle cx="36" cy="36" r="4" stroke="currentColor" strokeWidth="2.5" fill="white"/>
              <path d="M14 36h8l6-8h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="28" y="20" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2.5" fill="white"/>
              <path d="M22 36l-4-12h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="32" cy="20" r="2" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-emerald-700 text-center tracking-tight">Mon Resto Livraison</h2>
          <p className="mt-1 text-sm text-gray-500 text-center">Connectez-vous pour gérer vos livraisons</p>
        </div>
        <div className="w-full bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm text-center animate-shake">
              {errorMsg}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleLogin} autoComplete="on">
            <div className="relative">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <span className="absolute left-3 top-9 flex items-center h-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-base"
                placeholder="Votre nom complet"
              />
            </div>
            <div className="relative">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
              <span className="absolute left-3 top-9 flex items-center h-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm10-10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-base"
                placeholder="06 00 00 00 00"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md text-base font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 disabled:opacity-60 transition-all active:scale-95"
              >
                {isLoading ? <Spinner size="small" color="white" /> : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
        <div className="mt-8 text-xs text-gray-400 text-center opacity-80">
          Propulsé par <span className="font-bold text-emerald-500">Emergyne</span>
        </div>
      </div>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2.2s infinite; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s; }
      `}</style>
    </div>
  );
};

export default Login;
