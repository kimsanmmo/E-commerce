import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  User,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userEmail?: string;
  storeName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed,
  userEmail = 'admin@aerotech.io',
  storeName,
  isDarkMode,
  onToggleDarkMode
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-zinc-950 text-zinc-100 border-r border-zinc-800 flex flex-col transition-all duration-300 relative select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      id="admin-sidebar"
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
        {!collapsed ? (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 font-sans font-semibold tracking-tight"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight truncate max-w-[140px]">
                {storeName}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">Control Center</span>
            </div>
          </motion.div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
          </div>
        )}

        {/* Collapse Button */}
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)}
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-900 transition-colors hidden md:block"
            title="Collapse Sidebar"
            id="btn-collapse-sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                isActive 
                  ? 'text-white bg-indigo-600/90 shadow-sm shadow-indigo-600/10' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
              title={collapsed ? item.label : undefined}
              id={`sidebar-item-${item.id}`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-100'}`} />
              </div>
              
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}

              {/* Collapsed Tooltip */}
              {collapsed && (
                <div className="absolute left-full ml-4 px-2 py-1.5 bg-zinc-900 border border-zinc-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer / Admin Account Card */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950">
        {!collapsed ? (
          <div className="flex flex-col gap-3">
            {/* Theme Toggle */}
            <div className="px-1.5 flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block px-1.5">Appearance</span>
              <div className="grid grid-cols-2 gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                <button
                  onClick={() => isDarkMode && onToggleDarkMode()}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    !isDarkMode 
                      ? 'bg-zinc-800 text-white shadow-xs' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="theme-light-btn"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => !isDarkMode && onToggleDarkMode()}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-zinc-800 text-white shadow-xs' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="theme-dark-btn"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-2.5 overflow-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 ring-2 ring-zinc-800 ring-offset-2 ring-offset-zinc-900 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-zinc-200 truncate">Administrator</span>
                <span className="text-[10px] text-zinc-500 truncate" title={userEmail}>
                  {userEmail}
                </span>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 py-1">
            {/* Collapsed Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors relative group cursor-pointer animate-in fade-in"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              id="theme-collapsed-toggle-btn"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-zinc-300" /> : <Moon className="w-4.5 h-4.5 text-zinc-450" />}
              <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-xs text-white rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl whitespace-nowrap">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </div>
            </button>

            <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 relative group cursor-pointer">
              <User className="w-4.5 h-4.5" />
              {/* Collapsed Account Tooltip */}
              <div className="absolute left-full ml-4 p-3 bg-zinc-900 border border-zinc-800 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl min-w-[200px]">
                <p className="font-bold text-white mb-0.5">Admin Profile</p>
                <p className="text-zinc-400 font-mono text-[10px] truncate">{userEmail}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expand/Collapse Floating Toggle Button when collapsed */}
      {collapsed && (
        <button 
          onClick={() => setCollapsed(false)}
          className="absolute -right-3.5 top-14 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white p-1 rounded-full shadow-md z-40 transition-colors cursor-pointer hidden md:block"
          title="Expand Sidebar"
          id="btn-expand-sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </aside>
  );
}
