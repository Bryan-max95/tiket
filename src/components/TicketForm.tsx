import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface TicketFormProps {
  user: User;
  onSuccess: () => void;
}

export default function TicketForm({ user, onSuccess }: TicketFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: 'c1',
    impact: 'Media',
    urgency: 'Media'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          departmentId: user.departmentId
        })
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Ticket</h2>
          <p className="text-gray-500">Describe el problema para que nuestro equipo pueda ayudarte.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Título del Incidente</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: No puedo acceder al correo corporativo"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Categoría</label>
              <select
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="c1">Hardware</option>
                <option value="c2">Software</option>
                <option value="c3">Redes / Conectividad</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Impacto</label>
              <select
                value={formData.impact}
                onChange={e => setFormData({ ...formData, impact: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="Baja">Baja - Solo me afecta a mí</option>
                <option value="Media">Media - Afecta a mi equipo</option>
                <option value="Alta">Alta - Afecta a todo el departamento</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Urgencia</label>
            <div className="grid grid-cols-3 gap-3">
              {['Baja', 'Media', 'Alta'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: level })}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                    formData.urgency === level 
                      ? "bg-indigo-600 border-indigo-600 text-white" 
                      : "bg-white border-gray-200 text-gray-500 hover:border-indigo-200"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Descripción Detallada</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Proporciona tantos detalles como sea posible..."
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              La prioridad final será calculada automáticamente por el sistema basándose en el impacto y la urgencia seleccionados.
            </p>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Enviando...' : (
              <>
                <Send className="w-5 h-5" />
                Crear Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
