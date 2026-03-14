import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { t } from '../utils/translations';
import toast from 'react-hot-toast';

const MenuBrowse = () => {
  const navigate = useNavigate();
  const { language } = useAuth();
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const lang = language || 'en';
  const translations = t;

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await api.get('/menu');
      setMenu(response.data);
      if (response.data.length > 0) {
        setSelectedCategory(response.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filteredMenu = menu
    .filter((category) => !selectedCategory || category.id === selectedCategory)
    .flatMap((category) => category.items)
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name_tamil && item.name_tamil.includes(searchQuery))
    );

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
      <div className="flex items-center bg-background p-4 pb-2 justify-between border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined">menu</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Annapoorna Menu</h1>
            <p className="text-xs text-primary font-medium">{translations('menu', lang)}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/tables')}
          className="text-slate-600"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-background">
        <div className="flex w-full flex-1 items-stretch rounded-lg h-11 bg-primary/5 border border-primary/10">
          <div className="text-primary flex items-center justify-center pl-4">
            <span className="material-symbols-outlined text-xl">search</span>
          </div>
          <input
            className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-primary/50 px-3 text-base"
            placeholder={translations('searchMenuItems', lang)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-background border-b border-primary/10 overflow-x-auto no-scrollbar">
        <div className="flex px-4 gap-6 min-w-max">
          {menu.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 ${
                selectedCategory === category.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500'
              }`}
            >
              <p className="text-sm font-bold">{category.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          {menu.find((c) => c.id === selectedCategory)?.name || ''} {translations('items', lang)}
        </h3>
        {filteredMenu.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-primary/5 rounded-xl border border-primary/5 shadow-sm"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm border border-green-600 flex items-center justify-center p-[2px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                </span>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.name}</h4>
              </div>
              {item.name_tamil && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.name_tamil}</p>
              )}
              <p className="text-primary font-bold mt-1">₹{parseFloat(item.price).toFixed(2)}</p>
            </div>
          </div>
        ))}
        {filteredMenu.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">restaurant_menu</span>
            <p className="text-slate-500">No items found</p>
          </div>
        )}
      </div>

      <BottomNav role="waiter" />
    </div>
  );
};

export default MenuBrowse;

