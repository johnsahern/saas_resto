import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const canCreate = () => {
    return user?.role === 'owner' || user?.role === 'manager';
  };

  const canModify = () => {
    return user?.role === 'owner' || user?.role === 'manager';
  };

  const canDelete = () => {
    return user?.role === 'owner';
  };

  const canView = () => {
    return user?.role === 'owner' || user?.role === 'manager';
  };

  const canAccessSection = (section: string) => {
    if (user?.role === 'owner') return true;
    
    if (user?.role === 'manager') {
      // Les managers n'ont pas accès à certaines sections
      const restrictedSections = ['staff', 'settings'];
      return !restrictedSections.includes(section);
    }
    
    return false;
  };

  return {
    canCreate,
    canModify,
    canDelete,
    canView,
    canAccessSection,
    userRole: user?.role,
    isManager: user?.role === 'manager',
    isDG: user?.role === 'owner',
    isOwner: user?.role === 'owner'
  };
};
