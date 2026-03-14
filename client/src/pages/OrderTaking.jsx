import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import { t } from '../utils/translations';
import toast from 'react-hot-toast';

const OrderTaking = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const addItem = (item) => {
    setOrderItems((prev) => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1,
      },
    }));
  };

  const removeItem = (itemId) => {
    setOrderItems((prev) => {
      const newItems = { ...prev };
      if (newItems[itemId].quantity > 1) {
        newItems[itemId].quantity -= 1;
      } else {
        delete newItems[itemId];
      }
      return newItems;
    });
  };

  const getTotal = () => {
    return Object.values(orderItems).reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return Object.values(orderItems).reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmit = async () => {
    if (Object.keys(orderItems).length === 0) {
      toast.error('Please add items to order');
      return;
    }

    setSubmitting(true);
    try {
      const items = Object.values(orderItems).map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
      }));

      await api.post('/orders', {
        table_id: tableId,
        items,
      });

      toast.success('Order submitted successfully!');
      navigate('/tables');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit order');
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-background flex flex-col pb-40">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between border-b border-primary/10">
        <button onClick={() => navigate('/tables')} className="text-slate-900 dark:text-slate-100">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 px-2">
          <h2 className="text-lg font-bold leading-tight">Annapoorna Menu</h2>
          <p className="text-xs text-primary font-medium">Table #12 • Guest: 4</p>
        </div>
        <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary">
          <span className="material-symbols-outlined">history</span>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-40">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          {translations('popularItems', lang)} {menu.find((c) => c.id === selectedCategory)?.name || ''} {translations('items', lang)}
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
            {orderItems[item.id] ? (
              <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-1">
                <button
                  onClick={() => removeItem(item.id)}
                  className="size-7 rounded-md bg-white dark:bg-background-dark text-primary flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <span className="font-bold text-primary w-4 text-center">{orderItems[item.id].quantity}</span>
                <button
                  onClick={() => addItem(item)}
                  className="size-7 rounded-md bg-primary text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => addItem(item)}
                className="bg-primary text-white flex items-center justify-center size-9 rounded-lg shadow-lg shadow-primary/20 active:scale-95"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Floating Order Summary */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between max-w-[430px] mx-auto">
          <div className="flex flex-col">
            <p className="text-xs text-slate-400 font-medium">
              {getItemCount()} {translations('itemsAdded', lang)}
            </p>
            <p className="text-lg font-bold">
              {translations('total', lang)}: ₹{getTotal().toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-50"
          >
            <span>{translations('submitOrder', lang)}</span>
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      )}

      <BottomNav role="waiter" />
    </div>
  );
};

export default OrderTaking;

