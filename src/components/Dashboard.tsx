import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { Metrics } from '../types';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch('/api/metrics')
      .then(res => res.json())
      .then(setMetrics);
  }, []);

  if (!metrics) return <div className="animate-pulse space-y-4">
    <div className="h-32 bg-white rounded-2xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-64 bg-white rounded-2xl"></div>
      <div className="h-64 bg-white rounded-2xl"></div>
      <div className="h-64 bg-white rounded-2xl"></div>
    </div>
  </div>;

  const total = metrics.total || 1; // Prevent division by zero

  const stats = [
    { label: 'Total Tickets', value: metrics.total, icon: BarChart3, color: 'indigo' },
    { label: 'En Proceso', value: metrics.byStatus['En Proceso'] || 0, icon: Clock, color: 'blue' },
    { label: 'Resueltos', value: metrics.byStatus['Resuelto'] || 0, icon: CheckCircle2, color: 'emerald' },
    { label: 'Críticos', value: metrics.byPriority['Crítico'] || 0, icon: AlertCircle, color: 'red' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Soporte</h1>
        <p className="text-gray-500">Resumen operativo del sistema de tickets.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", `bg-${stat.color}-50`)}>
                <stat.icon className={cn("w-6 h-6", `text-${stat.color}-600`)} />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Tickets por Estado</h3>
          <div className="space-y-4">
            {Object.entries(metrics.byStatus).map(([status, count]) => (
              <div key={status} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{status}</span>
                  <span className="text-gray-500">{count}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${((count as number) / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Distribución de Prioridad</h3>
          <div className="flex items-center justify-center h-48">
             <div className="flex gap-4 items-end h-full w-full px-8">
               {Object.entries(metrics.byPriority).map(([priority, count]) => (
                 <div key={priority} className="flex-1 flex flex-col items-center gap-2">
                   <div 
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-500",
                      priority === 'Crítico' ? 'bg-red-500' : 
                      priority === 'Alta' ? 'bg-orange-500' :
                      priority === 'Media' ? 'bg-blue-500' : 'bg-gray-400'
                    )}
                    style={{ height: `${((count as number) / total) * 100}%`, minHeight: '8px' }}
                   />
                   <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{priority}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
