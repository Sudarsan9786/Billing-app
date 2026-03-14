import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { t } from '../utils/translations';
import toast from 'react-hot-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { user, restaurant, language, toggleLanguage, logout } = useAuth();
  const lang = language || 'en';
  const translations = t;

  const handleLogout = () => {
    if (window.confirm('Do you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <header className="flex items-center bg-background p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold">
            {translations('settings', lang)} / {translations('settings', lang === 'en' ? 'ta' : 'en')}
          </h2>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-4">
        {/* Restaurant Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-primary/5 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Restaurant Information</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-500">Restaurant Name</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{restaurant?.name || 'Annapoorna'}</p>
              {restaurant?.name_tamil && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{restaurant.name_tamil}</p>
              )}
            </div>
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-500">Restaurant ID</p>
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400">{restaurant?.id || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-primary/5 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3">Account Information</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-500">Name</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Role</p>
              <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">{user?.role || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-primary/5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Language / மொழி</h3>
              <p className="text-xs text-slate-500">Change interface language</p>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-primary text-sm">language</span>
              <p className="text-primary text-sm font-bold">{language === 'en' ? 'தமிழ்' : 'ENG'}</p>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-primary/5 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3">About</h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>Annapoorna Restaurant Management System</p>
            <p className="text-xs">Version 1.0.0</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-500 text-white rounded-xl font-bold active:scale-95 transition-transform mt-4"
        >
          Logout / வெளியேறு
        </button>
      </main>

      <BottomNav role="owner" />
    </div>
  );
};

export default Settings;

