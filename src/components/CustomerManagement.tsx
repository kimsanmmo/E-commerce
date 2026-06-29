import { useState, useMemo, FormEvent, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  X, 
  CheckCircle, 
  AlertOctagon,
  Ban,
  UserCheck,
  Plus,
  Tag,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, StoreSettings, Order, Product } from '../types';

interface CustomerManagementProps {
  customers: Customer[];
  orders: Order[];
  products: Product[];
  settings: StoreSettings;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpend'>) => void;
  onToggleCustomerStatus: (customerId: string) => void;
  initialSearchQuery?: string;
}

export default function CustomerManagement({ 
  customers, 
  orders,
  products,
  settings, 
  onAddCustomer, 
  onToggleCustomerStatus,
  initialSearchQuery = ''
}: CustomerManagementProps) {
  
  // States
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
    if (initialSearchQuery) {
      setStatusFilter('All');
    }
  }, [initialSearchQuery]);
  
  // Drawer states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Suspended'>('Active');

  // Filter Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    }).format(val);
  };

  const handleExportCSV = () => {
    // CSV Header
    const headers = ['Customer ID', 'Name', 'Email', 'Join Date', 'Status', 'Total Orders', 'Total Spend'];
    
    // Rows
    const rows = filteredCustomers.map(c => [
      c.id,
      c.name,
      c.email,
      new Date(c.joinDate).toLocaleDateString(),
      c.status,
      c.totalOrders,
      c.totalSpend
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(val => {
          const stringVal = val === undefined || val === null ? '' : String(val);
          // If value has quotes, commas, or newlines, escape it
          if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
            return `"${stringVal.replace(/"/g, '""')}"`;
          }
          return stringVal;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormAvatar('');
    setFormStatus('Active');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    // Use random handsome avatar if empty
    const avatarUrl = formAvatar.trim() || `https://images.unsplash.com/photo-${[
      '1534528741775-53994a69daeb',
      '1507003211169-0a1dd7228f2d',
      '1494790108377-be9c29b29330',
      '1500648767791-00dcc994a43e'
    ][Math.floor(Math.random() * 4)]}?w=150&auto=format&fit=crop&q=60`;

    onAddCustomer({
      name: formName,
      email: formEmail,
      avatar: avatarUrl,
      joinDate: new Date().toISOString(),
      status: formStatus
    });

    setIsFormOpen(false);
  };

  const getTopPurchasedCategory = (customerEmail: string) => {
    const customerOrders = orders.filter(
      o => o.customerEmail.toLowerCase() === customerEmail.toLowerCase() && o.status !== 'Cancelled'
    );

    if (customerOrders.length === 0) return null;

    const categoryCounts: { [category: string]: number } = {};

    customerOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase());
        const category = product ? product.category : 'General';
        categoryCounts[category] = (categoryCounts[category] || 0) + item.quantity;
      });
    });

    let topCategory = '';
    let maxQuantity = 0;

    Object.entries(categoryCounts).forEach(([category, quantity]) => {
      if (quantity > maxQuantity) {
        maxQuantity = quantity;
        topCategory = category;
      }
    });

    if (!topCategory) return null;

    return { category: topCategory, quantity: maxQuantity };
  };

  const getCategoryBadgeStyles = (category: string) => {
    switch (category) {
      case 'Electronics':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Accessories':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Furniture':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
  };

  return (
    <div className="space-y-6" id="customer-management-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight" id="customers-heading">
            Customers Ledger
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Browse and regulate buyer profiles, examine customer loyalty histories, and flag accounts.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 dark:border-zinc-150 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-100 rounded-xl text-sm font-semibold transition-all shadow-3xs cursor-pointer"
            id="btn-export-customers-csv"
          >
            <Download className="w-4 h-4 text-zinc-400 dark:text-zinc-350" />
            Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-600/10 cursor-pointer"
            id="btn-add-customer"
          >
            <UserPlus className="w-4 h-4" />
            Register Customer
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-zinc-100 shadow-3xs rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search customers by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-800 border border-zinc-200 focus:border-indigo-500 rounded-xl focus:outline-none transition-all placeholder:text-zinc-400"
            id="customer-search-input"
          />
        </div>

        {/* Status Filters */}
        <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200" id="customer-status-filter">
          {(['All', 'Active', 'Suspended'] as const).map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isActive ? 'bg-white text-zinc-800 shadow-2xs' : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Directory Ledger Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="customers-grid-container">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white border border-zinc-100 rounded-2xl p-16 flex flex-col items-center text-center shadow-3xs">
            <X className="w-12 h-12 text-zinc-300 mb-3" />
            <p className="text-zinc-800 font-bold text-lg">No Customers Found</p>
            <p className="text-zinc-400 text-sm mt-1 max-w-xs">
              No profiles matches your current search filters.
            </p>
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const isSuspended = c.status === 'Suspended';
            
            return (
              <motion.div
                layout
                key={c.id}
                className="bg-white border border-zinc-150 hover:border-zinc-300 rounded-2xl p-5 flex flex-col justify-between shadow-3xs group transition-all duration-250 relative"
                id={`customer-card-${c.id}`}
              >
                {/* Upper Details */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={c.avatar} 
                        alt={c.name}
                        className="w-11 h-11 rounded-full object-cover border border-zinc-200 ring-2 ring-zinc-50"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-zinc-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                          {c.name}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate max-w-[150px]">
                          {c.email}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSuspended ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  {/* Customer stats */}
                  <div className="grid grid-cols-2 gap-3 mt-5 pt-3.5 border-t border-zinc-100 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-100">
                    <div>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        Purchases
                      </p>
                      <p className="text-sm font-extrabold text-zinc-800 mt-0.5">{c.totalOrders} checkouts</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Total Spend
                      </p>
                      <p className="text-sm font-extrabold text-indigo-700 font-mono mt-0.5">{formatCurrency(c.totalSpend)}</p>
                    </div>
                  </div>

                  {/* Top Category Summary Card */}
                  {(() => {
                    const topCat = getTopPurchasedCategory(c.email);
                    return (
                      <div className="mt-3 p-2.5 bg-zinc-50/50 border border-zinc-150/80 rounded-xl flex items-center justify-between text-xs" id={`customer-top-category-${c.id}`}>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-indigo-500" />
                          Favorite Category
                        </span>
                        {topCat ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-3xs ${getCategoryBadgeStyles(topCat.category)}`}>
                            {topCat.category}
                            <span className="text-[9px] font-medium opacity-80">({topCat.quantity} {topCat.quantity === 1 ? 'item' : 'items'})</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-zinc-400 italic">No orders yet</span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(c.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                  
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => onToggleCustomerStatus(c.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSuspended 
                        ? 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-50 border-rose-100 hover:bg-rose-100 text-rose-700'
                    }`}
                    id={`btn-toggle-customer-${c.id}`}
                  >
                    {isSuspended ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        Reinstate
                      </>
                    ) : (
                      <>
                        <Ban className="w-3 h-3" />
                        Suspend
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Slide-over Registration Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div 
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            id="customer-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-zinc-150 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in"
              id="customer-form-modal"
            >
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h3 className="font-bold text-zinc-900 text-base">Register Customer Account</h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-200/50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Robert Downey"
                    className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                    id="customer-form-name"
                  />
                </div>

                {/* Email address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="downey@example.com"
                    className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                    id="customer-form-email"
                  />
                </div>

                {/* Avatar URL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Avatar URL (Optional)</label>
                  <input
                    type="url"
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                    id="customer-form-avatar"
                  />
                </div>

                {/* Account Status Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 focus:border-indigo-500 rounded-lg bg-zinc-50 focus:bg-white focus:outline-none transition-all text-zinc-800"
                    id="customer-form-status"
                  >
                    <option value="Active">Active / Approved</option>
                    <option value="Suspended">Suspended / Flagged</option>
                  </select>
                </div>

                {/* Submit footer */}
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-semibold hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs hover:shadow-indigo-600/10 cursor-pointer"
                    id="btn-customer-submit"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
