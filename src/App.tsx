import React, { useState } from 'react';
import { User, Ticket } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import { Shield, User as UserIcon, Key, ArrowLeft, Lock } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) return;

    const validPasswords: Record<string, string> = {
      'employee': '1234',
      'agent': 'it1234',
      'admin': '4321'
    };

    if (password !== validPasswords[selectedRole]) {
      setError('Contraseña incorrecta');
      return;
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: selectedRole, username })
    });
    const data = await res.json();
    setUser(data.user);
    setActiveTab('dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20 rotate-3">
              <Shield className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Enterprise IT</h1>
            <p className="text-gray-500 mt-2">Plataforma de Gestión de Incidentes</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            {!selectedRole ? (
              <>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-bold text-gray-900">Bienvenido</h2>
                  <p className="text-sm text-gray-500">Selecciona tu perfil para ingresar al sistema.</p>
                </div>

                <div className="grid gap-4">
                  <button 
                    onClick={() => setSelectedRole('employee')}
                    className="group flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-100 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">Usuario Final</p>
                      <p className="text-xs text-blue-700">Crear y seguir mis tickets</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setSelectedRole('agent')}
                    className="group flex items-center gap-4 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border border-indigo-100 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-900">Agente IT</p>
                      <p className="text-xs text-indigo-700">Gestionar tickets asignados</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setSelectedRole('admin')}
                    className="group flex items-center gap-4 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl border border-emerald-100 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Administrador</p>
                      <p className="text-xs text-emerald-700">Visión global y métricas</p>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setPassword('');
                      setError('');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  <h2 className="text-xl font-bold text-gray-900 capitalize">
                    Acceso {selectedRole === 'employee' ? 'Usuario' : selectedRole === 'agent' ? 'Agente' : 'Admin'}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Usuario</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="text" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Tu nombre de usuario"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                      {error}
                    </p>
                  )}
                </div>

                <button 
                  type="submit"
                  className={cn(
                    "w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95",
                    selectedRole === 'employee' ? 'bg-blue-600 shadow-blue-500/20' : 
                    selectedRole === 'agent' ? 'bg-indigo-600 shadow-indigo-500/20' : 
                    'bg-emerald-600 shadow-emerald-500/20'
                  )}
                >
                  Iniciar Sesión
                </button>
              </form>
            )}
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
