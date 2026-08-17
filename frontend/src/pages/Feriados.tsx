import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import type { ToastMessage } from '../components/Toast';
import { Calendar, Trash2, Plus, Info } from 'lucide-react';

interface Feriado {
  id: number;
  nombre: string;
  fecha: string;
  recurrente: boolean | number;
}

export const Feriados: React.FC = () => {
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form states
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [recurrente, setRecurrente] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchFeriados = async () => {
    try {
      const res = await api.get('/feriados');
      setFeriados(res.data);
    } catch (err: any) {
      addToast('error', 'Error al cargar los feriados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeriados();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !fecha) {
      addToast('error', 'Por favor complete todos los campos.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/feriados', { nombre, fecha, recurrente });
      addToast('success', 'Feriado creado exitosamente.');
      setNombre('');
      setFecha('');
      setRecurrente(false);
      fetchFeriados();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Error al guardar el feriado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el feriado "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/feriados/${id}`);
      addToast('success', 'Feriado eliminado exitosamente.');
      fetchFeriados();
    } catch (err: any) {
      addToast('error', 'Error al eliminar el feriado.');
    }
  };

  // Helper to format dates for display without year (e.g., "10 de Agosto")
  const formatDateDisplayNoYear = (dateStr: string) => {
    if (!dateStr) return '';
    const [, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(2000, month - 1, day);
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'long'
    });
  };

  // Helper to format dates for display (e.g., "10 de Agosto, 2026")
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sucua-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">Calendario de Feriados</h1>
        <p className="text-slate-600 mt-1">
          Gestiona los días festivos nacionales y locales del Cantón Sucúa para automatizar las jornadas extraordinarias.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario para registrar feriados */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit space-y-4">
          <h2 className="text-lg font-bold text-slate-950 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-sucua-green" /> Nuevo Feriado
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-1">
                Nombre del Feriado
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Independencia de Sucúa"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="fecha" className="block text-sm font-semibold text-slate-700 mb-1">
                Fecha del Feriado
              </label>
              <input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green text-sm"
                required
              />
            </div>

            <div className="flex items-center pt-1">
              <input
                id="recurrente"
                type="checkbox"
                checked={recurrente}
                onChange={(e) => setRecurrente(e.target.checked)}
                className="h-4 w-4 text-sucua-green focus:ring-sucua-green border-slate-300 rounded"
              />
              <label htmlFor="recurrente" className="ml-2 text-sm font-semibold text-slate-700">
                ¿Se repite todos los años? (Feriado fijo)
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center min-h-[44px]"
              disabled={submitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              {submitting ? 'Guardando...' : 'Agregar Feriado'}
            </Button>
          </form>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-normal">
              <strong>Regla Automática:</strong> Al registrar horas extras en la fecha de un feriado, el sistema obligará a registrar la jornada como <strong>Extraordinaria</strong> (recargo del 100%).
            </p>
          </div>
        </div>

        {/* Tabla/Listado de Feriados */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Feriados Registrados</h3>
          </div>

          {feriados.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-600">No hay feriados registrados</p>
              <p className="text-sm text-slate-400 mt-1">Registra un nuevo feriado desde el formulario lateral.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Feriado</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feriados.map((feriado) => (
                    <tr key={feriado.id} className="hover:bg-slate-50/20">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        <div className="flex flex-col">
                          <span>{feriado.nombre}</span>
                          <span className="mt-1">
                            {feriado.recurrente ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                Anual / Fijo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                                Único / Variable
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {feriado.recurrente 
                          ? `${formatDateDisplayNoYear(feriado.fecha)}` 
                          : formatDateDisplay(feriado.fecha)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => handleDelete(feriado.id, feriado.nombre)}
                          variant="danger"
                          className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg"
                          aria-label={`Eliminar feriado ${feriado.nombre}`}
                          title="Eliminar Feriado"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Contenedor de notificaciones Toast */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};
