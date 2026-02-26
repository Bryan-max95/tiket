import React, { useState } from 'react';
import { User, Ticket } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import { Shield, User as UserIcon, Key } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleLogin = async (role: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    setUser(data.user);
    setActiveTab('dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20 rotate-3">
              <Shield className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Enterprise IT</h1>
            <p className="text-gray-400 mt-2">Plataforma de Gestión de Incidentes</p>
          </div>

          <div className="bg-[#141414] p-8 rounded-3xl border border-white/5 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Selecciona tu Rol</h2>
              <p className="text-sm text-gray-500">Para propósitos de demostración, selecciona un perfil de acceso.</p>
            </div>

            <div className="grid gap-4">
              <button 
                onClick={() => handleLogin('employee')}
                className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Usuario Final</p>
                  <p className="text-xs text-gray-500">Crear y seguir mis tickets</p>
                </div>
              </button>

              <button 
                onClick={() => handleLogin('agent')}
                className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left"
              >
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Agente IT</p>
                  <p className="text-xs text-gray-500">Gestionar tickets asignados</p>
                </div>
              </button>

              <button 
                onClick={() => handleLogin('admin')}
                className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left"
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Administrador</p>
                  <p className="text-xs text-gray-500">Visión global y métricas</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={() => setUser(null)} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'create' && <TicketForm user={user} onSuccess={() => setActiveTab('tickets')} />}
      {activeTab === 'tickets' && <TicketList user={user} type="mine" onSelect={setSelectedTicket} />}
      {activeTab === 'all-tickets' && <TicketList user={user} type="all" onSelect={setSelectedTicket} />}
      {activeTab === 'assigned' && <TicketList user={user} type="assigned" onSelect={setSelectedTicket} />}

      {selectedTicket && (
        <TicketDetail 
          ticket={selectedTicket} 
          user={user} 
          onClose={() => setSelectedTicket(null)} 
          onUpdate={() => {
            setSelectedTicket(null);
            // Force refresh by toggling tab or similar
            const current = activeTab;
            setActiveTab('dashboard');
            setTimeout(() => setActiveTab(current), 10);
          }}
        />
      )}
    </Layout>
  );
}
