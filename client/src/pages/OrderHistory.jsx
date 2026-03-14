import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { t } from '../utils/translations';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { user, language } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const lang = language || 'en';
  const translations = t;

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const response = await api.get(`/orders/history?filter=${filter}&search=${searchQuery}`);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    return orders.reduce((sum, order) => sum + (parseFloat(order.bill_total || order.total_amount || 0)), 0);
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
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-primary">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold">{translations('orderHistory', lang)}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">account_circle</span>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['today', 'week', 'month'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {translations(f === 'today' ? 'today' : f === 'week' ? 'thisWeek' : 'thisMonth', lang)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder={translations('searchByTable', lang)}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setTimeout(() => fetchOrders(), 300);
            }}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white"
          />
        </div>
      </header>

      {/* Summary */}
      <div className="px-4 py-3 bg-primary text-white mx-4 rounded-lg mb-4">
        <p className="text-sm font-medium">
          {orders.length} {translations('billsTotal', lang)} ₹{getTotal().toFixed(2)}
        </p>
      </div>

      {/* Orders List */}
      <main className="flex-1 overflow-y-auto px-4 space-y-3 pb-24">
        {orders.map((order) => (
          <button
            key={order.id}
            onClick={() => navigate(`/bill/${order.id}`)}
            className="w-full p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-slate-900">{order.bill_number || `Order #${order.id.slice(0, 8)}`}</p>
                <p className="text-sm text-slate-500">Table {order.table_number}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">₹{parseFloat(order.bill_total || order.total_amount || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-400">
                  {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {order.items?.length || 0} {translations('items', lang)}
              </p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  order.bill_status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {order.bill_status === 'paid' ? translations('paid', lang) : translations('unpaid', lang)}
              </span>
            </div>
          </button>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">receipt_long</span>
            <p className="text-slate-500">No orders found</p>
          </div>
        )}
      </main>

      <BottomNav role={user?.role || 'waiter'} />
    </div>
  );
};

export default OrderHistory;

