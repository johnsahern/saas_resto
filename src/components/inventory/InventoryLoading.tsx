
import React from 'react';

export const InventoryLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-emerald-600">Chargement de l'inventaire...</p>
        </div>
      </div>
    </div>
  );
};
