import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import type { ToastMessage } from '../components/Toast';
import { Printer, Search, CalendarDays } from 'lucide-react';

interface ReporteData {
  cedula: string;
  nombres_apellidos: string;
  funcionario_tipo: 'guardia' | 'limpieza';
  total_suplementarias: number;
  total_extraordinarias: number;
  total_pagar: number;
}

interface HoraExtraRecord {
  id: number;
  funcionario_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_jornada: 'suplementaria' | 'extraordinaria';
  horas_calculadas: string | number;
  valor_calculado: string | number;
  rmu_historico: string | number;
  estado: 'pendiente' | 'autorizado' | 'rechazado';
  autorizado_por: number | null;
  fecha_autorizacion: string | null;
  nombres_apellidos: string;
  cedula: string;
  funcionario_tipo: 'guardia' | 'limpieza';
  autorizador_username: string | null;
}

interface Funcionario {
  id: number;
  cedula: string;
  nombres_apellidos: string;
  tipo: 'guardia' | 'limpieza';
  rmu: number;
  estado: number | boolean;
}

export const Reportes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'consolidado' | 'individual'>('consolidado');
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [mes, setMes] = useState((new Date().getMonth() + 1).toString());
  const [reportes, setReportes] = useState<ReporteData[]>([]);
  const [individualRecords, setIndividualRecords] = useState<HoraExtraRecord[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/administrativos');
      setAdmins(res.data);
    } catch (err: any) {
      addToast('error', 'Error al cargar los cargos administrativos.');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

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
      if (res.data.length > 0 && !selectedFuncionarioId) {
        setSelectedFuncionarioId(res.data[0].id.toString());
      }
    } catch (err: any) {
      addToast('error', 'Error al cargar los funcionarios.');
    }
  };

  useEffect(() => {
    if (activeTab === 'individual') {
      fetchFuncionarios();
    }
  }, [activeTab]);

  const getYearAndMonth = (fechaStr: string) => {
    const d = new Date(fechaStr);
    if (typeof fechaStr === 'string') {
      const parts = fechaStr.split('T')[0].split('-');
      if (parts.length === 3) {
        return {
          year: parseInt(parts[0], 10),
          month: parseInt(parts[1], 10)
        };
      }
    }
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1
    };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anio || !mes) {
      addToast('error', 'Por favor, seleccione año y mes.');
      return;
    }

    setLoading(true);
    setSearched(false);
    try {
      if (activeTab === 'consolidado') {
        const res = await api.get(`/horas-extra/reporte-mensual?anio=${anio}&mes=${mes}`);
        setReportes(res.data);
        setSearched(true);
        if (res.data.length === 0) {
          addToast('info', 'No se encontraron registros autorizados para el período seleccionado.');
        } else {
          addToast('success', 'Reporte consolidado generado con éxito.');
        }
      } else {
        if (!selectedFuncionarioId) {
          addToast('error', 'Por favor, seleccione un funcionario.');
          setLoading(false);
          return;
        }
        const res = await api.get('/horas-extra');
        const filtered = res.data.filter((r: any) => {
          if (r.funcionario_id !== parseInt(selectedFuncionarioId, 10)) return false;
          if (r.estado !== 'autorizado') return false;
          const { year, month } = getYearAndMonth(r.fecha);
          return year === parseInt(anio, 10) && month === parseInt(mes, 10);
        });
        setIndividualRecords(filtered);
        setSearched(true);
        if (filtered.length === 0) {
          addToast('info', 'No se encontraron registros autorizados para este funcionario en el período seleccionado.');
        } else {
          addToast('success', 'Informe de horas extra individual generado con éxito.');
        }
      }
    } catch (err: any) {
      addToast('error', 'Error al obtener los datos del reporte.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalGeneral = reportes.reduce((acc, r) => acc + parseFloat(r.total_pagar.toString()), 0);

  const totalIndSuplementarias = individualRecords.reduce((acc, r) => {
    if (r.tipo_jornada === 'suplementaria') {
      return acc + parseFloat(r.horas_calculadas.toString());
    }
    return acc;
  }, 0);

  const totalIndExtraordinarias = individualRecords.reduce((acc, r) => {
    if (r.tipo_jornada === 'extraordinaria') {
      return acc + parseFloat(r.horas_calculadas.toString());
    }
    return acc;
  }, 0);

  const totalIndPagar = individualRecords.reduce((acc, r) => acc + parseFloat(r.valor_calculado.toString()), 0);

  const selectedFuncionario = funcionarios.find((f) => f.id === parseInt(selectedFuncionarioId, 10));

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-8">
      {/* Ocultar encabezados al imprimir */}
      <div className="print:hidden space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Reportes de Horas Extras</h1>
          <p className="text-slate-600 mt-1">Generar reportes mensuales con validez para firmas administrativas.</p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => { setActiveTab('consolidado'); setSearched(false); }}
            className={`py-3 px-6 font-semibold border-b-2 transition-all ${
              activeTab === 'consolidado'
                ? 'border-sucua-green text-sucua-green'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Reporte Consolidado
          </button>
          <button
            onClick={() => { setActiveTab('individual'); setSearched(false); }}
            className={`py-3 px-6 font-semibold border-b-2 transition-all ${
              activeTab === 'individual'
                ? 'border-sucua-green text-sucua-green'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Informe Individual
          </button>
        </div>

        {/* Filtros de Búsqueda */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeTab === 'individual' && (
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="select_funcionario">
                    Funcionario *
                  </label>
                  <select
                    id="select_funcionario"
                    value={selectedFuncionarioId}
                    onChange={(e) => setSelectedFuncionarioId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                  >
                    <option value="" disabled>Seleccione un funcionario</option>
                    {funcionarios.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombres_apellidos} ({f.cedula})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className={activeTab === 'consolidado' ? "grid grid-cols-2 gap-4 col-span-2 md:col-span-3" : "grid grid-cols-2 gap-4 md:col-span-2"}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="select_anio">
                    Año *
                  </label>
                  <select
                    id="select_anio"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="select_mes">
                    Mes *
                  </label>
                  <select
                    id="select_mes"
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                  >
                    {nombresMeses.map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto flex items-center">
              <Search className="w-5 h-5 mr-1" /> Buscar registros
            </Button>
          </form>
        </div>
      </div>

      {/* Reporte imprimible */}
      {searched && (
        <div className="space-y-6">
          <div className="flex justify-end print:hidden">
            {((activeTab === 'consolidado' && reportes.length > 0) || (activeTab === 'individual' && individualRecords.length > 0)) && (
              <Button onClick={handlePrint} variant="secondary" className="flex items-center">
                <Printer className="w-5 h-5 mr-1" /> Exportar a PDF / Imprimir
              </Button>
            )}
          </div>

          {((activeTab === 'consolidado' && reportes.length === 0) || (activeTab === 'individual' && individualRecords.length === 0)) ? (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center print:hidden">
              <p className="text-slate-600">No hay datos que mostrar para el período seleccionado.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm print:shadow-none print:border-none print:p-0">
              
              {/* Encabezado Institucional del Reporte */}
              <div className="text-center space-y-2 mb-8 border-b pb-6 border-slate-200">
                <h2 className="text-xl font-black text-slate-900 uppercase">
                  Gobierno Autónomo Descentralizado Municipal del Cantón Sucúa
                </h2>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  {activeTab === 'consolidado' 
                    ? 'Reporte Consolidado de Horas Extras y Suplementarias'
                    : 'Informe Detallado de Horas Extras y Suplementarias (Individual)'}
                </h3>
                <div className="flex justify-center items-center space-x-6 text-xs text-slate-500 pt-2">
                  <span className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" /> Período: {nombresMeses[parseInt(mes) - 1]} del {anio}
                  </span>
                  <span>
                    Fecha de Emisión: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Datos del Funcionario (Solo para Reporte Individual) */}
              {activeTab === 'individual' && selectedFuncionario && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 print:bg-white print:border-none print:p-0">
                  <div>
                    <span className="block text-xs text-slate-500 font-semibold uppercase">Funcionario</span>
                    <span className="font-bold text-slate-800">{selectedFuncionario.nombres_apellidos}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-semibold uppercase">Cédula de Identidad</span>
                    <span className="font-bold text-slate-800">{selectedFuncionario.cedula}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-semibold uppercase">Cargo / Función</span>
                    <span className="font-bold text-slate-800 capitalize">{selectedFuncionario.tipo}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-semibold uppercase">RMU (Salario Base)</span>
                    <span className="font-bold text-slate-800">${parseFloat(selectedFuncionario.rmu.toString()).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Tabla de Datos */}
              <div className="overflow-x-auto">
                {activeTab === 'consolidado' ? (
                  <table className="w-full text-left border-collapse border border-slate-300 text-sm">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800">Cédula</th>
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800">Funcionario</th>
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800">Cargo</th>
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800 text-center">Horas Suplementarias</th>
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800 text-center">Horas Extraordinarias</th>
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800 text-right">Monto a Pagar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reportes.map((rep, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 border border-slate-300 font-medium text-slate-900">{rep.cedula}</td>
                          <td className="px-4 py-3 border border-slate-300 text-slate-700">{rep.nombres_apellidos}</td>
                          <td className="px-4 py-3 border border-slate-300 capitalize text-slate-600">{rep.funcionario_tipo}</td>
                          <td className="px-4 py-3 border border-slate-300 text-center text-slate-600">
                            {parseFloat(rep.total_suplementarias.toString()).toFixed(2)}h
                          </td>
                          <td className="px-4 py-3 border border-slate-300 text-center text-slate-600">
                            {parseFloat(rep.total_extraordinarias.toString()).toFixed(2)}h
                          </td>
                          <td className="px-4 py-3 border border-slate-300 text-right font-semibold text-slate-900">
                            ${parseFloat(rep.total_pagar.toString()).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {/* Fila Totales Consolidado */}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={3} className="px-4 py-3 border border-slate-300 text-right text-slate-800 uppercase">
                          Total Consolidado GAD Sucúa:
                        </td>
                        <td className="px-4 py-3 border border-slate-300 text-center text-slate-800">
                          {reportes.reduce((acc, r) => acc + parseFloat(r.total_suplementarias.toString()), 0).toFixed(2)}h
                        </td>
                        <td className="px-4 py-3 border border-slate-300 text-center text-slate-800">
                          {reportes.reduce((acc, r) => acc + parseFloat(r.total_extraordinarias.toString()), 0).toFixed(2)}h
                        </td>
                        <td className="px-4 py-3 border border-slate-300 text-right text-sucua-green text-md">
                          ${totalGeneral.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse border border-slate-300 text-sm">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800">Fecha</th>
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800 text-center">Hora Inicio</th>
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800 text-center">Hora Fin</th>
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800 text-center">Tipo Jornada</th>
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800 text-center">Horas Extras</th>
                        <th className="px-4 py-3 border border-slate-300 font-bold text-slate-800 text-right">Valor Calculado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {individualRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 border border-slate-300 text-slate-700">
                            {new Date(rec.fecha).toLocaleDateString('es-EC', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 border border-slate-300 text-center text-slate-600">{rec.hora_inicio}</td>
                          <td className="px-4 py-3 border border-slate-300 text-center text-slate-600">{rec.hora_fin}</td>
                          <td className="px-4 py-3 border border-slate-300 text-center capitalize text-slate-600">{rec.tipo_jornada}</td>
                          <td className="px-4 py-3 border border-slate-300 text-center text-slate-600">
                            {parseFloat(rec.horas_calculadas.toString()).toFixed(2)}h
                          </td>
                          <td className="px-4 py-3 border border-slate-300 text-right font-medium text-slate-950">
                            ${parseFloat(rec.valor_calculado.toString()).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {/* Fila Totales Individual */}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={4} className="px-4 py-3 border border-slate-300 text-right text-slate-800 uppercase">
                          Total Acumulado del Período:
                        </td>
                        <td className="px-4 py-3 border border-slate-300 text-center text-slate-800">
                          {(totalIndSuplementarias + totalIndExtraordinarias).toFixed(2)}h
                        </td>
                        <td className="px-4 py-3 border border-slate-300 text-right text-sucua-green text-md">
                          ${totalIndPagar.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              {/* Desglose resumido de Horas por Tipo (Solo para Reporte Individual) */}
              {activeTab === 'individual' && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 w-full max-w-sm ml-auto print:border-none print:p-0 print:bg-white">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Horas Suplementarias Totales:</span>
                    <span className="font-bold text-slate-800">{totalIndSuplementarias.toFixed(2)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Horas Extraordinarias Totales:</span>
                    <span className="font-bold text-slate-800">{totalIndExtraordinarias.toFixed(2)}h</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1 font-bold text-sm">
                    <span className="text-slate-800">Valor Total de Horas Extras:</span>
                    <span className="text-sucua-green">${totalIndPagar.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Casilleros de Firmas de Responsabilidad */}
              {(() => {
                const activeHR = admins.find(a => a.cargo === 'jefe_recursos' && a.activo);
                const activeFinanzas = admins.find(a => a.cargo === 'director_finanzas' && a.activo);
                const activeBienes = admins.find(a => a.cargo === 'administrador_bienes' && a.activo);

                return (
                  <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-xs print:grid-cols-3 print:gap-4">
                    {/* Firma Elaborado */}
                    <div className="space-y-12">
                      <div className="border-t border-slate-400 mx-auto w-48 pt-2">
                        <p className="font-bold text-slate-800">ELABORADO POR</p>
                        <p className="font-semibold text-slate-700 mt-1">
                          {activeBienes ? activeBienes.nombres_apellidos : 'Tcnl. Hugo Vinicio Cueva'}
                        </p>
                        <p className="text-slate-500 text-[10px] mt-0.5">Administrador de Bienes Públicos</p>
                        <p className="text-[10px] text-slate-400">Dirección Administrativa - GAD Sucúa</p>
                      </div>
                    </div>

                    {/* Firma Revisado */}
                    <div className="space-y-12">
                      <div className="border-t border-slate-400 mx-auto w-48 pt-2">
                        <p className="font-bold text-slate-800">REVISADO POR</p>
                        <p className="font-semibold text-slate-700 mt-1">
                          {activeHR ? activeHR.nombres_apellidos : 'Dra. Gabriela Elizabeth Ríos'}
                        </p>
                        <p className="text-slate-500 text-[10px] mt-0.5">Jefe de Recursos Humanos</p>
                        <p className="text-[10px] text-slate-400">Talento Humano - GAD Sucúa</p>
                      </div>
                    </div>

                    {/* Firma Autorizado */}
                    <div className="space-y-12">
                      <div className="border-t border-slate-400 mx-auto w-48 pt-2">
                        <p className="font-bold text-slate-800">AUTORIZADO POR</p>
                        <p className="font-semibold text-slate-700 mt-1">
                          {activeFinanzas ? activeFinanzas.nombres_apellidos : 'Mgs. Silvia Patricia Ortiz'}
                        </p>
                        <p className="text-slate-500 text-[10px] mt-0.5">Director(a) Financiero(a)</p>
                        <p className="text-[10px] text-slate-400">Alcaldía / GAD Sucúa</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          )}
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
