import React, { useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Toast, ToastMessage } from '../components/Toast';
import { FileText, Printer, Search, CalendarDays } from 'lucide-react';

interface ReporteData {
  cedula: string;
  nombres_apellidos: string;
  funcionario_tipo: 'guardia' | 'limpieza';
  total_suplementarias: number;
  total_extraordinarias: number;
  total_pagar: number;
}

export const Reportes: React.FC = () => {
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [mes, setMes] = useState((new Date().getMonth() + 1).toString());
  const [reportes, setReportes] = useState<ReporteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anio || !mes) {
      addToast('error', 'Por favor, seleccione año y mes.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/horas-extra/reporte-mensual?anio=${anio}&mes=${mes}`);
      setReportes(res.data);
      setSearched(true);
      if (res.data.length === 0) {
        addToast('info', 'No se encontraron registros autorizados para el período seleccionado.');
      } else {
        addToast('success', 'Reporte consolidado generado con éxito.');
      }
    } catch (err: any) {
      addToast('error', 'Error al obtener el reporte consolidado.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalGeneral = reportes.reduce((acc, r) => acc + parseFloat(r.total_pagar.toString()), 0);

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-8">
      {/* Ocultar encabezados al imprimir */}
      <div className="print:hidden space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Reportes Consolidados</h1>
          <p className="text-slate-600 mt-1">Generar reportes mensuales con validez para firmas administrativas.</p>
        </div>

        {/* Filtros de Búsqueda */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
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
            {reportes.length > 0 && (
              <Button onClick={handlePrint} variant="secondary" className="flex items-center">
                <Printer className="w-5 h-5 mr-1" /> Exportar a PDF / Imprimir
              </Button>
            )}
          </div>

          {reportes.length === 0 ? (
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
                  Reporte Consolidado de Horas Extras y Suplementarias
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

              {/* Tabla de Datos */}
              <div className="overflow-x-auto">
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
                    {/* Fila Totales */}
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
              </div>

              {/* Casilleros de Firmas de Responsabilidad */}
              <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-xs print:grid-cols-3 print:gap-4">
                {/* Firma Elaborado */}
                <div className="space-y-12">
                  <div className="border-t border-slate-400 mx-auto w-48 pt-2">
                    <p className="font-bold text-slate-800">ELABORADO POR</p>
                    <p className="text-slate-500 mt-1">Operador Administrativo</p>
                    <p className="text-[10px] text-slate-400">Recursos Humanos - GAD Sucúa</p>
                  </div>
                </div>

                {/* Firma Revisado */}
                <div className="space-y-12">
                  <div className="border-t border-slate-400 mx-auto w-48 pt-2">
                    <p className="font-bold text-slate-800">REVISADO POR</p>
                    <p className="text-slate-500 mt-1">Jefe de Recursos Humanos</p>
                    <p className="text-[10px] text-slate-400">Talento Humano - GAD Sucúa</p>
                  </div>
                </div>

                {/* Firma Autorizado */}
                <div className="space-y-12">
                  <div className="border-t border-slate-400 mx-auto w-48 pt-2">
                    <p className="font-bold text-slate-800">AUTORIZADO POR</p>
                    <p className="text-slate-500 mt-1">Director(a) Financiero(a)</p>
                    <p className="text-[10px] text-slate-400">Alcaldía / GAD Sucúa</p>
                  </div>
                </div>
              </div>

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
