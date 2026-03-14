import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PINPad from '../components/PINPad';
import { t } from '../utils/translations';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, language, toggleLanguage } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const role = location.state?.role || 'waiter';
  const lang = language || 'en';
  const translations = t;
  const RESTAURANT_ID = '550e8400-e29b-41d4-a716-446655440000';

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === 4) {
        handleSubmit(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleSubmit = async (pinToSubmit = pin) => {
    if (pinToSubmit.length !== 4) return;

    setLoading(true);
    const result = await login(RESTAURANT_ID, pinToSubmit, role);

    if (result.success) {
      toast.success('Login successful!');
      if (role === 'owner') {
        navigate('/dashboard');
      } else {
        navigate('/tables');
      }
    } else {
      setShake(true);
      toast.error(result.error || 'Invalid PIN');
      setPin('');
      setTimeout(() => setShake(false), 500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col fade-in">
      {/* Header */}
      <nav className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate('/')}
          className="text-slate-600"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5"
        >
          <span className="material-symbols-outlined text-primary text-sm">language</span>
          <p className="text-primary text-sm font-bold">{lang === 'en' ? 'தமிழ்' : 'ENG'}</p>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
          <span className="material-symbols-outlined text-primary text-4xl">restaurant_menu</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          {translations('welcomeBack', lang)} / {translations('welcomeBack', lang === 'en' ? 'ta' : 'en')}
        </h1>
        <p className="text-sm text-slate-600 mb-2 text-center">
          {translations('loggingInAs', lang)} {role === 'owner' ? translations('owner', lang) : translations('waiter', lang)}
        </p>
        <p className="text-sm text-slate-500 mb-8 text-center">
          {translations('enterPin', lang)}
        </p>

        {/* PIN Dots */}
        <div className={`flex gap-3 mb-8 ${shake ? 'shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-4 w-4 rounded-full border-2 transition-all ${
                index < pin.length
                  ? 'bg-primary border-primary'
                  : 'border-slate-300 bg-white'
              }`}
            />
          ))}
        </div>

        {/* PIN Pad */}
        {!loading && <PINPad onDigit={handleDigit} onBackspace={handleBackspace} />}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Login;

