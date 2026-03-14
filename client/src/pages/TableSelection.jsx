import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { t } from '../utils/translations';
import toast from 'react-hot-toast';

const TableSelection = () => {
  const navigate = useNavigate();
  const { user, language, toggleLanguage, logout } = useAuth();
  const socket = useSocket();
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState({ available: 0, occupied: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const lang = language || 'en';
  const translations = t;

  useEffect(() => {
    fetchTables();
    fetchStats();

    if (socket) {
      socket.on('table:updated', () => {
        fetchTables();
        fetchStats();
      });
    }

    return () => {
      if (socket) {
        socket.off('table:updated');
      }
    };
  }, [socket]);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/tables/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleTableClick = (table) => {
    navigate(`/order/${table.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <header className="flex items-center justify-between bg-white dark:bg-background-dark/50 border-b border-primary/10 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/menu')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {translations('selectTableTitle', lang)}
            </h1>
            <p className="text-xs font-medium text-primary/70">
              {translations('selectTableTitle', lang === 'en' ? 'ta' : 'en')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toast('Notifications coming soon!', { icon: '🔔' })}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Do you want to logout?')) {
                logout();
                navigate('/');
              }
            }}
            className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-primary">account_circle</span>
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="mb-6 flex gap-3 p-4">
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/20 p-4 border border-green-200">
          <span className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.available}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-green-600 dark:text-green-500">
            {translations('available', lang)}
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/20 p-4 border border-orange-200">
          <span className="text-2xl font-bold text-primary">{stats.occupied}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-primary/80">
            {translations('occupied', lang)}
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4 border border-slate-200">
          <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">{stats.total}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            {translations('total', lang)}
          </span>
        </div>
      </div>

      {/* Section Label */}
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
          {translations('diningHall', lang)}
        </h2>
        <div className="flex items-center gap-1 text-xs font-medium text-primary">
          <span className="material-symbols-outlined text-sm">filter_list</span>
          <span>{translations('allTables', lang)}</span>
        </div>
      </div>

      {/* Table Grid */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`relative flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl p-4 border-2 shadow-sm transition-transform active:scale-95 ${
                table.status === 'available'
                  ? 'bg-white dark:bg-slate-800/40 border-green-500'
                  : 'bg-white dark:bg-slate-800/40 border-primary'
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  table.status === 'available'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-500'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">
                  {table.status === 'available' ? 'restaurant' : 'group'}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-400">{translations('table', lang)}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{table.table_number}</p>
              </div>
              <div
                className={`absolute top-3 right-3 h-3 w-3 rounded-full ${
                  table.status === 'available' ? 'bg-green-500' : 'bg-primary animate-pulse'
                }`}
              />
              {table.status === 'occupied' && table.current_bill_amount > 0 && (
                <div className="mt-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                  ₹{parseFloat(table.current_bill_amount).toFixed(0)}
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      <BottomNav role="waiter" />
    </div>
  );
};

export default TableSelection;

