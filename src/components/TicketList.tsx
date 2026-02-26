import React, { useState, useEffect } from 'react';
import { 
  MoreVertical, 
  Clock, 
  User as UserIcon, 
  Tag,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Ticket, User } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TicketListProps {
  user: User;
  type: 'all' | 'mine' | 'assigned';
  onSelect: (ticket: Ticket) => void;
}

export default function TicketList({ user, type, onSelect }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (type === 'mine') params.append('userId', user.id);
    if (type === 'assigned') params.append('agentId', user.id);

    fetch(`/api/tickets?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        setLoading(false);
      });
  }, [type, user.id]);

  if (loading) return <div className="space-y-4">
    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse"></div>)}
  </div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {type === 'all' ? 'Todos los Tickets' : type === 'mine' ? 'Mis Tickets' : 'Asignados a mí'}
          </h2>
          <p className="text-sm text-gray-500">{tickets.length} tickets encontrados</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-black/5 bg-gray-50/50">
                <th className="px-6 py-4 text-[11px] uppercase font-bold text-gray-400 tracking-wider">Ticket</th>
                <th className="px-6 py-4 text-[11px] uppercase font-bold text-gray-400 tracking-wider">Estado</th>
                <th className="px-6 py-4 text-[11px] uppercase font-bold text-gray-400 tracking-wider">Prioridad</th>
                <th className="px-6 py-4 text-[11px] uppercase font-bold text-gray-400 tracking-wider">SLA</th>
                <th className="px-6 py-4 text-[11px] uppercase font-bold text-gray-400 tracking-wider">Asignado</th>
                <th className="px-6 py-4 text-[11px] uppercase font-bold text-gray-400 tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {tickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  onClick={() => onSelect(ticket)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {ticket.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">#{ticket.id.slice(0, 8)}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{ticket.category_name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                      ticket.status === 'Nuevo' ? 'bg-indigo-50 text-indigo-600' :
                      ticket.status === 'En Proceso' ? 'bg-blue-50 text-blue-600' :
                      ticket.status === 'Resuelto' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1.5 text-xs font-bold",
                      ticket.priority === 'Crítico' ? 'text-red-600' :
                      ticket.priority === 'Alta' ? 'text-orange-600' :
                      ticket.priority === 'Media' ? 'text-blue-600' : 'text-gray-500'
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        ticket.priority === 'Crítico' ? 'bg-red-600' :
                        ticket.priority === 'Alta' ? 'bg-orange-600' :
                        ticket.priority === 'Media' ? 'bg-blue-600' : 'bg-gray-500'
                      )} />
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(ticket.sla_deadline), { addSuffix: true, locale: es })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <span className="text-xs text-gray-600">{ticket.agent_name || 'Sin asignar'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
