import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';

export const useMobile = () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform(); // 'android', 'ios', 'web'
  
  return { isNative, platform };
};

export const useNetwork = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
      } catch (error) {
        // Fallback for web
        setIsOnline(navigator.onLine);
      }
    };

    checkNetwork();

    const listener = Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected);
    });

    // Web fallback
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      listener.then(l => l.remove()).catch(() => {});
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};

export const useBackButton = (callback) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener('backButton', callback);
    return () => {
      listener.then(l => l.remove()).catch(() => {});
    };
  }, [callback]);
};

