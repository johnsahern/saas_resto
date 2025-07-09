
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StaffSuccessMessageProps {
  memberName: string;
  onDismiss: () => void;
}

export const StaffSuccessMessage: React.FC<StaffSuccessMessageProps> = ({
  memberName,
  onDismiss
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        {memberName} a été ajouté avec succès à l'équipe !
      </AlertDescription>
    </Alert>
  );
};
