import { useState, FormEvent } from 'react';
import { 
  Settings, 
  HelpCircle, 
  RotateCcw, 
  Save, 
  CheckCircle,
  Mail,
  Building,
  DollarSign,
  Percent,
  Truck,
  Sliders,
  Database
} from 'lucide-react';
import { StoreSettings } from '../types';

interface SystemSettingsProps {
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
  onResetDatabase: () => void;
}

export default function SystemSettings({ 
  settings, 
  onUpdateSettings,
  onResetDatabase
}: SystemSettingsProps) {
  
  // States
  const [storeName, setStoreName] = useState(settings.storeName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [currency, setCurrency] = useState(settings.currency);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [shippingFee, setShippingFee] = useState(settings.shippingFee);
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      storeName,
      supportEmail,
      currency,
      taxRate: Number(taxRate) || 0,
      shippingFee: Number(shippingFee) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 0
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetClick = () => {
    if (window.confirm('Are you sure you want to restore the database to its default factory seed data? This will erase any local custom edits, additions, and status changes.')) {
      onResetDatabase();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
      
      // reload settings state from refreshed values
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <div className="space-y-6" id="system-settings-panel">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight" id="settings-heading">
          System Control Panel
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Adjust store metadata, tax values, delivery pricing, and manage local database sandboxes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form Column */}
        <div className="lg:col-span-2 bg-white border border-zinc-150 rounded-2xl p-6 shadow-3xs">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-zinc-100">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-zinc-900 text-sm">Store Variables & Configuration</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Store Profile Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-zinc-400" />
                  Store Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800 font-semibold"
                  id="settings-store-name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  Operations Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                  id="settings-support-email"
                />
              </div>
            </div>

            {/* Financial variables */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                  Currency Base
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                  id="settings-currency"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-zinc-400" />
                  VAT / Sales Tax %
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800 font-mono"
                  id="settings-tax-rate"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-zinc-400" />
                  Flat Shipping Fee
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={shippingFee}
                  onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800 font-mono"
                  id="settings-shipping"
                />
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-zinc-800">Inventory Low-Stock Threshold</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Triggers urgent warning badges and home screen priority restock alerts.</p>
              </div>
              <input
                type="number"
                min="1"
                required
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 5)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-white focus:outline-none transition-all text-zinc-800 font-mono text-center"
                id="settings-threshold"
              />
            </div>

            {/* Form Actions Footer */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center">
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 animate-fade-in">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Configuration Saved
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-indigo-600/10 cursor-pointer"
                id="btn-settings-submit"
              >
                <Save className="w-4 h-4" />
                Commit Variables
              </button>
            </div>
          </form>
        </div>

        {/* Database Management / Reset Column */}
        <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-6 flex flex-col justify-between h-fit">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
              <Database className="w-5 h-5 text-zinc-500" />
              <h3 className="font-bold text-zinc-900 text-sm">Sandbox Maintenance</h3>
            </div>
            
            <p className="text-xs text-zinc-500 leading-relaxed mt-4">
              This system utilizes standard client-side sandbox containers connected to local browser memory engines. If you would like to void all records, sales, checkouts, and customer profiles, you can initiate a database restore.
            </p>

            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl mt-4 text-[11px] text-amber-800 leading-normal flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Restoring factory default models will repopulate original sample products (curved screen, monitors, chairs) and refresh checkout metrics for presentation purposes.
              </span>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={handleResetClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-zinc-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-zinc-600 hover:text-rose-600 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-3xs"
              id="btn-reset-db"
            >
              <RotateCcw className="w-4 h-4" />
              Restore Original Seeds
            </button>
            
            {resetSuccess && (
              <p className="text-[10px] text-center text-emerald-600 font-semibold mt-2">
                Rebuilding collections. Reloading app...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
