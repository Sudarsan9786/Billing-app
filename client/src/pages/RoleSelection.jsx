import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/translations';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/login', { state: { role: selectedRole } });
    }
  };

  const lang = language || 'en';
  const translations = t;

  return (
    <div className="min-h-screen bg-background flex flex-col fade-in">
      {/* Header */}
      <nav className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            restaurant_menu
          </span>
          <h1 className="text-xl font-bold text-slate-900">Annapoorna</h1>
        </div>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-primary text-sm">language</span>
          <p className="text-primary text-sm font-bold">{lang === 'en' ? 'தமிழ்' : 'ENG'}</p>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-8 text-slate-900">
          {translations('whoAreYou', lang)} / {translations('whoAreYou', lang === 'en' ? 'ta' : 'en')}
        </h2>

        {/* Role Cards */}
        <div className="space-y-4 mb-8">
          {/* Owner Card */}
          <button
            onClick={() => setSelectedRole('owner')}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              selectedRole === 'owner'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-slate-200 bg-white hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="material-symbols-outlined text-primary text-3xl">account_circle</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {translations('owner', lang)} / {translations('owner', lang === 'en' ? 'ta' : 'en')}
                </h3>
                <p className="text-sm text-slate-600">
                  {translations('ownerDesc', lang)}
                </p>
              </div>
              {selectedRole === 'owner' && (
                <span className="material-symbols-outlined text-primary">check_circle</span>
              )}
            </div>
          </button>

          {/* Waiter Card */}
          <button
            onClick={() => setSelectedRole('waiter')}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              selectedRole === 'waiter'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-slate-200 bg-white hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="material-symbols-outlined text-primary text-3xl">room_service</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {translations('waiter', lang)} / {translations('waiter', lang === 'en' ? 'ta' : 'en')}
                </h3>
                <p className="text-sm text-slate-600">
                  {translations('waiterDesc', lang)}
                </p>
              </div>
              {selectedRole === 'waiter' && (
                <span className="material-symbols-outlined text-primary">check_circle</span>
              )}
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            selectedRole
              ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 active:scale-95'
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          {translations('continue', lang)} / {translations('continue', lang === 'en' ? 'ta' : 'en')}
        </button>
      </main>
    </div>
  );
};

export default RoleSelection;

