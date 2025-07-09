import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Sidebar } from './Sidebar';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const activeTab = location.pathname.substring(1); // Enlève le '/' initial

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      <div className="flex">
        <Sidebar activeTab={activeTab} />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;