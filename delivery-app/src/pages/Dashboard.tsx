import { useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
// import { supabase } from '../lib/supabase'; // Supprimé
import { locationToGeoPoint } from '../utils/locationUtils';

// Composants de mise en page
import Header from '../components/layout/Header';
import BottomBar from '../components/layout/BottomBar';

// Composants de contenu
import DeliveryList from '../components/delivery/DeliveryList';
import DeliveryDetails from '../components/delivery/DeliveryDetails';
import Profile from '../components/profile/Profile';

const Dashboard = () => {
  const { user, updateLocation, setUser } = useAuthStore();
  const { showNotification } = useUiStore();
  const location = useLocation();
  
  // Refs pour éviter les fuites mémoire
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastStatusRef = useRef(user?.available);

  // Fermer le sidebar quand la route change (sur mobile)
  useEffect(() => {
    // setSidebarOpen(false); // Supprimé
  }, [location.pathname]);
  
  // Fonction memoized pour récupérer le statut utilisateur
  const fetchUserStatus = useCallback(async () => {
    if (!user || !user?.restaurant_id) return;
    try {
      const token = localStorage.getItem('delivery_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await fetch(
        `${API_URL}/delivery-persons/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();
      if (!result.success || !result.data) return;
      const data = result.data;
      const available = data.available === true || data.available === 1;
      if (available !== lastStatusRef.current) {
        setUser({ ...user, available });
        showNotification(
          `Votre statut a été modifié à: ${available ? 'Disponible' : 'Indisponible'}`,
          'info'
        );
        lastStatusRef.current = available;
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  }, [user, setUser, showNotification]);
  
  // Vérifier régulièrement le statut de disponibilité dans Supabase
  useEffect(() => {
    if (!user) return;
    fetchUserStatus();
    intervalIdRef.current = setInterval(fetchUserStatus, 10000);
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [user?.id, fetchUserStatus]);

  // Fonction memoized pour gérer la mise à jour de position
  const handlePositionUpdate = useCallback(async (position: GeolocationPosition) => {
    if (!user) return;
    
    const { latitude, longitude } = position.coords;
    
    // Vérifier que les valeurs de latitude et longitude sont valides
    if (isNaN(latitude) || isNaN(longitude)) {
      console.error('Coordonnées invalides:', { latitude, longitude });
      return;
    }
    
    // Arrondir les valeurs pour éviter les problèmes de précision
    const roundedLat = parseFloat(latitude.toFixed(6));
    const roundedLng = parseFloat(longitude.toFixed(6));
    
    // Stocker la dernière position pour éviter les mises à jour inutiles
    const lastPosition = JSON.parse(localStorage.getItem('lastPosition') || '{"lat":0,"lng":0}');
    
    // Ne mettre à jour que si la position a changé significativement (> 10 mètres)
    const hasMoved = Math.abs(lastPosition.lat - roundedLat) > 0.0001 || 
                     Math.abs(lastPosition.lng - roundedLng) > 0.0001;
                     
    if (!hasMoved) {
      return; // Éviter les mises à jour inutiles si la position n'a pas changé
    }
    
    // Mettre à jour le state local via authStore
    updateLocation(roundedLat, roundedLng);
    
    // Stocker la dernière position mise à jour
    localStorage.setItem('lastPosition', JSON.stringify({ lat: roundedLat, lng: roundedLng }));
    
    // Limiter les logs pour éviter le spam dans la console
    const now = Date.now();
    const lastLogTime = parseInt(localStorage.getItem('lastPositionLogTime') || '0');
    const logInterval = 10000; // 10 secondes entre les logs
    
    // Ne mettre à jour la base que si l'utilisateur est réel (non démo) 
          if (user.id) {
      try {
        const geoPoint = locationToGeoPoint({ lat: roundedLat, lng: roundedLng });
        const updateData = { current_location: geoPoint };
        if (now - lastLogTime > logInterval) {
          console.log('Tentative de mise à jour avec les données:', updateData);
          localStorage.setItem('lastPositionLogTime', now.toString());
        }
        const token = localStorage.getItem('delivery_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        const response = await fetch(
          `${API_URL}/delivery-persons/${user.id}/location`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          }
        );
        const result = await response.json();
        if (!result.success) {
          if (now - lastLogTime > logInterval) {
            console.error('Erreur de mise à jour de la position:', result.error);
            showNotification(`Erreur de mise à jour de position: ${result.error}`, 'error');
          }
        } else if (now - lastLogTime > logInterval) {
          console.log('Position mise à jour avec succès');
        }
      } catch (err) {
        if (now - lastLogTime > logInterval) {
          console.error('Exception lors de la mise à jour:', err);
        }
      }
    }
  }, [user, updateLocation, showNotification]);

  // Gérer les erreurs de géolocalisation
  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    // Codes d'erreur standard du navigateur
    // 1: PERMISSION_DENIED, 2: POSITION_UNAVAILABLE, 3: TIMEOUT
    let errorMessage = `Erreur de géolocalisation (${error.code}): `;
    
    switch (error.code) {
      case 1:
        errorMessage += "L'utilisateur a refusé l'accès à la géolocalisation.";
        break;
      case 2:
        errorMessage += "Position indisponible. Vérifiez votre GPS ou essayez à l'extérieur.";
        break;
      case 3:
        errorMessage += "La requête de position a expiré. Vérifiez votre connexion Internet.";
        break;
      default:
        errorMessage += error.message || "Erreur inconnue";
    }
    
    console.error(errorMessage);
    
    // En mode développement, utiliser une position par défaut pour éviter les blocages
    // Modifié pour gérer également le code d'erreur 2 (POSITION_UNAVAILABLE)
    if (process.env.NODE_ENV === 'development' && (error.code === 3 || error.code === 2 || error.code === 1)) {
      console.log("DEV MODE: Utilisation d'une position par défaut pour continuer le développement");
      // Position par défaut (Paris)
      const defaultPosition = {
        coords: {
          latitude: 48.856614,
          longitude: 2.3522219,
          accuracy: 100,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      } as GeolocationPosition;
      
      // Utiliser cette position pour ne pas bloquer le développement
      handlePositionUpdate(defaultPosition);
    } else {
      showNotification(errorMessage, 'error');
    }
  }, [handlePositionUpdate, showNotification]);

  // Mettre à jour la géolocalisation
  useEffect(() => {
    if (!user) return;
    
    // Démarrer le suivi continu
    const startContinuousTracking = () => {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          handlePositionUpdate,
          handlePositionError,
          { 
            enableHighAccuracy: true, 
            timeout: 30000,  // Augmenté à 30 secondes
            maximumAge: 15000  // Accepter des positions plus anciennes (15 secondes)
          }
        );
      }
    };

    // Tenter d'abord d'obtenir une position unique
    const getInitialPosition = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Succès - position initiale obtenue
            handlePositionUpdate(position);
            
            // Ensuite démarrer le suivi continu
            startContinuousTracking();
          },
          (error) => {
            // Erreur lors de la récupération de la position initiale
            console.error("Erreur de géolocalisation initiale:", error.message);
            handlePositionError(error);
            
            // Malgré l'erreur, essayer le suivi continu après un délai
            setTimeout(() => {
              startContinuousTracking();
            }, 5000);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 60000,  // Augmenté à 60 secondes pour la première position
            maximumAge: 30000    // Accepter une position de max 30 secondes
          }
        );
      } else {
        showNotification("La géolocalisation n'est pas supportée par votre navigateur", 'error');
      }
    };

    // Démarrer la localisation
    getInitialPosition();
    
    // Nettoyer au démontage
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [user?.id, handlePositionUpdate, handlePositionError, showNotification]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16">
      <Header />
      <main className="flex-1 pt-16 px-2 pb-2 max-w-md mx-auto w-full">
        <Routes>
          <Route path="/" element={<DeliveryList />} />
          <Route path="/delivery/:id" element={<DeliveryDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomBar />
    </div>
  );
};

export default Dashboard;