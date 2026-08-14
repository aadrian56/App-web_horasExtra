import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import type { ToastMessage } from '../components/Toast';
import { Plus, Check, X, UserX, UserCheck } from 'lucide-react';

interface Funcionario {
  id: number;
  cedula: string;
  nombres_apellidos: string;
  tipo: 'guardia' | 'limpieza';
  rmu: number;
  estado: boolean;
}

export const Funcionarios: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Formulario fields
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [cedula, setCedula] = useState('');
  const [nombres, setNombres] = useState('');
  const [tipo, setTipo] = useState<'guardia' | 'limpieza'>('limpieza');
  const [rmu, setRmu] = useState('');
  const [estado, setEstado] = useState(true);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchFuncionarios = async () => {
    try {
      const res = await api.get('/funcionarios');
      setFuncionarios(res.data);
    } catch (err: any) {
      addToast('error', 'Error al cargar los funcionarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const openCreateModal = () => {
    setSelectedId(null);
    setCedula('');
    setNombres('');
    setTipo('limpieza');
    setRmu('');
    setEstado(true);
    setShowModal(true);
  };

  const openEditModal = (func: Funcionario) => {
    setSelectedId(func.id);
    setCedula(func.cedula);
    setNombres(func.nombres_apellidos);
    setTipo(func.tipo);
    setRmu(func.rmu.toString());
    setEstado(func.estado);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cedula || !nombres || !rmu) {
      addToast('error', 'Por favor complete todos los campos obligatorios.');
      return;
    }

    const payload = {
      cedula,
      nombres_apellidos: nombres,
      tipo,
      rmu: parseFloat(rmu),
      estado
    };

    try {
      if (selectedId) {
        await api.put(`/funcionarios/${selectedId}`, payload);
        addToast('success', 'Funcionario actualizado exitosamente.');
      } else {
        await api.post('/funcionarios', payload);
        addToast('success', 'Funcionario creado exitosamente.');
      }
      setShowModal(false);
      fetchFuncionarios();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Error al guardar los datos.');
    }
  };

  const toggleEstado = async (func: Funcionario) => {
    try {
      await api.put(`/funcionarios/${func.id}`, { estado: !func.estado });
      addToast('success', `Funcionario ${!func.estado ? 'activado' : 'desactivado'} correctamente.`);
      fetchFuncionarios();
    } catch (err: any) {
      addToast('error', 'No se pudo cambiar el estado del funcionario.');
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Funcionarios</h1>
          <p className="text-slate-600 mt-1">Administra el personal del GAD Municipal de Sucúa.</p>
        </div>
        <Button onClick={openCreateModal} variant="primary" className="flex items-center">
          <Plus className="w-5 h-5 mr-1" /> Nuevo Funcionario
        </Button>
      </div>

      {/* Lista / Tabla de Funcionarios */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {/* Vista Tabla para Desktop/Tablet */}
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cédula</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Nombres y Apellidos</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">RMU (Salario)</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {funcionarios.map((func) => (
                <tr key={func.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{func.cedula}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{func.nombres_apellidos}</td>
                  <td className="px-6 py-4 text-sm capitalize text-slate-600">{func.tipo}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-semibold">${parseFloat(func.rmu.toString()).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    {func.estado ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-sucua-green border border-sucua-green">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button onClick={() => openEditModal(func)} variant="ghost" className="text-xs">
                      Editar
                    </Button>
                    <Button
                      onClick={() => toggleEstado(func)}
                      variant={func.estado ? 'danger' : 'primary'}
                      className="text-xs px-2.5"
                    >
                      {func.estado ? 'Desactivar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Vista Tarjetas para Móvil (Responsive) */}
          <div className="block md:hidden divide-y divide-slate-200">
            {funcionarios.map((func) => (
              <div key={func.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">{func.nombres_apellidos}</h4>
                    <p className="text-xs text-slate-500">C.I: {func.cedula}</p>
                  </div>
                  {func.estado ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-sucua-green border border-sucua-green">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                      Inactivo
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="capitalize bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{func.tipo}</span>
                  <span className="font-bold text-slate-900">${parseFloat(func.rmu.toString()).toFixed(2)} / mes</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button onClick={() => openEditModal(func)} variant="ghost" className="flex-1 text-xs">
                    Editar
                  </Button>
                  <Button
                    onClick={() => toggleEstado(func)}
                    variant={func.estado ? 'danger' : 'primary'}
                    className="flex-1 text-xs"
                  >
                    {func.estado ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-lg">{selectedId ? 'Editar Funcionario' : 'Nuevo Funcionario'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-white" aria-label="Cerrar modal">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="modal_cedula">
                  Cédula de Identidad *
                </label>
                <input
                  id="modal_cedula"
                  type="text"
                  required
                  maxLength={10}
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                  placeholder="ej. 1400654321"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="modal_nombres">
                  Nombres y Apellidos Completos *
                </label>
                <input
                  id="modal_nombres"
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                  placeholder="ej. Juan Carlos Perez"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="modal_tipo">
                    Tipo de Cargo *
                  </label>
                  <select
                    id="modal_tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'guardia' | 'limpieza')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                  >
                    <option value="limpieza">Limpieza</option>
                    <option value="guardia">Guardia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="modal_rmu">
                    Remuneración Mensual (RMU) *
                  </label>
                  <input
                    id="modal_rmu"
                    type="number"
                    step="0.01"
                    required
                    value={rmu}
                    onChange={(e) => setRmu(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                    placeholder="ej. 527.00"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <input
                  id="modal_estado"
                  type="checkbox"
                  checked={estado}
                  onChange={(e) => setEstado(e.target.checked)}
                  className="h-4 w-4 text-sucua-green focus:ring-sucua-green border-slate-300 rounded"
                />
                <label htmlFor="modal_estado" className="ml-2 text-sm font-semibold text-slate-700">
                  Funcionario Activo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {selectedId ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenedor de Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};
