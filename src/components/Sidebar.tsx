import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  BarChart3,
  Users,
  Settings,
  ChefHat,
  CreditCard,
  Sparkles,
  Star,
  History as HistoryIcon,
  CalendarDays,
  ShoppingCart,
  Truck
} from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    roles: ['owner', 'manager'],
  },
  {
    id: 'orders',
    label: 'Commandes',
    icon: ChefHat,
    roles: ['owner', 'manager'],
  },
  {
    id: 'reservations',
    label: 'Réservations',
    icon: CalendarDays,
    roles: ['owner', 'manager'],
  },
  {
    id: 'online-orders',
    label: 'Commandes en ligne',
    icon: ShoppingCart,
    roles: ['owner', 'manager'],
  },
  {
    id: 'billing',
    label: 'Facturation',
    icon: CreditCard,
    roles: ['owner', 'manager'],
  },
  {
    id: 'delivery',
    label: 'Livraison',
    icon: Truck,
    roles: ['owner', 'manager'],
  },
  {
    id: 'loyalty',
    label: 'Fidélité',
    icon: Star,
    roles: ['owner', 'manager'],
  },
  {
    id: 'inventory',
    label: 'Stocks',
    icon: Package,
    roles: ['owner', 'manager'],
  },
  {
    id: 'analytics',
    label: 'Analyses',
    icon: BarChart3,
    roles: ['owner', 'manager'],
  },
  {
    id: 'analytics-online',
    label: 'Analyses Online',
    icon: BarChart3,
    roles: ['owner', 'manager'],
  },
  {
    id: 'history',
    label: 'Historique',
    icon: HistoryIcon,
    roles: ['owner', 'manager'],
  },
  {
    id: 'staff',
    label: 'Personnel',
    icon: Users,
    roles: ['owner', 'manager'],
  },
  {
    id: 'settings',
    label: 'Configuration',
    icon: Settings,
    roles: ['owner'],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const allowedItems = navItems.filter(item => item.roles.includes(user.role as UserRole));

  return (
    <div className="w-64 bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-900 h-full">
      <div className="p-6">
        {/* Badge de rôle utilisateur */}
        <div className="mb-6 p-4 bg-emerald-800/50 rounded-xl border border-emerald-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-emerald-200">Rôle actuel</span>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold",
              user.role === 'owner' ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900" : "bg-gradient-to-r from-blue-400 to-indigo-400 text-blue-900"
            )}>
              {user.role === 'owner' ? '👑 Propriétaire' : '👔 Manager'}
            </span>
          </div>
          <p className="text-xs text-emerald-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {user.role === 'owner' ? 'Contrôle total • Gestion personnel' : 'Gestion restaurant • Opérations'}
          </p>
        </div>

        <nav className="space-y-2">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/${item.id}`)}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white elegant-shadow transform scale-105'
                    : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white hover:transform hover:scale-102'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 transition-all duration-300',
                  isActive ? 'text-white' : 'text-emerald-300 group-hover:text-white'
                )} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Indicateur de statut */}
        <div className="mt-8 p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30">
          <div className="flex items-center gap-2 text-emerald-200 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Système en ligne</span>
          </div>
        </div>
      </div>
    </div>
  );
};
