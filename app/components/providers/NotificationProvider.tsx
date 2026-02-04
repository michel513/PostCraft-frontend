import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
} from 'react';
import {
    CircleCheckBig,
    XCircle,
    AlertTriangle,
    X,
    Circle,
} from 'lucide-react';

interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface NotificationContextType {
    addNotification: (
        message: string,
        type: Notification['type'],
        duration?: number
    ) => void;
}

// Créer le contexte avec une valeur par défaut
const NotificationContext = createContext<NotificationContextType>({
    addNotification: () => {
        console.warn('NotificationProvider not found');
    },
});

const NotificationItem: React.FC<{
    notification: Notification;
    onRemove: (id: number) => void;
}> = ({ notification, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const removeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasBeenRemoved = useRef(false);

    // Animation d'entrée
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const handleRemove = useCallback(() => {
        if (hasBeenRemoved.current) return;

        hasBeenRemoved.current = true;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setIsRemoving(true);

        removeTimerRef.current = setTimeout(() => {
            onRemove(notification.id);
        }, 300);
    }, [notification.id, onRemove]);

    // Auto-remove avec duration
    useEffect(() => {
        if (notification.duration && notification.duration > 0) {
            timerRef.current = setTimeout(() => {
                if (!hasBeenRemoved.current) {
                    handleRemove();
                }
            }, notification.duration);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [notification.duration, handleRemove]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (removeTimerRef.current) {
                clearTimeout(removeTimerRef.current);
            }
        };
    }, []);

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <CircleCheckBig className="w-5 h-5 text-green-600" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-600" />;
            case 'info':
                return <Circle className="w-5 h-5 text-blue-600" />;
            default:
                return <Circle className="w-5 h-5 text-blue-600" />;
        }
    };

    const getStyles = () => {
        const baseStyles = 'shadow-lg border backdrop-blur-sm';
        switch (notification.type) {
            case 'success':
                return `${baseStyles} bg-white/95 border-green-200 text-green-800`;
            case 'error':
                return `${baseStyles} bg-white/95 border-red-200 text-red-800`;
            case 'warning':
                return `${baseStyles} bg-white/95 border-amber-200 text-amber-800`;
            case 'info':
                return `${baseStyles} bg-white/95 border-blue-200 text-blue-800`;
            default:
                return `${baseStyles} bg-white/95 border-gray-200 text-gray-800`;
        }
    };

    return (
        <div
            className={`
        mb-3 max-w-sm w-full transform transition-all duration-300 ease-out
        ${isVisible && !isRemoving
                    ? 'translate-x-0 opacity-100 scale-100'
                    : 'translate-x-full opacity-0 scale-95'
                }
      `}
        >
            <div
                className={`rounded-xl p-4 ${getStyles()} group hover:shadow-xl transition-shadow duration-200`}
            >
                <div className="flex items-start space-x-3">
                    <div className="shrink-0 mt-0.5">{getIcon()}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-5">
                            {notification.message}
                        </p>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="shrink-0 ml-2 p-1.5 rounded-lg transition-colors duration-200 hover:bg-blue-600/5 opacity-0 group-hover:opacity-100"
                        aria-label="Fermer la notification"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Barre de progression */}
                {notification.duration && notification.duration > 0 && (
                    <div className="mt-3 w-full bg-blue-600/10 rounded-full h-1 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ease-linear ${notification.type === 'success'
                                ? 'bg-green-500'
                                : notification.type === 'error'
                                    ? 'bg-red-500'
                                    : notification.type === 'warning'
                                        ? 'bg-amber-500'
                                        : 'bg-blue-500'
                                }`}
                            style={{
                                animation: `shrink ${notification.duration}ms linear forwards`,
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export const NotificationProvider: React.FC<{
    children: React.ReactNode;
    initialFlashMessage?: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
}> = ({
    children,
    initialFlashMessage,
}) => {
        const [notifications, setNotifications] = useState<Notification[]>([]);
        const nextIdRef = useRef(1);

        const addNotification = useCallback(
            (message: string, type: Notification['type'], duration = 4000) => {
                const newNotification: Notification = {
                    id: nextIdRef.current,
                    message,
                    type,
                    duration,
                };

                setNotifications((prev) => [...prev, newNotification]);
                nextIdRef.current += 1;
            },
            []
        );

        const removeNotification = useCallback((id: number) => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, []);

        // Display initial flash message if provided
        useEffect(() => {
            if (initialFlashMessage) {
                addNotification(initialFlashMessage.message, initialFlashMessage.type, 4000);
            }
        }, [initialFlashMessage, addNotification]);

        // Valeur stable du contexte
        const contextValue = useCallback(
            () => ({
                addNotification,
            }),
            [addNotification]
        );

        return (
            <NotificationContext.Provider value={contextValue()}>
                {/* Container des notifications */}
                <div className="fixed top-4 right-4 z-9999 pointer-events-none">
                    <div className="flex flex-col items-end space-y-0 pointer-events-auto">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRemove={removeNotification}
                            />
                        ))}
                    </div>
                </div>

                {/* Styles CSS pour les animations */}
                <style>{`
        @keyframes shrink {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>

                {children}
            </NotificationContext.Provider>
        );
    };

export const useNotification = () => {
    const context = useContext(NotificationContext);

    // Protection supplémentaire
    if (!context) {
        console.warn(
            'useNotification doit être utilisé dans un NotificationProvider'
        );
        return {
            addNotification: (
                message: string,
                type: Notification['type'],
                duration = 4000
            ) => {
                console.warn('NotificationProvider not available:', {
                    message,
                    type,
                    duration,
                });
            },
        };
    }

    return context;
};