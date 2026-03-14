import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { t } from '../utils/translations';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const { user, language } = useAuth();
  const [stats, setStats] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const lang = language || 'en';
  const translations = t;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, hourlyRes, topItemsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/hourly'),
        api.get('/dashboard/top-items'),
      ]);

      setStats(statsRes.data);
      setHourlyData(hourlyRes.data);
      setTopItems(topItemsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? translations('goodMorning', lang) : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <header className="flex items-center bg-background p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="text-primary flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <span className="material-symbols-outlined">menu</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold">
            {translations('dashboard', lang)} / {translations('dashboard', lang === 'en' ? 'ta' : 'en')}
          </h2>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined">notifications</span>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {/* Greeting */}
        <div className="p-4">
          <h1 className="text-xl font-bold text-slate-900">
            {greeting}, {user?.name || 'Anna'}!
          </h1>
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 px-4 mb-6">
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-primary/10 border border-primary/20">
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{translations('todaysSales', lang)}</p>
            <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold">₹{stats.today_sales.toFixed(0)}</p>
            {stats.sales_change_percent > 0 && (
              <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                +{stats.sales_change_percent}% {translations('vsYesterday', lang)}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-primary/10 border border-primary/20">
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{translations('bills', lang)}</p>
            <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold">{stats.today_bills}</p>
            {stats.bills_change_percent > 0 && (
              <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                +{stats.bills_change_percent}% {translations('vsYesterday', lang)}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-primary/10 border border-primary/20">
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{translations('active', lang)}</p>
            <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold">{stats.active_tables}</p>
          </div>
        </div>

        {/* Hourly Sales Chart */}
        <div className="px-4 py-6">
          <div className="flex flex-col gap-4 rounded-xl p-5 bg-white dark:bg-slate-800 border border-primary/5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-900 dark:text-slate-100 text-base font-bold">{translations('todaysRevenue', lang)}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Hourly performance</p>
              </div>
              <div className="text-right">
                <p className="text-primary text-xl font-bold">₹{stats.today_sales.toFixed(0)}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="amount" fill="#e65000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items */}
        <div className="px-4 pb-8">
          <div className="flex flex-col gap-4 rounded-xl p-5 bg-white dark:bg-slate-800 border border-primary/5 shadow-sm">
            <p className="text-slate-900 dark:text-slate-100 text-base font-bold">{translations('topItems', lang)}</p>
            <div className="space-y-3">
              {topItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
                    {item.name_tamil && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.name_tamil}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{item.order_count} {translations('orders', lang)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNav role="owner" />
    </div>
  );
};

export default OwnerDashboard;

