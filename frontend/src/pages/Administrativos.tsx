import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import type { ToastMessage } from '../components/Toast';
import { Briefcase, Plus, Edit2, Trash2, Check, X, UserCheck } from 'lucide-react';

interface Administrativo {
  id: number;
  nombres_apellidos: string;
  cargo: 'director_administrativo' | 'director_finanzas' | 'administrador_bienes' | 'jefe_recursos';
  activo: boolean | number;
}

const CARGO_MAPPINGS: Record<string, string> = {
  director_administrativo: 'Director Administrativo',
  director_finanzas: 'Director de Finanzas',
  jefe_recursos: 'Jefe de Recursos Humanos',
  administrador_bienes: 'Administrador de Bienes Públicos'
};

const CARGO_COLORS: Record<string, string> = {
  director_administrativo: 'bg-sky-50 text-sky-700 border-sky-200',
  director_finanzas: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  jefe_recursos: 'bg-purple-50 text-purple-700 border-purple-200',
  administrador_bienes: 'bg-amber-50 text-amber-700 border-amber-200'
};

export const Administrativos: React.FC = () => {
  const [admins, setAdmins] = useState<Administrativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form & Modal States
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [nombres, setNombres] = useState('');
  const [cargo, setCargo] = useState<'director_administrativo' | 'director_finanzas' | 'administrador_bienes' | 'jefe_recursos'>('director_administrativo');
  const [activo, setActivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/administrativos');
      setAdmins(res.data);
    } catch (err: any) {
      addToast('error', 'Error al cargar el personal administrativo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openCreateModal = () => {
    setSelectedId(null);
    setNombres('');
    setCargo('director_administrativo');
    setActivo(true);
    setShowModal(true);
  };

  const openEditModal = (admin: Administrativo) => {
    setSelectedId(admin.id);
    setNombres(admin.nombres_apellidos);
    setCargo(admin.cargo);
    setActivo(!!admin.activo);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombres || !cargo) {
      addToast('error', 'Por favor complete todos los campos.');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedId) {
        await api.put(`/administrativos/${selectedId}`, { nombres_apellidos: nombres, cargo, activo });
        addToast('success', 'Funcionario administrativo actualizado.');
      } else {
        await api.post('/administrativos', { nombres_apellidos: nombres, cargo, activo });
        addToast('success', 'Funcionario administrativo registrado.');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Error al guardar el administrativo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Está seguro de eliminar a "${name}" de los registros administrativos?`)) {
      return;
    }

    try {
      await api.delete(`/administrativos/${id}`);
      addToast('success', 'Administrativo eliminado con éxito.');
      fetchAdmins();
    } catch (err: any) {
      addToast('error', 'Error al eliminar el administrativo.');
    }
  };

  const toggleActivo = async (admin: Administrativo) => {
    const nuevoEstado = !admin.activo;
    try {
      await api.put(`/administrativos/${admin.id}`, {
        nombres_apellidos: admin.nombres_apellidos,
        cargo: admin.cargo,
        activo: nuevoEstado
      });
      addToast('success', `${admin.nombres_apellidos} ha sido ${nuevoEstado ? 'activado' : 'desactivado'}.`);
      fetchAdmins();
    } catch (err: any) {
      addToast('error', 'No se pudo actualizar el estado del administrativo.');
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
          <h1 className="text-3xl font-extrabold text-slate-950">Firmas y Autoridades</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los directores y jefes departamentales encargados del control y certificación de horas extra.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          variant="primary"
          className="flex items-center justify-center min-h-[44px]"
        >
          <Plus className="w-5 h-5 mr-2" /> Registrar Autoridad
        </Button>
      </div>

      {/* Grid de Tarjetas Administrativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.keys(CARGO_MAPPINGS).map((cargoKey) => {
          // Filtrar administrativos por este cargo
          const adminsDeCargo = admins.filter((a) => a.cargo === cargoKey);
          const activeAdmin = adminsDeCargo.find((a) => a.activo);
          const inactiveAdmins = adminsDeCargo.filter((a) => !a.activo);

          return (
            <div
              key={cargoKey}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between"
            >
              {/* Encabezado del Cargo */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${CARGO_COLORS[cargoKey]}`}
                >
                  {CARGO_MAPPINGS[cargoKey]}
                </span>
              </div>

              {/* Contenido: Autoridad Activa */}
              <div className="p-5 flex-1 flex flex-col justify-center min-h-[140px]">
                {activeAdmin ? (
                  <div className="space-y-3 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-950 text-sm leading-tight">
                        {activeAdmin.nombres_apellidos}
                      </h3>
                      <span className="inline-flex mt-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Vigente / Activo
                      </span>
                    </div>

                    {/* Botones de acción rápido */}
                    <div className="flex items-center justify-center space-x-2 pt-2">
                      <button
                        onClick={() => openEditModal(activeAdmin)}
                        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-150 min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => toggleActivo(activeAdmin)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                        title="Desactivar"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(activeAdmin.id, activeAdmin.nombres_apellidos)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400 space-y-2">
                    <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">Sin autoridad activa</p>
                    <p className="text-[10px] text-slate-400 px-4">
                      Los reportes no mostrarán firmas de este cargo hasta que actives uno.
                    </p>
                  </div>
                )}
              </div>

              {/* Historial de Inactivos */}
              {inactiveAdmins.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/20 p-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Historial / Inactivos
                  </h4>
                  <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
                    {inactiveAdmins.map((inact) => (
                      <div
                        key={inact.id}
                        className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg text-xs"
                      >
                        <div className="truncate font-semibold text-slate-700 mr-2" title={inact.nombres_apellidos}>
                          {inact.nombres_apellidos}
                        </div>
                        <div className="flex space-x-1 flex-shrink-0">
                          <button
                            onClick={() => toggleActivo(inact)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Activar (Desactivará al actual)"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(inact)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(inact.id, inact.nombres_apellidos)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-lg">
                {selectedId ? 'Editar Autoridad' : 'Nueva Autoridad'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="nombres">
                  Nombres y Apellidos *
                </label>
                <input
                  id="nombres"
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="ej. Dr. Juan Carlos Calle"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="cargo">
                  Cargo Municipal *
                </label>
                <select
                  id="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green text-sm min-h-[44px]"
                >
                  {Object.keys(CARGO_MAPPINGS).map((k) => (
                    <option key={k} value={k}>
                      {CARGO_MAPPINGS[k]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-2">
                <input
                  id="activo"
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="h-4 w-4 text-sucua-green focus:ring-sucua-green border-slate-300 rounded"
                />
                <label htmlFor="activo" className="ml-2 text-sm font-semibold text-slate-700">
                  Definir como Vigente / Activo (Desactivará al anterior)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar'}
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
