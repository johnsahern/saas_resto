// Types pour les structures géospatiales
export type GeoPoint = {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
};

export type Location = {
  lat: number;
  lng: number;
};

// Convertir un GeoPoint en {lat, lng}
export const geoPointToLocation = (geoPoint: GeoPoint | null): Location | null => {
  if (!geoPoint || !Array.isArray(geoPoint.coordinates) || geoPoint.coordinates.length < 2) {
    return null;
  }
  
  // GeoJSON stocke les coordonnées comme [longitude, latitude]
  const [lng, lat] = geoPoint.coordinates;
  return { lat, lng };
};

// Convertir {lat, lng} en GeoPoint
export const locationToGeoPoint = (location: Location): GeoPoint => {
  return {
    type: "Point",
    coordinates: [location.lng, location.lat] // GeoJSON utilise [longitude, latitude]
  };
};

// Extraire lat/lng depuis une entrée de livreur (avec gestion d'erreur)
export const extractLocationFromDeliveryPerson = (deliveryPerson: any): Location | null => {
  try {
    if (!deliveryPerson) return null;
    
    // Si current_location existe et est un objet GeoJSON
    if (deliveryPerson.current_location?.type === "Point") {
      return geoPointToLocation(deliveryPerson.current_location);
    }
    
    // Fallback: Si current_lat et current_lng existent directement (ancien format)
    if (
      typeof deliveryPerson.current_lat === 'number' && 
      typeof deliveryPerson.current_lng === 'number'
    ) {
      return {
        lat: deliveryPerson.current_lat,
        lng: deliveryPerson.current_lng
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de l\'extraction des coordonnées:', error);
    return null;
  }
};
