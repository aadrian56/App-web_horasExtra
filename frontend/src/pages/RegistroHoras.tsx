import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import type { ToastMessage } from '../components/Toast';
import { StatusBadge } from '../components/StatusBadge';
import { Calendar, User, Clock, AlertTriangle, Calculator, FileCheck } from 'lucide-react';
import { calcularValorPago } from '../utils/calculations';
import { esFeriadoODescanso } from '../utils/holidays';

interface Funcionario {
  id: number;
  cedula: string;
  nombres_apellidos: string;
  tipo: 'guardia' | 'limpieza';
  rmu: number;
  estado: boolean;
}

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

export const RegistroHoras: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Campos Formulario
  const [funcionarioId, setFuncionarioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('17:00');
  const [horaFin, setHoraFin] = useState('21:00');
  const [tipoJornada, setTipoJornada] = useState<'suplementaria' | 'extraordinaria'>('suplementaria');
  const [submitting, setSubmitting] = useState(false);

  // Estados previsualización en vivo (Glassmorphism)
  const [liveHours, setLiveHours] = useState(0);
  const [liveNocturnas, setLiveNocturnas] = useState(0);
  const [liveValor, setLiveValor] = useState(0);
  const [liveValorOrdinario, setLiveValorOrdinario] = useState(0);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchData = async () => {
    try {
      const [funcRes, regRes] = await Promise.all([
        api.get('/funcionarios'),
        api.get('/horas-extra')
      ]);
      setFuncionarios(funcRes.data.filter((f: any) => f.estado));
      setRegistros(regRes.data);
    } catch (err: any) {
      addToast('error', 'Error al cargar los datos iniciales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcular en tiempo real del lado del cliente para el visualizador
  useEffect(() => {
    if (!funcionarioId || !fecha || !horaInicio || !horaFin) {
      setLiveHours(0);
      setLiveNocturnas(0);
      setLiveValor(0);
      setLiveValorOrdinario(0);
      return;
    }

    const func = funcionarios.find(f => f.id === parseInt(funcionarioId));
    if (!func) return;

    const rmu = parseFloat(func.rmu.toString());
    const { horasTotales, horasNocturnas, valorTotal } = calcularValorPago({
      rmu,
      inicio: horaInicio,
      fin: horaFin,
      tipoJornada
    });

    setLiveValorOrdinario(rmu / 240);
    setLiveHours(horasTotales);
    setLiveNocturnas(horasNocturnas);
    setLiveValor(valorTotal);
  }, [funcionarioId, horaInicio, horaFin, tipoJornada, funcionarios, fecha]);

  const handleFechaChange = (val: string) => {
    setFecha(val);
    if (val) {
      const esDescanso = esFeriadoODescanso(val);
      setTipoJornada(esDescanso ? 'extraordinaria' : 'suplementaria');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcionarioId || !fecha || !horaInicio || !horaFin) {
      addToast('error', 'Por favor, complete todos los campos.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/horas-extra', {
        funcionario_id: parseInt(funcionarioId),
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        tipo_jornada: tipoJornada
      });

      addToast('success', 'Registro de horas extra guardado correctamente.');
      // Limpiar Formulario
      setFuncionarioId('');
      setFecha('');
      fetchData();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'No se pudo guardar el registro.');
    } finally {
      setSubmitting(false);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">Registro de Horas Extra</h1>
        <p className="text-slate-600 mt-1">Ingresa las jornadas extraordinarias y suplementarias para aprobación.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Formulario */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-sucua-green" /> Formulario de Registro
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="select_funcionario">
                  Funcionario *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-5 h-5" />
                  </span>
                  <select
                    id="select_funcionario"
                    required
                    value={funcionarioId}
                    onChange={(e) => setFuncionarioId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                  >
                    <option value="">Seleccione Funcionario...</option>
                    {funcionarios.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombres_apellidos} ({f.tipo === 'guardia' ? 'Guardia' : 'Limpieza'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="input_fecha">
                  Fecha *
                </label>
                <input
                  id="input_fecha"
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => handleFechaChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                />
                {fecha && (
                  <p className={`text-xs mt-1 font-semibold ${esFeriadoODescanso(fecha) ? 'text-amber-600' : 'text-sucua-green'}`}>
                    {esFeriadoODescanso(fecha) 
                      ? '⏳ Descanso obligatorio (Fin de semana / Feriado)' 
                      : '✓ Jornada regular (Lunes a Viernes)'}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="input_inicio">
                  Hora Inicio *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Clock className="w-5 h-5" />
                  </span>
                  <input
                    id="input_inicio"
                    type="time"
                    required
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="input_fin">
                  Hora Fin *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Clock className="w-5 h-5" />
                  </span>
                  <input
                    id="input_fin"
                    type="time"
                    required
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sucua-green focus:border-transparent min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tipo de Jornada
                </label>
                <div className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-700 font-semibold rounded-lg min-h-[44px] flex items-center">
                  {tipoJornada === 'suplementaria' ? 'Suplementaria (Semana)' : 'Extraordinaria (Finde/Feriado)'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" disabled={submitting} variant="primary">
                {submitting ? 'Guardando...' : 'Enviar para Aprobación'}
              </Button>
            </div>
          </form>
        </div>

        {/* Columna Visualizador Glassmorphism */}
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          {/* Fondo translúcido decorativo */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
          
          <div className="space-y-6 relative z-10">
            <h3 className="text-lg font-bold flex items-center text-sucua-yellow">
              <Calculator className="w-5 h-5 mr-2 animate-bounce" /> Cálculo en Vivo GAD Sucúa
            </h3>

            {funcionarioId ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-slate-300">Valor Hora Ordinaria:</p>
                  <p className="text-lg font-bold text-white">${liveValorOrdinario.toFixed(4)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-300">Horas Totales:</p>
                    <p className="text-md font-bold text-white">{liveHours.toFixed(2)}h</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-xs text-slate-300">Horas Nocturnas:</p>
                    <p className="text-md font-bold text-sucua-yellow">{liveNocturnas.toFixed(2)}h</p>
                  </div>
                </div>

                {liveNocturnas > 0 && (
                  <div className="p-3 bg-teal-800/40 border border-teal-500/30 rounded-lg text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-sucua-yellow flex-shrink-0" />
                    <span>Se aplicará recargo nocturno del +25% adicional a las horas correspondientes.</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-300 text-sm text-center py-10">
                Seleccione un funcionario y configure los horarios para ver la estimación de cobro.
              </p>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 mt-6 relative z-10">
            <p className="text-xs text-slate-400">Total Estimado a Cobrar:</p>
            <p className="text-4xl font-extrabold text-white mt-1">
              ${liveValor.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Historial de registros ingresados */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center">
          <FileCheck className="w-5 h-5 mr-2 text-sucua-green" />
          <h3 className="font-bold text-lg text-slate-900">Historial Reciente</h3>
        </div>
        <div className="overflow-x-auto">
          {/* Vista Tabla Desktop */}
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Funcionario</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Horario</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total Horas</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Monto Estimado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros.map((reg) => (
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

          {/* Vista Tarjetas para Móvil */}
          <div className="block md:hidden divide-y divide-slate-200">
            {registros.map((reg) => (
              <div key={reg.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">{reg.nombres_apellidos}</h4>
                    <p className="text-xs text-slate-500">{new Date(reg.fecha).toLocaleDateString()} ({reg.hora_inicio.substring(0,5)} - {reg.hora_fin.substring(0,5)})</p>
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

      {/* Contenedor de Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};
