import React, { useState } from 'react';
import { Icon } from '@synapse/ui';

interface CreditCardFormProps {
  planName: string;
  price: string;
  onConfirm: (details: any) => Promise<void>;
  onCancel: () => void;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({ 
  planName, 
  price, 
  onConfirm, 
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    setFormData({ ...formData, cardNumber: value });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData({ ...formData, expiry: value.slice(0, 5) });
  };

  return (
    <div className="bg-slate-900 overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold text-white">Payment Details</h2>
          <span className="text-xs font-medium px-2 py-1 bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/20">
            {planName} Plan
          </span>
        </div>
        <p className="text-slate-400 text-sm">You will be charged {price} per month.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Visual Card Preview */}
        <div className="relative h-44 w-full bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl border border-slate-700/50 p-6 flex flex-col justify-between shadow-2xl overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-8 bg-slate-700/50 rounded-md backdrop-blur-sm border border-slate-600/30" />
            <Icon type="credit_card" className="text-slate-500 !text-[24px]" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="text-xl font-medium tracking-[0.2em] text-white/90 font-mono">
              {formData.cardNumber || '•••• •••• •••• ••••'}
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Card Holder</div>
                <div className="text-xs text-white/80 font-medium truncate max-w-[150px]">
                  {formData.name || 'YOUR NAME'}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Expires</div>
                <div className="text-xs text-white/80 font-medium font-mono">
                  {formData.expiry || 'MM/YY'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cardholder Name</label>
            <input 
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all outline-none"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Card Number</label>
            <div className="relative">
              <input 
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all outline-none font-mono"
                placeholder="0000 0000 0000 0000"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
              />
              <Icon type="lock" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 !text-[16px]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
              <input 
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all outline-none font-mono"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={handleExpiryChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CVC</label>
              <input 
                required
                maxLength={4}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all outline-none font-mono"
                placeholder="•••"
                value={formData.cvc}
                onChange={e => setFormData({ ...formData, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-sky-400 to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-900/20 hover:from-sky-500 hover:to-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Icon type="sync" className="animate-spin !text-[18px]" /> Processing...
              </>
            ) : (
              <>Pay {price}</>
            )}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            Cancel and Return
          </button>
        </div>
      </form>
    </div>
  );
};
