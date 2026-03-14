import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { t } from '../utils/translations';
import toast from 'react-hot-toast';

const BillDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { language } = useAuth();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const lang = language || 'en';
  const translations = t;

  useEffect(() => {
    fetchBill();
  }, [orderId]);

  const fetchBill = async () => {
    try {
      // First generate bill if it doesn't exist
      const generateRes = await api.post(`/bills/generate/${orderId}`);
      setBill(generateRes.data);
    } catch (error) {
      // If bill exists, fetch it
      try {
        const response = await api.get(`/bills/${orderId}`);
        setBill(response.data);
      } catch (err) {
        toast.error('Failed to load bill');
        navigate(-1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!bill) return;

    setPaying(true);
    try {
      await api.patch(`/bills/${bill.id}/pay`, { payment_method: 'cash' });
      toast.success('Bill marked as paid!');
      navigate('/tables');
    } catch (error) {
      toast.error('Failed to mark bill as paid');
    } finally {
      setPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (bill) {
      const text = `Bill #${bill.bill_number}\nTotal: ₹${bill.total_amount.toFixed(2)}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  if (loading || !bill) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto shadow-xl">
      {/* Header */}
      <div className="flex items-center bg-white p-4 border-b border-primary/10 justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 text-lg font-bold flex-1 text-center pr-10">
          {translations('billDetails', lang)} / {translations('billDetails', lang === 'en' ? 'ta' : 'en')}
        </h2>
      </div>

      {/* Order Info */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded mb-2">
              {translations('dineIn', lang)}
            </span>
            <p className="text-2xl font-bold text-slate-900">Table {bill.order?.table_number || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">{translations('orderNumber', lang)}</p>
            <p className="text-sm font-bold text-slate-900">{bill.bill_number}</p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(bill.order?.created_at || bill.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="px-6 py-4 space-y-3">
        {bill.items?.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100">
            <div className="flex-1">
              <p className="font-medium text-slate-900">{item.item_name}</p>
              {item.item_name_tamil && (
                <p className="text-xs text-slate-500">{item.item_name_tamil}</p>
              )}
              <p className="text-xs text-primary mt-1">
                {translations('quantity', lang)}: {item.quantity} × ₹{parseFloat(item.unit_price).toFixed(2)}
              </p>
            </div>
            <p className="font-bold text-slate-900">₹{parseFloat(item.total_price).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-6 py-4 space-y-2 border-t border-slate-200">
        <div className="flex justify-between text-slate-600">
          <span>{translations('subtotal', lang)}</span>
          <span>₹{parseFloat(bill.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>{translations('gst', lang)}</span>
          <span>₹{parseFloat(bill.gst_amount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-2xl font-bold text-primary pt-2 border-t border-slate-200">
          <span>{translations('total', lang)}</span>
          <span>₹{parseFloat(bill.total_amount).toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-8 pt-4 space-y-3">
        {bill.status === 'unpaid' && (
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">check_circle</span>
            {translations('markAsPaid', lang)}
          </button>
        )}
        <button
          onClick={handlePrint}
          className="w-full py-3 border-2 border-primary text-primary rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined">print</span>
          {translations('printBill', lang)}
        </button>
        <button
          onClick={handleShare}
          className="w-full py-3 border-2 border-primary text-primary rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined">share</span>
          {translations('shareWhatsApp', lang)}
        </button>
      </div>
    </div>
  );
};

export default BillDetails;

