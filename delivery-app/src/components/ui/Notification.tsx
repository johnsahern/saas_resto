import { useEffect } from 'react';
import { useUiStore, NotificationType } from '../../store/uiStore';

interface NotificationProps {
  id: string;
  message: string;
  type: NotificationType;
  onDismiss: (id: string) => void;
}

const Notification = ({ id, message, type, onDismiss }: NotificationProps) => {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'info':
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  return (
    <div className={`${getBackgroundColor()} px-4 py-3 rounded relative border-l-4 mb-3`}>
      <span className="block sm:inline">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
      >
        <svg
          className="fill-current h-6 w-6"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Fermer</title>
          <path
            d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
          />
        </svg>
      </button>
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications, dismissNotification } = useUiStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 w-72 z-50">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
