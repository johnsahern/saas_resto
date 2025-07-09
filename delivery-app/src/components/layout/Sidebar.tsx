import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuthStore();

  // Fermer le menu si on clique à l'extérieur sur mobile
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Livraisons', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/dashboard/profile', label: 'Mon Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <>
      {/* Overlay pour fermer le menu sur mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={handleOverlayClick}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:flex-shrink-0 md:pt-0`}
      >
        <div className="flex flex-col h-full">
          {/* Espace pour le Header si le Header est au-dessus du Sidebar sur mobile et fixe */}
          {/* Ce padding-top est important si le Header est fixe et global */}
          <div className="h-16 flex-shrink-0 md:hidden"></div>
          {/* Espace pour le Header sur mobile */}

          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className={`w-2 h-2 rounded-full mr-2 ${
                  user?.available ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  title={user?.available ? 'Disponible' : 'Indisponible'}
                ></div>
                <span className="truncate">
                  {user?.name || 'Utilisateur'}
                </span>
              </div>
              <p className="text-sm text-gray-400">{user?.phone}</p>
            </div>
          </div>

          <nav className="flex-1 py-4">
            <ul>
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 ${
                      location.pathname === item.path
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } transition-colors duration-200`}
                    onClick={onClose}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 mt-auto border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              RestoDash {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
