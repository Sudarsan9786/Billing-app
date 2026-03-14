import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { t } from '../utils/translations';
import toast from 'react-hot-toast';

const MenuItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    name_tamil: '',
    price: '',
    category_id: '',
    is_vegetarian: true,
    is_available: true,
    image: null,
    imagePreview: null,
  });
  const lang = language || 'en';
  const translations = t;

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchItem();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/menu/categories');
      setCategories(response.data);
      if (response.data.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: response.data[0].id }));
      }
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchItem = async () => {
    try {
      const response = await api.get(`/menu/all`);
      const item = response.data.find((i) => i.id === id);
      if (item) {
        setFormData({
          name: item.name || '',
          name_tamil: item.name_tamil || '',
          price: item.price || '',
          category_id: item.category_id || '',
          is_vegetarian: item.is_vegetarian !== false,
          is_available: item.is_available !== false,
          image: null,
          imagePreview: item.image_url || null,
        });
      }
    } catch (error) {
      toast.error('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('name_tamil', formData.name_tamil);
      submitData.append('price', formData.price);
      submitData.append('category_id', formData.category_id);
      submitData.append('is_vegetarian', formData.is_vegetarian);
      submitData.append('is_available', formData.is_available);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (isEdit) {
        await api.put(`/menu/items/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Item updated successfully!');
      } else {
        await api.post('/menu/items', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Item added successfully!');
      }

      navigate('/menu-management');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save item');
    } finally {
      setSaving(false);
    }
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
      <header className="flex items-center p-4 justify-between border-b border-primary/10">
        <button onClick={() => navigate(-1)} className="text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold">
          {isEdit ? translations('editItem', lang) : translations('addItem', lang)}
        </h1>
        <div className="w-10"></div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-6 space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">
            {translations('addPhoto', lang)}
          </label>
          <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center">
            {formData.imagePreview ? (
              <img
                src={formData.imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            ) : (
              <span className="material-symbols-outlined text-6xl text-primary/50 mb-4">camera_alt</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-lg cursor-pointer hover:bg-primary/20"
            >
              {formData.imagePreview ? 'Change Photo' : translations('addPhoto', lang)}
            </label>
          </div>
        </div>

        {/* Name (English) */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">
            {translations('itemName', lang)} (English)
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Masala Dosa"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        {/* Name (Tamil) */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">
            {translations('itemNameTamil', lang)}
          </label>
          <input
            type="text"
            value={formData.name_tamil}
            onChange={(e) => setFormData({ ...formData, name_tamil: e.target.value })}
            placeholder="e.g. மசாலா தோசை"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">
            {translations('price', lang)} (₹)
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 85"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700">
            {translations('category', lang)}
          </label>
          <select
            required
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/50"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vegetarian Toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
          <div>
            <p className="font-medium text-slate-900">{translations('vegetarian', lang)}</p>
            <p className="text-xs text-slate-500">Is this item vegetarian?</p>
          </div>
          <label className="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-200 p-1 has-[:checked]:bg-primary">
            <input
              type="checkbox"
              checked={formData.is_vegetarian}
              onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
              className="sr-only peer"
            />
            <div className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></div>
          </label>
        </div>

        {/* Available Toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
          <div>
            <p className="font-medium text-slate-900">{translations('availableToday', lang)}</p>
            <p className="text-xs text-slate-500">Show in menu</p>
          </div>
          <label className="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-200 p-1 has-[:checked]:bg-primary">
            <input
              type="checkbox"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="sr-only peer"
            />
            <div className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></div>
          </label>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : translations('save', lang)}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold active:scale-95"
          >
            {translations('cancel', lang)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemForm;

