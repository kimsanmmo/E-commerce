import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Package, 
  Users, 
  ShoppingBag, 
  Settings, 
  ArrowRight,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS, 
  DEFAULT_SETTINGS 
} from './data/mockData';
import { Product, Order, Customer, StoreSettings, OrderStatus } from './types';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import ProductManagement from './components/ProductManagement';
import OrderManagement from './components/OrderManagement';
import CustomerManagement from './components/CustomerManagement';
import SystemSettings from './components/SystemSettings';

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Core App states backed by localStorage
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Global Search states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [globalProductSearch, setGlobalProductSearch] = useState<string>('');
  const [globalCustomerSearch, setGlobalCustomerSearch] = useState<string>('');
  const [globalOrderSearch, setGlobalOrderSearch] = useState<string>('');

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aerotech_dark_mode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('aerotech_dark_mode', JSON.stringify(newVal));
      return newVal;
    });
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const alertsRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl+K or Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside for alerts dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to handle tab switching and clearing global searches
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setGlobalProductSearch('');
    setGlobalCustomerSearch('');
    setGlobalOrderSearch('');
  };

  const handleSelectProductFromSearch = (productName: string) => {
    setGlobalProductSearch(productName);
    setGlobalCustomerSearch('');
    setGlobalOrderSearch('');
    setActiveTab('products');
  };

  const handleSelectCustomerFromSearch = (customerName: string) => {
    setGlobalCustomerSearch(customerName);
    setGlobalProductSearch('');
    setGlobalOrderSearch('');
    setActiveTab('customers');
  };

  const handleSelectOrderFromSearch = (orderId: string) => {
    setSelectedOrderId(orderId);
    setGlobalOrderSearch(orderId);
    setGlobalProductSearch('');
    setGlobalCustomerSearch('');
    setActiveTab('orders');
  };

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { products: [], customers: [], orders: [], totalCount: 0 };
    
    const query = searchTerm.toLowerCase().trim();

    // 1. Filter products
    const matchedProducts = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    ).slice(0, 5);

    // 2. Filter customers
    const matchedCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    ).slice(0, 5);

    // 3. Filter orders
    const matchedOrders = orders.filter(o => 
      o.id.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.customerEmail.toLowerCase().includes(query)
    ).slice(0, 5);

    return {
      products: matchedProducts,
      customers: matchedCustomers,
      orders: matchedOrders,
      totalCount: matchedProducts.length + matchedCustomers.length + matchedOrders.length
    };
  }, [searchTerm, products, customers, orders]);

  // Products currently below reorder threshold
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock <= settings.lowStockThreshold);
  }, [products, settings.lowStockThreshold]);

  // 1. Initial State Loading from LocalStorage
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('aerotech_products');
      const storedOrders = localStorage.getItem('aerotech_orders');
      const storedCustomers = localStorage.getItem('aerotech_customers');
      const storedSettings = localStorage.getItem('aerotech_settings');
      const storedSidebar = localStorage.getItem('aerotech_sidebar_collapsed');

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('aerotech_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        setOrders(INITIAL_ORDERS);
        localStorage.setItem('aerotech_orders', JSON.stringify(INITIAL_ORDERS));
      }

      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      } else {
        setCustomers(INITIAL_CUSTOMERS);
        localStorage.setItem('aerotech_customers', JSON.stringify(INITIAL_CUSTOMERS));
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('aerotech_settings', JSON.stringify(DEFAULT_SETTINGS));
      }

      if (storedSidebar) {
        setSidebarCollapsed(JSON.parse(storedSidebar));
      }
    } catch (e) {
      console.error('Failed to parse localStorage sandbox assets:', e);
      // Fallback
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setCustomers(INITIAL_CUSTOMERS);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      // Simulate highly elegant network handshake load
      const timer = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync Sidebar Collapse Preference
  const handleCollapseSidebar = (col: boolean) => {
    setSidebarCollapsed(col);
    localStorage.setItem('aerotech_sidebar_collapsed', JSON.stringify(col));
  };

  // 2. State Mutators with LocalStorage Synchronization
  
  // Quick stock refill from Dashboard or Product list
  const handleQuickRestock = (productId: string, amount: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: p.stock + amount };
      }
      return p;
    });
    setProducts(updated);
    localStorage.setItem('aerotech_products', JSON.stringify(updated));
  };

  // Add a product
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = { ...newProd, id };
    const updated = [product, ...products];
    setProducts(updated);
    localStorage.setItem('aerotech_products', JSON.stringify(updated));
  };

  // Edit a product
  const handleEditProduct = (editedProd: Product) => {
    const updated = products.map(p => p.id === editedProd.id ? editedProd : p);
    setProducts(updated);
    localStorage.setItem('aerotech_products', JSON.stringify(updated));
  };

  // Delete a product
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product from the catalog?')) {
      const updated = products.filter(p => p.id !== productId);
      setProducts(updated);
      localStorage.setItem('aerotech_products', JSON.stringify(updated));
    }
  };

  // Update order status with dynamic stock restoration upon cancellation
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Check if the order is newly cancelled
    const isNewCancellation = status === 'Cancelled' && order.status !== 'Cancelled';

    // 1. Update order status
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status };
      }
      return o;
    });
    setOrders(updatedOrders);
    localStorage.setItem('aerotech_orders', JSON.stringify(updatedOrders));

    // 2. If cancelled, replenish product stock level
    if (isNewCancellation) {
      const updatedProducts = products.map(p => {
        const matchingItem = order.items.find(item => item.productId === p.id);
        if (matchingItem) {
          return { ...p, stock: p.stock + matchingItem.quantity };
        }
        return p;
      });
      setProducts(updatedProducts);
      localStorage.setItem('aerotech_products', JSON.stringify(updatedProducts));
    }
  };

  // Add customer
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'totalOrders' | 'totalSpend'>) => {
    const id = `cust-${Date.now()}`;
    const customer: Customer = {
      ...newCust,
      id,
      totalOrders: 0,
      totalSpend: 0.00
    };
    const updated = [customer, ...customers];
    setCustomers(updated);
    localStorage.setItem('aerotech_customers', JSON.stringify(updated));
  };

  // Toggle customer status (Active / Suspended)
  const handleToggleCustomerStatus = (customerId: string) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        const nextStatus = c.status === 'Active' ? 'Suspended' : 'Active';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    setCustomers(updated as any);
    localStorage.setItem('aerotech_customers', JSON.stringify(updated));
  };

  // Update Settings
  const handleUpdateSettings = (updatedSettings: StoreSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem('aerotech_settings', JSON.stringify(updatedSettings));
  };

  // Full database factory reset
  const handleResetDatabase = () => {
    localStorage.removeItem('aerotech_products');
    localStorage.removeItem('aerotech_orders');
    localStorage.removeItem('aerotech_customers');
    localStorage.removeItem('aerotech_settings');
    localStorage.removeItem('aerotech_sidebar_collapsed');
    
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setSettings(DEFAULT_SETTINGS);
    setSidebarCollapsed(false);
    setActiveTab('dashboard');
  };

  // 3. Routing Tab navigation from Dashboard clicks
  const handleViewOrderFromDashboard = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveTab('orders');
  };

  const handleClearSelectedOrderId = () => {
    setSelectedOrderId(null);
  };

  // Rendering loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          {/* Elegant geometric loader spinner */}
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            <div className="absolute w-6 h-6 rounded-full border-2 border-dashed border-emerald-500 animate-reverse-spin" />
          </div>
          <p className="text-sm font-bold text-zinc-800 tracking-tight">Initializing Aerotech Panel</p>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Authenticating secure administrator handshake...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans antialiased selection:bg-indigo-600 selection:text-white transition-colors duration-200 ${
      isDarkMode 
        ? 'dark bg-zinc-950 text-zinc-100' 
        : 'bg-zinc-50/50 text-zinc-800'
    }`}>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        collapsed={sidebarCollapsed} 
        setCollapsed={handleCollapseSidebar}
        userEmail="kimsan.san117778@gmail.com"
        storeName={settings.storeName}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Workspace Upper Navigation Bar */}
        <header className="h-16 border-b border-zinc-150 bg-white/80 backdrop-blur-md px-6 md:px-8 flex items-center justify-between shrink-0 select-none z-10 shadow-3xs">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[11px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
              UTC NETWORK
            </span>
            <span className="text-zinc-500 text-xs font-semibold hidden lg:inline">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Central Global Search Bar */}
          <div className="flex-1 max-w-lg mx-4 md:mx-8 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products, customers, orders... (⌘K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  // Delay blur so click handlers on results run before panel closes
                  setTimeout(() => setIsFocused(false), 200);
                }}
                className="w-full bg-zinc-50/80 border border-zinc-200 text-zinc-800 rounded-lg pl-9 pr-10 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
              />
              {searchTerm ? (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 p-0.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-zinc-150 bg-white text-[9px] text-zinc-400 font-mono font-medium shadow-3xs pointer-events-none">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Dropdown Results Overlay */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl border border-zinc-200/80 shadow-lg z-50 overflow-hidden max-h-[380px] overflow-y-auto flex flex-col"
                >
                  {!searchTerm.trim() ? (
                    <div className="divide-y divide-zinc-100">
                      <div className="p-3">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2.5 py-1">Quick Navigation</p>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <button 
                            onClick={() => { handleTabChange('dashboard'); setSearchTerm(''); }}
                            className="flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600 transition-all border border-transparent hover:border-zinc-100"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Dashboard Overview
                          </button>
                          <button 
                            onClick={() => { handleTabChange('products'); setSearchTerm(''); }}
                            className="flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600 transition-all border border-transparent hover:border-zinc-100"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Product Catalog
                          </button>
                          <button 
                            onClick={() => { handleTabChange('orders'); setSearchTerm(''); }}
                            className="flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600 transition-all border border-transparent hover:border-zinc-100"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Order Registry
                          </button>
                          <button 
                            onClick={() => { handleTabChange('customers'); setSearchTerm(''); }}
                            className="flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600 transition-all border border-transparent hover:border-zinc-100"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            Customer Database
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : searchResults.totalCount > 0 ? (
                    <div className="divide-y divide-zinc-100 max-h-[380px] overflow-y-auto">
                      {/* Product Results */}
                      {searchResults.products.length > 0 && (
                        <div className="p-1.5">
                          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2.5 py-1.5 flex items-center justify-between">
                            <span>Products</span>
                            <span className="bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded text-[9px] font-mono">{searchResults.products.length}</span>
                          </h3>
                          <div className="space-y-0.5">
                            {searchResults.products.map(p => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  handleSelectProductFromSearch(p.name);
                                  setSearchTerm('');
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-50 flex items-center gap-3 transition-colors"
                              >
                                <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200/60 overflow-hidden shrink-0">
                                  {p.image ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <Package className="w-3.5 h-3.5 text-zinc-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-zinc-800 truncate">{p.name}</p>
                                  <p className="text-[10px] text-zinc-400 font-mono truncate">{p.sku} • {p.category}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs font-bold text-zinc-950">${p.price.toFixed(2)}</p>
                                  <span className={`inline-block text-[9px] font-mono px-1 rounded-sm ${
                                    p.stock === 0 
                                      ? 'bg-red-50 text-red-600 font-bold' 
                                      : p.stock <= settings.lowStockThreshold 
                                      ? 'bg-amber-50 text-amber-600 font-semibold' 
                                      : 'bg-emerald-50 text-emerald-600 font-medium'
                                  }`}>
                                    {p.stock} in stock
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Customer Results */}
                      {searchResults.customers.length > 0 && (
                        <div className="p-1.5">
                          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2.5 py-1.5 flex items-center justify-between">
                            <span>Customers</span>
                            <span className="bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded text-[9px] font-mono">{searchResults.customers.length}</span>
                          </h3>
                          <div className="space-y-0.5">
                            {searchResults.customers.map(c => (
                              <button
                                key={c.id}
                                onClick={() => {
                                  handleSelectCustomerFromSearch(c.name);
                                  setSearchTerm('');
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-50 flex items-center gap-3 transition-colors"
                              >
                                <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200/60 overflow-hidden shrink-0">
                                  {c.avatar ? (
                                    <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <span className="font-bold text-[10px] text-zinc-500">{c.name.split(' ').map(n => n[0]).join('')}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-zinc-800 truncate">{c.name}</p>
                                  <p className="text-[10px] text-zinc-400 font-mono truncate">{c.email}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs font-bold text-zinc-950">${c.totalSpend.toFixed(2)}</p>
                                  <p className="text-[9px] text-zinc-400 font-mono mt-0.5">{c.totalOrders} orders</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Order Results */}
                      {searchResults.orders.length > 0 && (
                        <div className="p-1.5">
                          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2.5 py-1.5 flex items-center justify-between">
                            <span>Orders</span>
                            <span className="bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded text-[9px] font-mono">{searchResults.orders.length}</span>
                          </h3>
                          <div className="space-y-0.5">
                            {searchResults.orders.map(o => (
                              <button
                                key={o.id}
                                onClick={() => {
                                  handleSelectOrderFromSearch(o.id);
                                  setSearchTerm('');
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-50 flex items-center gap-3 transition-colors"
                              >
                                <div className="w-7 h-7 rounded bg-zinc-50 flex items-center justify-center border border-zinc-200/60 shrink-0">
                                  <span className="font-mono text-[9px] font-bold text-zinc-500">#{o.id.split('-')[1]?.substring(0,3) || o.id.substring(0,3)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-zinc-800 truncate">{o.customerName}</p>
                                  <p className="text-[10px] text-zinc-400 font-mono truncate">{o.id} • {o.date}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs font-bold text-zinc-950">${o.total.toFixed(2)}</p>
                                  <span className={`inline-block text-[9px] font-mono px-1 rounded-sm ${
                                    o.status === 'Delivered' 
                                      ? 'bg-emerald-50 text-emerald-600' 
                                      : o.status === 'Cancelled'
                                      ? 'bg-red-50 text-red-600'
                                      : 'bg-amber-50 text-amber-600'
                                  }`}>
                                    {o.status}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-zinc-500 flex flex-col items-center justify-center">
                      <Search className="w-7 h-7 text-zinc-300 mb-2 animate-pulse" />
                      <p className="text-xs font-bold text-zinc-700">No matching records found</p>
                      <p className="text-[10px] text-zinc-400 mt-1 max-w-[240px]">
                        No products, customers, or orders matched &ldquo;{searchTerm}&rdquo;
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Alerts Bell Notification */}
            <div className="relative" ref={alertsRef} id="alerts-bell-container">
              <button
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className={`relative p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors focus:outline-none ${
                  isAlertsOpen ? 'bg-zinc-100 text-zinc-800' : ''
                }`}
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {lowStockProducts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isAlertsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-zinc-200 shadow-lg z-50 overflow-hidden"
                    id="alerts-dropdown-menu"
                  >
                    <div className="p-3 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-zinc-800">Inventory Alerts</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lowStockProducts.length > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {lowStockProducts.length} low stock
                      </span>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto divide-y divide-zinc-100">
                      {lowStockProducts.length === 0 ? (
                        <div className="p-6 text-center text-zinc-500 flex flex-col items-center justify-center">
                          <Bell className="w-7 h-7 text-zinc-300 mb-1.5" />
                          <p className="text-xs font-bold text-zinc-700">All stock levels healthy</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">No products are currently below reorder threshold.</p>
                        </div>
                      ) : (
                        lowStockProducts.map(p => (
                          <div key={p.id} className="p-3 hover:bg-zinc-50/50 flex flex-col gap-2 transition-colors">
                            <div 
                              onClick={() => {
                                handleSelectProductFromSearch(p.name);
                                setIsAlertsOpen(false);
                              }}
                              className="flex gap-3 items-start cursor-pointer group"
                            >
                              <div className="w-8 h-8 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 overflow-hidden">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <Package className="w-4 h-4 text-zinc-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-zinc-800 group-hover:text-indigo-600 truncate transition-colors">{p.name}</p>
                                <p className="text-[10px] text-zinc-400 font-mono truncate">{p.sku} • {p.category}</p>
                                <p className="text-[10px] font-semibold text-rose-600 mt-0.5">
                                  Only {p.stock} units left
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between bg-zinc-50 p-1.5 rounded-lg border border-zinc-150">
                              <span className="text-[10px] text-zinc-400 font-mono">Min: {settings.lowStockThreshold} units</span>
                              <button
                                onClick={() => handleQuickRestock(p.id, 10)}
                                className="text-[10px] font-bold bg-white hover:bg-indigo-600 hover:text-white text-zinc-700 border border-zinc-250 hover:border-indigo-600 px-2 py-0.5 rounded transition-all shadow-3xs"
                              >
                                +10 Quick Restock
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-zinc-200" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-zinc-900 leading-none">Kim San</p>
                <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Primary Administrator</p>
              </div>
              <div className="w-8.5 h-8.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
                KS
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Workspace Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 relative bg-zinc-50/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="max-w-6xl mx-auto"
            >
              {activeTab === 'dashboard' && (
                <DashboardOverview 
                  products={products} 
                  orders={orders} 
                  settings={settings}
                  onQuickRestock={handleQuickRestock}
                  onViewOrder={handleViewOrderFromDashboard}
                  setActiveTab={handleTabChange}
                />
              )}

              {activeTab === 'products' && (
                <ProductManagement 
                  products={products}
                  settings={settings}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  initialSearchQuery={globalProductSearch}
                />
              )}

              {activeTab === 'orders' && (
                <OrderManagement 
                  orders={orders}
                  settings={settings}
                  selectedOrderId={selectedOrderId}
                  onClearSelectedOrderId={handleClearSelectedOrderId}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  initialSearchQuery={globalOrderSearch}
                />
              )}

              {activeTab === 'customers' && (
                <CustomerManagement 
                  customers={customers}
                  orders={orders}
                  products={products}
                  settings={settings}
                  onAddCustomer={handleAddCustomer}
                  onToggleCustomerStatus={handleToggleCustomerStatus}
                  initialSearchQuery={globalCustomerSearch}
                />
              )}

              {activeTab === 'settings' && (
                <SystemSettings 
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onResetDatabase={handleResetDatabase}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
