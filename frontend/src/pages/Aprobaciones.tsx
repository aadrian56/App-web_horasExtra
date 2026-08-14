import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import type { ToastMessage } from '../components/Toast';
import { StatusBadge } from '../components/StatusBadge';
import { Check, X, ShieldAlert } from 'lucide-react';

interface Registro {
  id: number;
  funcionario_id: number;
  nombres_apellidos: string;
  cedula: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_jornada: 'suplementaria' | 'extraordinaria';
  horas_calculadas: number;
  valor_calculado: number;
  estado: 'pendiente' | 'autorizado' | 'rechazado';
}

export const Aprobaciones: React.FC = () => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchRegistros = async () => {
    try {
      const res = await api.get('/horas-extra');
      // Mostrar solo los pendientes al principio para aprobación rápida, u ordenar
      setRegistros(res.data);
    } catch (err: any) {
      addToast('error', 'Error al cargar los registros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  const handleDecidir = async (id: number, decision: 'autorizado' | 'rechazado') => {
    try {
      await api.put(`/horas-extra/${id}/estado`, { estado: decision });
      addToast('success', `Registro ${decision} exitosamente.`);
      fetchRegistros();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'No se pudo registrar la aprobación.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sucua-green"></div>
      </div>
    );
  }

  const pendientes = registros.filter((r) => r.estado === 'pendiente');
  const historico = registros.filter((r) => r.estado !== 'pendiente');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">Aprobación de Horas Extra</h1>
        <p className="text-slate-600 mt-1">Autorizar o rechazar solicitudes de pago de horas suplementarias y extraordinarias.</p>
      </div>

      {/* Sección Solicitudes Pendientes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <ShieldAlert className="w-5 h-5 mr-2 text-sucua-yellow" /> Pendientes de Autorización
        </h2>

        {pendientes.length === 0 ? (
          <div className="p-8 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-center">
            <p className="text-sm font-semibold text-emerald-800">No hay solicitudes pendientes de aprobación en este momento. ¡Buen trabajo!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {/* Tabla Desktop */}
              <table className="hidden md:table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Funcionario</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Horario</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total Horas</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Monto a Pagar</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendientes.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{reg.nombres_apellidos}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(reg.fecha).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{reg.hora_inicio.substring(0,5)} - {reg.hora_fin.substring(0,5)}</td>
                      <td className="px-6 py-4 text-sm capitalize text-slate-500">{reg.tipo_jornada}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{parseFloat(reg.horas_calculadas.toString()).toFixed(2)}h</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">${parseFloat(reg.valor_calculado.toString()).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          onClick={() => handleDecidir(reg.id, 'autorizado')}
                          variant="primary"
                          className="px-3"
                          title="Aprobar"
                          aria-label="Aprobar registro"
                        >
                          <Check className="w-4 h-4 mr-1" /> Aprobar
                        </Button>
                        <Button
                          onClick={() => handleDecidir(reg.id, 'rechazado')}
                          variant="danger"
                          className="px-3"
                          title="Rechazar"
                          aria-label="Rechazar registro"
                        >
                          <X className="w-4 h-4 mr-1" /> Rechazar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tarjetas Móviles */}
              <div className="block md:hidden divide-y divide-slate-200">
                {pendientes.map((reg) => (
                  <div key={reg.id} className="p-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">{reg.nombres_apellidos}</h4>
                      <p className="text-xs text-slate-500">C.I: {reg.cedula} | {new Date(reg.fecha).toLocaleDateString()}</p>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="capitalize bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{reg.tipo_jornada} ({parseFloat(reg.horas_calculadas.toString()).toFixed(2)}h)</span>
                      <span className="font-bold text-slate-900">${parseFloat(reg.valor_calculado.toString()).toFixed(2)}</span>
                    </div>
                    <div className="flex space-x-2 pt-1">
                      <Button
                        onClick={() => handleDecidir(reg.id, 'autorizado')}
                        variant="primary"
                        className="flex-1 text-xs"
                      >
                        Aprobar
                      </Button>
                      <Button
                        onClick={() => handleDecidir(reg.id, 'rechazado')}
                        variant="danger"
                        className="flex-1 text-xs"
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sección Historial de Autorizados/Rechazados */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-950">Historial de Decisiones</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {/* Tabla Desktop */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Funcionario</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Horario</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total Horas</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Monto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historico.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{reg.nombres_apellidos}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(reg.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{reg.hora_inicio.substring(0,5)} - {reg.hora_fin.substring(0,5)}</td>
                    <td className="px-6 py-4 text-sm capitalize text-slate-500">{reg.tipo_jornada}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{parseFloat(reg.horas_calculadas.toString()).toFixed(2)}h</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">${parseFloat(reg.valor_calculado.toString()).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={reg.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tarjetas Móviles */}
            <div className="block md:hidden divide-y divide-slate-200">
              {historico.map((reg) => (
                <div key={reg.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-950">{reg.nombres_apellidos}</h4>
                      <p className="text-xs text-slate-500">{new Date(reg.fecha).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={reg.estado} />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="capitalize bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{reg.tipo_jornada} ({parseFloat(reg.horas_calculadas.toString()).toFixed(2)}h)</span>
                    <span className="font-bold text-slate-900">${parseFloat(reg.valor_calculado.toString()).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor de Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};
