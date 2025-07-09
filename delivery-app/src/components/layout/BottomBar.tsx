import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    path: '/dashboard',
    label: 'Livraisons',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h6a2 2 0 012 2v6M9 17H7a2 2 0 01-2-2v-6a2 2 0 012-2h2m0 0V7a2 2 0 012-2h2a2 2 0 012 2v2" />
      </svg>
    ),
  },
  {
    path: '/dashboard/profile',
    label: 'Profil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
      </svg>
    ),
  },
];

const BottomBar = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-16 md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors ${
              isActive ? 'text-emerald-600 font-bold' : 'text-gray-500'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomBar; 