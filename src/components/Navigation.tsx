import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Settings, 
  Bell,
  Leaf,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Navigation: React.FC = () => {
  const { user, restaurant, logout } = useAuth();

  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  const getFullName = (firstName: string, lastName: string) => {
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Utilisateur';
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'from-emerald-600 to-green-600';
      case 'admin': return 'from-blue-600 to-indigo-600';
      case 'manager': return 'from-green-500 to-emerald-500';
      default: return 'from-teal-500 to-green-500';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'owner': return 'Propriétaire';
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'employee': return 'Employé';
      case 'waiter': return 'Serveur';
      case 'chef': return 'Chef';
      default: return 'Utilisateur';
    }
  };

  const getRolePermissions = (role?: string) => {
    switch (role) {
      case 'owner': return 'Contrôle total';
      case 'admin': return 'Administration complète';
      case 'manager': return 'Gestion • Création';
      case 'employee': return 'Opérations limitées';
      default: return 'Accès limité';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const fullName = getFullName(user.first_name, user.last_name);
  const initials = getInitials(user.first_name, user.last_name);
  const roleLabel = getRoleLabel(user.role);

  return (
    <nav className="bg-white border-b border-emerald-100 px-6 py-4 elegant-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl elegant-shadow">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {restaurant?.name || 'SaaS Resto'}
              </h1>
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Gestion intelligente
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 h-auto hover:bg-emerald-50 rounded-xl">
                <div className="text-right">
                  <div className="text-sm font-medium text-emerald-800">{fullName}</div>
                  <div className="text-xs text-emerald-600">{roleLabel} • {getRolePermissions(user.role)}</div>
                </div>
                <Avatar className="w-10 h-10 ring-2 ring-emerald-200">
                  <AvatarFallback className={`bg-gradient-to-r ${getRoleColor(user.role)} text-white text-sm font-bold`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-emerald-100 elegant-shadow">
              <DropdownMenuItem className="text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-emerald-100" />
              <DropdownMenuItem 
                className="text-red-600 focus:bg-red-50 focus:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
