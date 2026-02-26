import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Ticket as TicketIcon, 
  PlusCircle, 
  LogOut, 
  User as UserIcon,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ user, onLogout, children, activeTab, setActiveTab }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'supervisor', 'agent', 'employee'] },
    { id: 'tickets', label: 'Mis Tickets', icon: TicketIcon, roles: ['employee'] },
    { id: 'all-tickets', label: 'Todos los Tickets', icon: TicketIcon, roles: ['admin', 'supervisor'] },
    { id: 'assigned', label: 'Asignados a mí', icon: TicketIcon, roles: ['agent'] },
    { id: 'create', label: 'Nuevo Ticket', icon: PlusCircle, roles: ['employee'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  const toggleAvailability = async () => {
    try {
      const res = await fetch(`/api/users/${user.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !user.isAvailable })
      });
      if (res.ok) {
        // In a real app we'd update global state, here we just refresh
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-black/5 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TicketIcon className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">IT Support</span>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {filteredNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.id 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-black/5">
            {['agent', 'supervisor', 'admin'].includes(user.role) && (
              <div className="px-4 py-3 mb-2 bg-gray-50 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Disponibilidad</span>
                  <span className={cn(
                    "text-xs font-bold",
                    user.isAvailable ? "text-emerald-600" : "text-gray-400"
                  )}>
                    {user.isAvailable ? 'Disponible' : 'No Disponible'}
                  </span>
                </div>
                <button 
                  onClick={toggleAvailability}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-all duration-300",
                    user.isAvailable ? "bg-emerald-500" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                    user.isAvailable ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <UserIcon className="text-gray-500 w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar tickets..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
