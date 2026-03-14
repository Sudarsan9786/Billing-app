import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/translations';

const BottomNav = ({ role = 'waiter' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useAuth();
  const lang = language || 'en';
  const translations = t;

  const waiterTabs = [
    { path: '/tables', icon: 'receipt_long', label: translations('orders', lang) },
    { path: '/menu', icon: 'menu_book', label: translations('menu', lang) },
    { path: '/history', icon: 'payments', label: translations('bills', lang) },
    { path: '/tables', icon: 'dashboard', label: translations('tables', lang) },
  ];

  const ownerTabs = [
    { path: '/dashboard', icon: 'dashboard', label: translations('dashboard', lang) },
    { path: '/history', icon: 'receipt_long', label: translations('orders', lang) },
    { path: '/menu-management', icon: 'restaurant_menu', label: translations('menu', lang) },
    { path: '/settings', icon: 'settings', label: translations('settings', lang) },
  ];

  const tabs = role === 'owner' ? ownerTabs : waiterTabs;

  const isActive = (path) => {
    if (path === '/menu') {
      return location.pathname === '/menu';
    }
    if (path === '/tables') {
      return location.pathname === '/tables' || location.pathname.startsWith('/order/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-background-dark/95 px-2 pb-6 pt-3 backdrop-blur-md max-w-[430px] mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`flex flex-1 flex-col items-center gap-1 transition-colors ${
            isActive(tab.path)
              ? 'text-primary'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <div className={`flex h-10 w-16 items-center justify-center rounded-full ${
            isActive(tab.path) ? 'bg-primary/10' : ''
          }`}>
            <span
              className={`material-symbols-outlined text-[28px] ${
                isActive(tab.path) ? '' : ''
              }`}
              style={isActive(tab.path) ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {tab.icon}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wide">
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;

