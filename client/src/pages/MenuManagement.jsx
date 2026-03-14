import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { t } from '../utils/translations';
import toast from 'react-hot-toast';

const MenuManagement = () => {
  const navigate = useNavigate();
  const { language } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const lang = language || 'en';
  const translations = t;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/menu/all'),
        api.get('/menu/categories'),
      ]);
      setMenuItems(itemsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (itemId) => {
    try {
      await api.patch(`/menu/items/${itemId}/toggle`);
      fetchData();
      toast.success('Availability updated');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/menu/items/${itemId}`);
      fetchData();
      toast.success('Item deleted');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name_tamil && item.name_tamil.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

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
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-primary">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold">{translations('menuManagement', lang)}</h1>
          </div>
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/10">
              <span className="material-symbols-outlined text-slate-600">sync</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-primary">search</span>
            <input
              type="text"
              placeholder={translations('searchDishes', lang)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border-none bg-primary/5 focus:ring-2 focus:ring-primary/50 text-base placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex h-9 shrink-0 items-center justify-center px-4 rounded-full text-sm font-semibold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-primary/10 text-primary border border-primary/10'
            }`}
          >
            {translations('allItems', lang)}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex h-9 shrink-0 items-center justify-center px-4 rounded-full text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-primary/10 text-primary border border-primary/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Items List */}
      <main className="flex-1 px-4 py-2 space-y-4 pb-24">
        <p className="text-sm text-slate-500 px-2">
          {filteredItems.length} {translations('itemsCount', lang)}
        </p>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-primary/5 shadow-sm flex items-center gap-4 ${
              !item.is_available ? 'opacity-60' : ''
            }`}
          >
            <div
              className="h-16 w-16 rounded-lg bg-primary/5 flex items-center justify-center overflow-hidden shrink-0 border border-primary/10 bg-cover bg-center"
              style={item.image_url ? { backgroundImage: `url(${item.image_url})` } : {}}
            >
              {!item.image_url && (
                <span className="material-symbols-outlined text-primary text-2xl">restaurant</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    {item.name} {item.name_tamil && `(${item.name_tamil})`}
                  </h3>
                  <p className="text-primary font-bold text-lg">₹{parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/menu-item/edit/${item.id}`)}
                    className="p-2 text-slate-400 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">
                  {item.category_name}
                </span>
                <label className="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-200 p-1 has-[:checked]:bg-primary">
                  <input
                    type="checkbox"
                    checked={item.is_available}
                    onChange={() => handleToggle(item.id)}
                    className="sr-only peer"
                  />
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => navigate('/menu-item/add')}
        className="fixed right-6 bottom-24 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:scale-110 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      <BottomNav role="owner" />
    </div>
  );
};

export default MenuManagement;

