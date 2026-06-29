import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Mail, 
  User, 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  Printer, 
  ChevronRight,
  AlertCircle,
  FileText,
  X,
  TrendingUp,
  DollarSign,
  Download,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderStatus, StoreSettings } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

interface OrderManagementProps {
  orders: Order[];
  settings: StoreSettings;
  selectedOrderId: string | null;
  onClearSelectedOrderId: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateOrderTags: (orderId: string, tags: string[]) => void;
  initialSearchQuery?: string;
}

export default function OrderManagement({ 
  orders, 
  settings,
  selectedOrderId,
  onClearSelectedOrderId,
  onUpdateOrderStatus,
  onUpdateOrderTags,
  initialSearchQuery = ''
}: OrderManagementProps) {
  
  // States
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
    if (initialSearchQuery) {
      setStatusFilter('All');
      setTagFilter('All');
    }
  }, [initialSearchQuery]);

  // Extract all unique tags across all orders
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    orders.forEach(o => {
      if (o.tags) {
        o.tags.forEach(t => {
          if (t.trim()) {
            tagsSet.add(t.trim());
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  }, [orders]);

  // Hourly Order Frequency Calculation
  const hourlyData = useMemo(() => {
    const data = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      displayLabel: `${i === 0 ? 12 : i > 12 ? i - 12 : i} ${i >= 12 ? 'PM' : 'AM'}`,
      orders: 0
    }));

    orders.forEach(o => {
      try {
        const dateObj = new Date(o.date);
        const hr = dateObj.getHours();
        if (hr >= 0 && hr < 24) {
          data[hr].orders += 1;
        }
      } catch (e) {
        console.error("Failed to parse order date for hourly chart:", e);
      }
    });

    return data;
  }, [orders]);

  const formatHourTick = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 6) return '6 AM';
    if (hour === 12) return '12 PM';
    if (hour === 18) return '6 PM';
    return '';
  };

  // Sync selectedOrderId from Dashboard click
  useEffect(() => {
    if (selectedOrderId) {
      const ord = orders.find(o => o.id === selectedOrderId);
      if (ord) {
        setActiveOrder(ord);
      }
    }
  }, [selectedOrderId, orders]);

  // Clean active details on close
  const handleCloseDetail = () => {
    setActiveOrder(null);
    setIsInvoiceOpen(false);
    setNewTagInput('');
    onClearSelectedOrderId();
  };

  const handleAddCustomTag = () => {
    if (!newTagInput.trim() || !activeOrder) return;
    const tag = newTagInput.trim();
    const currentTags = activeOrder.tags || [];
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      onUpdateOrderTags(activeOrder.id, newTags);
      setActiveOrder({ ...activeOrder, tags: newTags });
    }
    setNewTagInput('');
  };

  // 1. Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (o.tags && o.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
      
      const matchesTag = tagFilter === 'All' || (o.tags && o.tags.includes(tagFilter));
      
      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [orders, searchQuery, statusFilter, tagFilter]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    }).format(val);
  };

  const handleExportCSV = () => {
    // CSV Header
    const headers = [
      'Order ID', 
      'Customer Name', 
      'Customer Email', 
      'Date', 
      'Status', 
      'Items Count', 
      'Subtotal', 
      'Tax', 
      'Shipping', 
      'Total', 
      'Items Detail'
    ];

    // Rows
    const rows = filteredOrders.map(o => {
      const financials = getOrderFinancials(o);
      const itemsDetail = o.items.map(i => `${i.productName} (x${i.quantity})`).join('; ');
      const totalUnits = o.items.reduce((sum, i) => sum + i.quantity, 0);

      return [
        o.id,
        o.customerName,
        o.customerEmail,
        new Date(o.date).toLocaleDateString(),
        o.status,
        totalUnits,
        financials.subtotal.toFixed(2),
        financials.tax.toFixed(2),
        financials.shipping.toFixed(2),
        financials.total.toFixed(2),
        itemsDetail
      ];
    });

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
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for average order value & pending revenue
  const aov = useMemo(() => {
    if (filteredOrders.length === 0) return 0;
    const totalSum = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    return totalSum / filteredOrders.length;
  }, [filteredOrders]);

  const totalPendingRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => o.status === 'Pending')
      .reduce((sum, o) => sum + o.total, 0);
  }, [filteredOrders]);

  // Helper to calculate financials
  const getOrderFinancials = (order: Order) => {
    const itemsSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = itemsSubtotal * (settings.taxRate / 100);
    const shipping = itemsSubtotal > 0 ? settings.shippingFee : 0;
    const computedTotal = itemsSubtotal + tax + shipping;

    return {
      subtotal: itemsSubtotal,
      tax: tax,
      shipping: shipping,
      total: order.total || computedTotal // fallback to saved total
    };
  };

  // Status Style Helper
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Processing':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'Cancelled':
        return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
      default: // Pending
        return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };

  // Next status helper
  const getNextStatusAction = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return { label: 'Start Processing', status: 'Processing' as OrderStatus, color: 'bg-indigo-600 hover:bg-indigo-700' };
      case 'Processing':
        return { label: 'Ship Products', status: 'Shipped' as OrderStatus, color: 'bg-blue-600 hover:bg-blue-700' };
      case 'Shipped':
        return { label: 'Mark as Delivered', status: 'Delivered' as OrderStatus, color: 'bg-emerald-600 hover:bg-emerald-700' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="order-management-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight" id="orders-heading">
            Fulfillment Orders
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Monitor shopping cart checkout events, trace carrier status, and update invoice progress.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 dark:border-zinc-150 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-100 rounded-xl text-sm font-semibold transition-all shadow-3xs cursor-pointer self-start sm:self-center"
          id="btn-export-orders-csv"
        >
          <Download className="w-4 h-4 text-zinc-400 dark:text-zinc-350" />
          Export CSV
        </button>
      </div>

      {/* Financial Summary Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="order-financial-summary">
        <div className="bg-white border border-zinc-150 rounded-2xl p-5 flex items-center justify-between shadow-3xs">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Average Order Value (AOV)
            </span>
            <h3 className="text-2xl font-bold text-zinc-800">
              {formatCurrency(aov)}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Calculated across {filteredOrders.length} filtered {filteredOrders.length === 1 ? 'order' : 'orders'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-zinc-150 rounded-2xl p-5 flex items-center justify-between shadow-3xs">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Total Pending Revenue
            </span>
            <h3 className="text-2xl font-bold text-amber-600">
              {formatCurrency(totalPendingRevenue)}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              From {filteredOrders.filter(o => o.status === 'Pending').length} pending {filteredOrders.filter(o => o.status === 'Pending').length === 1 ? 'order' : 'orders'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Hourly Peak Order Times Bar Chart Card */}
        <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-3xs flex flex-col justify-between" id="hourly-peak-order-times-card">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Peak Order Times (Hourly)
              </span>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Hourly checkout frequency across all store orders
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="w-full h-[64px] mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 2, right: 2, left: -32, bottom: 0 }}>
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={formatHourTick} 
                  ticks={[0, 6, 12, 18]} 
                  stroke="#a1a1aa" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#a1a1aa" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false} 
                />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5', opacity: 0.4 }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value} ${value === 1 ? 'order' : 'orders'}`, 
                    props.payload.displayLabel
                  ]}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '10px', padding: '4px 8px' }}
                  labelStyle={{ display: 'none' }}
                />
                <Bar dataKey="orders" fill="#4f46e5" radius={[2, 2, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.orders > 0 ? '#4f46e5' : '#e4e4e7'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-zinc-100 shadow-3xs rounded-2xl p-4 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-stretch sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by Order ID, customer, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-800 border border-zinc-200 focus:border-indigo-500 rounded-xl focus:outline-none transition-all placeholder:text-zinc-400"
              id="order-search-input"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative w-full sm:w-44">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 pointer-events-none">
              <Filter className="w-4 h-4 text-zinc-400" />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-9 pr-10 py-2 text-xs bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-800 border border-zinc-200 focus:border-indigo-500 rounded-xl focus:outline-none transition-all cursor-pointer font-semibold appearance-none"
              id="order-status-filter-dropdown"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 pointer-events-none">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </span>
          </div>

          {/* Tag Filter Dropdown */}
          <div className="relative w-full sm:w-44">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 pointer-events-none">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
            </span>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full pl-9 pr-10 py-2 text-xs bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-zinc-800 border border-zinc-200 focus:border-indigo-500 rounded-xl focus:outline-none transition-all cursor-pointer font-semibold appearance-none"
              id="order-tag-filter-dropdown"
            >
              <option value="All">All Tags</option>
              {allUniqueTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center text-zinc-400 pointer-events-none">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </span>
          </div>
        </div>

        {/* Filters tabs */}
        <div className="hidden xl:flex flex-wrap items-center gap-1.5" id="order-status-tabs">
          {(['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((status) => {
            const isActive = statusFilter === status;
            
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-zinc-900 border-zinc-900 text-white' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
                id={`btn-filter-status-${status}`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-zinc-150 rounded-2xl overflow-hidden shadow-3xs overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <Package className="w-12 h-12 text-zinc-300 mb-3" />
            <p className="text-zinc-800 font-bold text-lg">No Orders Found</p>
            <p className="text-zinc-400 text-sm mt-1 max-w-xs">
              No historical transactions match your search parameters.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left text-sm" id="orders-table">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-100 select-none">
                <th className="px-5 py-4 text-xs uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-4 text-xs uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-4 text-xs uppercase tracking-wider">Customer Info</th>
                <th className="px-5 py-4 text-xs uppercase tracking-wider">Total Charge</th>
                <th className="px-5 py-4 text-xs uppercase tracking-wider">Items</th>
                <th className="px-5 py-4 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs uppercase tracking-wider text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredOrders.map((o) => (
                <tr 
                  key={o.id}
                  onClick={() => setActiveOrder(o)}
                  className="hover:bg-zinc-50/50 transition-colors cursor-pointer group"
                  id={`order-row-${o.id}`}
                >
                  <td className="px-5 py-4 font-mono font-bold text-zinc-900 text-xs">
                    {o.id}
                  </td>
                  <td className="px-5 py-4 text-xs text-zinc-500 font-medium">
                    {new Date(o.date).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-zinc-900 text-xs">{o.customerName}</p>
                    <p className="text-[10px] text-zinc-400 truncate max-w-[150px] mt-0.5">{o.customerEmail}</p>
                    {o.tags && o.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 max-w-[180px]">
                        {o.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200/60 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 font-bold text-zinc-900 font-mono">
                    {formatCurrency(o.total)}
                  </td>
                  <td className="px-5 py-4 text-xs text-zinc-500">
                    {o.items.reduce((sum, i) => sum + i.quantity, 0)} units ({o.items.length} unique)
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full text-center ${getStatusBadgeClass(o.status)}`}>
                      {(o.status === 'Pending' || o.status === 'Delivered') && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${o.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${o.status === 'Pending' ? 'bg-amber-600' : 'bg-emerald-600'}`}></span>
                        </span>
                      )}
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveOrder(o);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-zinc-200 group-hover:border-indigo-200 group-hover:bg-indigo-50/50 text-zinc-600 group-hover:text-indigo-700 rounded-lg text-xs font-semibold transition-all"
                      id={`btn-view-${o.id}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Interactive Detail Slide-over Panel */}
      <AnimatePresence>
        {activeOrder && (
          <div 
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex justify-end z-50"
            id="order-drawer-overlay"
            onClick={handleCloseDetail}
          >
            {/* Drawer container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg h-full border-l border-zinc-150 flex flex-col shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
              id="order-drawer"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-zinc-900">{activeOrder.id}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(activeOrder.status)}`}>
                      {(activeOrder.status === 'Pending' || activeOrder.status === 'Delivered') && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeOrder.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${activeOrder.status === 'Pending' ? 'bg-amber-600' : 'bg-emerald-600'}`}></span>
                        </span>
                      )}
                      {activeOrder.status}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs mt-1 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3" />
                    Ordered {new Date(activeOrder.date).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-md hover:bg-zinc-200/50 transition-colors cursor-pointer"
                  id="btn-close-drawer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Timeline Progress */}
                <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Fulfillment Milestones</h4>
                  
                  <div className="relative flex justify-between items-center px-4 pt-2">
                    {/* Background Progress bar */}
                    <div className="absolute top-5 inset-x-8 h-0.5 bg-zinc-200 z-0" />
                    
                    {/* Processing Fill Bar */}
                    <div 
                      className="absolute top-5 left-8 h-0.5 bg-indigo-600 z-0 transition-all duration-300"
                      style={{
                        width: 
                          activeOrder.status === 'Pending' ? '0%' :
                          activeOrder.status === 'Processing' ? '33%' :
                          activeOrder.status === 'Shipped' ? '66%' :
                          activeOrder.status === 'Delivered' ? '100%' : '0%' // Cancelled is 0%
                      }}
                    />

                    {/* Pending Node */}
                    <div className="flex flex-col items-center z-10 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono border shadow-2xs ${
                        activeOrder.status === 'Cancelled' ? 'bg-zinc-200 text-zinc-500 border-zinc-300' : 'bg-indigo-600 text-white border-indigo-600'
                      }`}>
                        1
                      </div>
                      <span className="text-[10px] font-bold text-zinc-800 mt-1">Pending</span>
                    </div>

                    {/* Processing Node */}
                    <div className="flex flex-col items-center z-10 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono border shadow-2xs transition-all ${
                        ['Processing', 'Shipped', 'Delivered'].includes(activeOrder.status)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-zinc-400 border-zinc-200'
                      }`}>
                        2
                      </div>
                      <span className="text-[10px] font-bold text-zinc-800 mt-1">Processing</span>
                    </div>

                    {/* Shipped Node */}
                    <div className="flex flex-col items-center z-10 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono border shadow-2xs transition-all ${
                        ['Shipped', 'Delivered'].includes(activeOrder.status)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-zinc-400 border-zinc-200'
                      }`}>
                        3
                      </div>
                      <span className="text-[10px] font-bold text-zinc-800 mt-1">Shipped</span>
                    </div>

                    {/* Delivered Node */}
                    <div className="flex flex-col items-center z-10 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono border shadow-2xs transition-all ${
                        activeOrder.status === 'Delivered'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-zinc-400 border-zinc-200'
                      }`}>
                        4
                      </div>
                      <span className="text-[10px] font-bold text-zinc-800 mt-1">Delivered</span>
                    </div>
                  </div>
                  
                  {activeOrder.status === 'Cancelled' && (
                    <div className="flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-xs mt-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Order cancellation was logged manually. Restock levels restored.
                    </div>
                  )}
                </div>

                {/* Customer Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Client Profile</h4>
                  <div className="border border-zinc-150 rounded-2xl p-4 space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-sm shrink-0">
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-950">{activeOrder.customerName}</p>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {activeOrder.customerEmail}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-zinc-100 space-y-2">
                      <div className="flex items-start gap-2 text-xs text-zinc-600">
                        <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-zinc-800">Fulfillment Address</p>
                          <p className="mt-0.5 leading-relaxed text-zinc-500">{activeOrder.shippingAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-600 pt-1.5">
                        <CreditCard className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-zinc-800">Payment: </span>
                          <span className="text-zinc-500">{activeOrder.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Labels / Tag Management */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Custom Labels & Tags</h4>
                  <div className="border border-zinc-150 rounded-2xl p-4 space-y-4 bg-zinc-50/30">
                    {/* List of current tags */}
                    <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
                      {(!activeOrder.tags || activeOrder.tags.length === 0) ? (
                        <p className="text-xs text-zinc-400 italic">No tags applied to this order yet.</p>
                      ) : (
                        activeOrder.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center gap-1 pl-2 pr-1.5 py-1 text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg"
                          >
                            {tag}
                            <button 
                              type="button"
                              onClick={() => {
                                const newTags = activeOrder.tags?.filter(t => t !== tag) || [];
                                onUpdateOrderTags(activeOrder.id, newTags);
                                setActiveOrder(prev => prev ? { ...prev, tags: newTags } : null);
                              }}
                              className="text-indigo-400 hover:text-indigo-600 rounded-full hover:bg-indigo-100 p-0.5 transition-all cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Pre-suggested tags / quick tags */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Quick Suggestions</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Priority', 'Wholesale', 'International', 'Urgent', 'New Client', 'Review Required'].map(suggestedTag => {
                          const isApplied = activeOrder.tags?.includes(suggestedTag);
                          return (
                            <button
                              key={suggestedTag}
                              type="button"
                              disabled={isApplied}
                              onClick={() => {
                                const currentTags = activeOrder.tags || [];
                                const newTags = [...currentTags, suggestedTag];
                                onUpdateOrderTags(activeOrder.id, newTags);
                                setActiveOrder(prev => prev ? { ...prev, tags: newTags } : null);
                              }}
                              className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                                isApplied 
                                  ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed opacity-50' 
                                  : 'bg-white border-zinc-200 hover:border-indigo-400 hover:text-indigo-600 text-zinc-600'
                              }`}
                            >
                              + {suggestedTag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom tag input */}
                    <div className="pt-2 border-t border-zinc-100 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type custom tag..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTag();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-white text-zinc-800 border border-zinc-200 focus:border-indigo-500 rounded-lg focus:outline-none placeholder:text-zinc-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTag}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>
                </div>

                {/* Item List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Itemized Receipt</h4>
                  <div className="border border-zinc-150 rounded-2xl overflow-hidden divide-y divide-zinc-100">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-zinc-50/30 transition-colors">
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 truncate" title={item.productName}>
                            {item.productName}
                          </p>
                          <p className="text-zinc-400 font-mono mt-1 text-[10px]">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-zinc-900 font-mono ml-4">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    
                    {/* Calculations Summary */}
                    <div className="p-4 bg-zinc-50/50 space-y-2 text-xs text-zinc-600 font-medium">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-mono text-zinc-800">{formatCurrency(getOrderFinancials(activeOrder).subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fulfillment VAT / Tax ({settings.taxRate}%)</span>
                        <span className="font-mono text-zinc-800">{formatCurrency(getOrderFinancials(activeOrder).tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flat Carrier Shipping</span>
                        <span className="font-mono text-zinc-800">{formatCurrency(getOrderFinancials(activeOrder).shipping)}</span>
                      </div>
                      <div className="flex justify-between pt-2.5 border-t border-zinc-200 text-sm font-bold text-zinc-950">
                        <span>Invoice Total</span>
                        <span className="font-mono">{formatCurrency(getOrderFinancials(activeOrder).total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 shrink-0 space-y-2">
                {/* Status Advancement Primary Button */}
                {(() => {
                  const nextAction = getNextStatusAction(activeOrder.status);
                  if (nextAction) {
                    return (
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(activeOrder.id, nextAction.status);
                          // Sync local state
                          setActiveOrder(prev => prev ? { ...prev, status: nextAction.status } : null);
                        }}
                        className={`w-full py-2.5 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs hover:shadow-xs cursor-pointer ${nextAction.color}`}
                        id="btn-advance-status"
                      >
                        {activeOrder.status === 'Pending' && <Clock className="w-4 h-4" />}
                        {activeOrder.status === 'Processing' && <Truck className="w-4 h-4" />}
                        {activeOrder.status === 'Shipped' && <CheckCircle2 className="w-4 h-4" />}
                        {nextAction.label}
                      </button>
                    );
                  }
                  return null;
                })()}

                {/* Cancel & Print Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsInvoiceOpen(true);
                    }}
                    className="py-2 px-3 border border-indigo-150 hover:border-indigo-300 hover:bg-indigo-50/60 text-indigo-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    id="btn-generate-invoice"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Generate Invoice
                  </button>
                  
                  {activeOrder.status !== 'Cancelled' && activeOrder.status !== 'Delivered' ? (
                    <button
                      onClick={() => {
                        onUpdateOrderStatus(activeOrder.id, 'Cancelled');
                        setActiveOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
                      }}
                      className="py-2 px-3 border border-rose-100 hover:border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      id="btn-cancel-order"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Void Order
                    </button>
                  ) : (
                    <div className="py-2 px-3 text-center text-zinc-400 bg-zinc-100 border border-zinc-150 rounded-xl text-xs font-semibold select-none flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Settled
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Invoice Modal Overlay */}
      <AnimatePresence>
        {isInvoiceOpen && activeOrder && (
          <div 
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4 md:p-6 no-print"
            id="printable-invoice-wrapper"
            onClick={() => setIsInvoiceOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-zinc-200/80"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-150 flex items-center justify-between bg-zinc-50 shrink-0 no-print">
                <div className="flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-indigo-600" />
                  <span className="font-bold text-sm text-zinc-900">Order Invoice Summary</span>
                </div>
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-200/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Invoice Printable Sheet Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/25" id="printable-invoice-content">
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    /* Hide everything except the invoice sheet */
                    body > *:not(#printable-invoice-wrapper),
                    #root > *:not(#printable-invoice-wrapper),
                    #order-drawer-overlay,
                    #order-drawer,
                    #order-management-panel,
                    .no-print {
                      display: none !important;
                      height: 0 !important;
                      width: 0 !important;
                      overflow: hidden !important;
                      opacity: 0 !important;
                    }
                    
                    /* Reset body styles for print */
                    body {
                      background: white !important;
                      color: black !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    
                    #printable-invoice-wrapper {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      height: auto !important;
                      background: white !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      box-shadow: none !important;
                      border: none !important;
                      display: block !important;
                      z-index: 9999 !important;
                    }

                    #printable-invoice-wrapper > div {
                      box-shadow: none !important;
                      border: none !important;
                      max-width: 100% !important;
                      width: 100% !important;
                      height: auto !important;
                      max-height: none !important;
                      overflow: visible !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                  }
                `}} />

                <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm max-w-full mx-auto" id="invoice-sheet">
                  {/* Top Header Branding Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-zinc-150 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                          {settings.storeName ? settings.storeName[0].toUpperCase() : 'A'}
                        </div>
                        <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
                          {settings.storeName || 'AI Store Dashboard'}
                        </h2>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">Corporate Headquarters & Fulfillment</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-mono">INVOICE</h1>
                      <p className="text-xs text-zinc-400 font-medium font-mono mt-0.5">INV-{activeOrder.id.replace('order-', '').toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Address Grid (Bill To / Bill From) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 text-xs border-b border-zinc-150">
                    <div className="space-y-2">
                      <p className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Bill From</p>
                      <p className="font-bold text-zinc-950">{settings.storeName || 'AI Store Dashboard'}</p>
                      <p className="text-zinc-500 leading-relaxed">
                        100 Silicon Boulevard, Suite 500<br />
                        San Francisco, CA 94107<br />
                        <span className="font-mono">{settings.supportEmail || 'support@aistore.com'}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Bill To</p>
                      <p className="font-bold text-zinc-950">{activeOrder.customerName}</p>
                      <p className="text-zinc-500 leading-relaxed">
                        {activeOrder.shippingAddress}<br />
                        <span className="font-mono">{activeOrder.customerEmail}</span>
                      </p>
                    </div>
                  </div>

                  {/* Dates & Payment row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs bg-zinc-50 border-b border-zinc-150 px-4 rounded-lg my-6">
                    <div>
                      <p className="text-zinc-400 font-semibold mb-1">Date Issued</p>
                      <p className="font-bold text-zinc-800 font-mono">
                        {new Date(activeOrder.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400 font-semibold mb-1">Payment Method</p>
                      <p className="font-bold text-zinc-800">{activeOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 font-semibold mb-1">Payment Status</p>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeOrder.status === 'Cancelled' 
                          ? 'bg-zinc-200 text-zinc-600' 
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {activeOrder.status === 'Cancelled' ? 'Voided' : 'Paid'}
                      </span>
                    </div>
                    <div>
                      <p className="text-zinc-400 font-semibold mb-1">Due Date</p>
                      <p className="font-bold text-zinc-800 font-mono">Upon Receipt</p>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="mt-6">
                    <p className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] mb-3">Itemized Charges</p>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase pb-2">
                          <th className="py-2 font-bold">Item Description</th>
                          <th className="py-2 text-right font-bold w-16">Qty</th>
                          <th className="py-2 text-right font-bold w-24">Unit Price</th>
                          <th className="py-2 text-right font-bold w-24">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-zinc-700">
                        {activeOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="py-3 font-medium text-zinc-900">{item.productName}</td>
                            <td className="py-3 text-right font-mono text-zinc-600">{item.quantity}</td>
                            <td className="py-3 text-right font-mono text-zinc-600">{formatCurrency(item.price)}</td>
                            <td className="py-3 text-right font-mono font-bold text-zinc-900">{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial calculations */}
                  <div className="flex flex-col sm:flex-row justify-between items-start mt-8 pt-6 border-t border-zinc-150 gap-4">
                    <div className="text-zinc-400 text-[11px] max-w-xs leading-relaxed">
                      <p className="font-semibold text-zinc-500 mb-1">Notes & Terms</p>
                      <p>All values are represented in {settings.currency || 'USD'}. Items shipped are covered under standard merchant agreement terms. To request refund or return, please contact support within 30 days.</p>
                    </div>
                    <div className="w-full sm:w-64 text-xs font-medium text-zinc-600 space-y-2 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono text-zinc-800">{formatCurrency(getOrderFinancials(activeOrder).subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT / Tax ({settings.taxRate}%)</span>
                        <span className="font-mono text-zinc-800">{formatCurrency(getOrderFinancials(activeOrder).tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Fee</span>
                        <span className="font-mono text-zinc-800">{formatCurrency(getOrderFinancials(activeOrder).shipping)}</span>
                      </div>
                      <div className="flex justify-between pt-2.5 border-t border-zinc-200 text-sm font-bold text-zinc-950">
                        <span>Invoice Total</span>
                        <span className="font-mono text-indigo-600">{formatCurrency(getOrderFinancials(activeOrder).total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="px-6 py-4 border-t border-zinc-150 bg-zinc-50 flex items-center justify-end gap-2 shrink-0 no-print">
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
