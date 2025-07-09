import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeliveries, DELIVERY_STATUS } from '../../hooks/useDeliveries';
import dayjs from 'dayjs';

// Nouveau type Delivery local (adapté à la structure backend)
type Delivery = {
  id: string;
  delivery_person_id: string;
  order_id: string;
  status: string;
  address: string;
  created_at: string;
  updated_at: string;
  notes?: string | null;
  // Ajoute d'autres champs si besoin
};

const DeliveryList = () => {
  const { deliveries, loading, fetchDeliveries } = useDeliveries();
  const [filter, setFilter] = useState<string | null>(null);
  const [tab, setTab] = useState<'today' | 'history'>('today');
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);

  // Filtrer les livraisons selon l'onglet et le statut
  useEffect(() => {
    let baseList = deliveries;
    if (tab === 'today') {
      const today = dayjs().format('YYYY-MM-DD');
      baseList = deliveries.filter(delivery => delivery.created_at && dayjs(delivery.created_at).format('YYYY-MM-DD') === today);
    }
    if (filter) {
      setFilteredDeliveries(baseList.filter(delivery => delivery.status === filter));
    } else {
      setFilteredDeliveries(baseList);
    }
  }, [deliveries, filter, tab]);

  // Obtenir la classe de badge selon le statut
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case DELIVERY_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case DELIVERY_STATUS.ASSIGNED:
        return 'bg-blue-100 text-blue-800';
      case DELIVERY_STATUS.IN_PROGRESS:
        return 'bg-purple-100 text-purple-800';
      case DELIVERY_STATUS.DELIVERED:
        return 'bg-green-100 text-green-800';
      case DELIVERY_STATUS.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir le libellé du statut en français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case DELIVERY_STATUS.PENDING:
        return 'En attente';
      case DELIVERY_STATUS.ASSIGNED:
        return 'Assignée';
      case DELIVERY_STATUS.IN_PROGRESS:
        return 'En cours';
      case DELIVERY_STATUS.DELIVERED:
        return 'Livrée';
      case DELIVERY_STATUS.CANCELLED:
        return 'Annulée';
      default:
        return status;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDeliveries();
    }, 10000); // 10 secondes
    return () => clearInterval(interval);
  }, [fetchDeliveries]);

  return (
    <div className="h-full px-2 md:px-8 pt-2 pb-4 max-w-2xl mx-auto">
      {/* Onglets */}
      <div className="mb-4 flex items-center space-x-2">
        <button
          onClick={() => setTab('today')}
          className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors duration-150 ${tab === 'today' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-gray-500 bg-gray-50 hover:bg-white'}`}
        >
          Aujourd'hui
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors duration-150 ${tab === 'history' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-gray-500 bg-gray-50 hover:bg-white'}`}
        >
          Historique
        </button>
      </div>

      <div className="mb-4 flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-200">
        <button
          onClick={() => setFilter(null)}
          className={`px-4 py-1 text-sm font-semibold rounded-full whitespace-nowrap border transition-colors duration-150 ${
            filter === null
              ? 'bg-emerald-600 text-white border-emerald-600 shadow'
              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          Toutes
        </button>
        {Object.values(DELIVERY_STATUS).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1 text-sm font-semibold rounded-full whitespace-nowrap border transition-colors duration-150 ${
              filter === status
                ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            {getStatusLabel(status)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center border border-emerald-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-emerald-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune livraison</h3>
          <p className="text-gray-500">
            {filter 
              ? `Vous n'avez aucune livraison avec le statut "${getStatusLabel(filter)}".` 
              : "Vous n'avez aucune livraison pour le moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDeliveries.map(delivery => (
            <Link
              key={delivery.id}
              to={`/delivery/${delivery.id}`}
              className="block bg-white rounded-2xl shadow-lg border border-emerald-100 hover:border-emerald-300 transition p-4 group"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{delivery.address || 'Client inconnu'}</h3>
                  <p className="text-sm text-gray-500 truncate">{delivery.address}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full shadow ${getStatusBadgeClass(delivery.status)}`}
                  style={{ minWidth: 80, textAlign: 'center' }}>
                  {getStatusLabel(delivery.status)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{delivery.created_at ? new Date(delivery.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</span>
                </div>
                <div className="flex items-center text-emerald-600 font-semibold group-hover:underline">
                  <span>Détails</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryList;