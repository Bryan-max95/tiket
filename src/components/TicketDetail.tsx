import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  User as UserIcon, 
  MessageSquare, 
  History,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { Ticket, User } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketDetailProps {
  ticket: Ticket;
  user: User;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TicketDetail({ ticket, user, onClose, onUpdate }: TicketDetailProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId: user.id })
      });
      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const canManage = ['admin', 'supervisor', 'agent'].includes(user.role);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ticket #{ticket.id.slice(0, 8)}</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
              ticket.priority === 'Crítico' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
            )}>
              {ticket.priority}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <section>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{ticket.title}</h1>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <UserIcon className="w-4 h-4" />
                <span>Solicitado por: <span className="font-semibold text-gray-900">{ticket.user_name}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Creado: <span className="font-semibold text-gray-900">{format(new Date(ticket.created_at), "d 'de' MMMM, HH:mm", { locale: es })}</span></span>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 p-6 rounded-2xl border border-black/5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-black/5 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Categoría</span>
              <span className="text-sm font-semibold text-gray-900">{ticket.category_name}</span>
            </div>
            <div className="p-4 bg-white border border-black/5 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Impacto</span>
              <span className="text-sm font-semibold text-gray-900">{ticket.impact}</span>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Actividad</h3>
              <button className="text-xs font-bold text-indigo-600 hover:underline">Ver Historial Completo</button>
            </div>
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                  <p className="text-sm text-gray-600">Ticket creado y auto-asignado al departamento de {ticket.category_name}.</p>
                  <span className="text-[10px] text-gray-400 mt-2 block">{format(new Date(ticket.created_at), "HH:mm")}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {canManage && ticket.status !== 'Resuelto' && ticket.status !== 'Cerrado' && (
          <div className="p-6 border-t border-black/5 bg-white grid grid-cols-2 gap-4">
            <button 
              disabled={updating}
              onClick={() => handleStatusChange('En Proceso')}
              className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              Tomar Ticket
            </button>
            <button 
              disabled={updating}
              onClick={() => handleStatusChange('Resuelto')}
              className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Resolver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
