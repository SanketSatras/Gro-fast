/**
 * Notification Service for Grofast
 * Handles permission requests and local browser notifications
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return false;
  }

  if (Notification.permission === 'granted') return true;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendLocalNotification = async (title: string, options?: NotificationOptions) => {
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission && 'serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      icon: '/icon-512.png',
      badge: '/icon-512.png',
      ...options
    });
  }
};

// Auto-request for vendors on dashboard load
export const initNotifications = () => {
  if (typeof window !== 'undefined') {
    requestNotificationPermission();
  }
};
