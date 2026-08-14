import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    funcionariosCount: 0,
    pendientesCount: 0,
    autorizadosCount: 0,
    totalMonto: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [funcRes, horasRes] = await Promise.all([
          api.get('/funcionarios'),
          api.get('/horas-extra')
        ]);

        const funcionarios = funcRes.data;
        const horas = horasRes.data;

        const funcActivos = funcionarios.filter((f: any) => f.estado).length;
        const pendientes = horas.filter((h: any) => h.estado === 'pendiente').length;
        const autorizados = horas.filter((h: any) => h.estado === 'autorizado');
        const montoTotal = autorizados.reduce((acc: number, curr: any) => acc + parseFloat(curr.valor_calculado), 0);

        setStats({
          funcionariosCount: funcActivos,
          pendientesCount: pendientes,
          autorizadosCount: autorizados.length,
          totalMonto: montoTotal
        });
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <h1 className="text-3xl font-extrabold text-slate-950">
          Hola, <span className="text-sucua-green">{user?.username}</span>
        </h1>
        <p className="text-slate-600 mt-1">Bienvenido al Panel del Control de Horas Extras del GAD Sucúa.</p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Funcionarios */}
        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-lg flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-teal-100/50 text-sucua-green">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Funcionarios Activos</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.funcionariosCount}</h3>
          </div>
        </div>

        {/* Card Pendientes */}
        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-lg flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-amber-100/50 text-sucua-yellow">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Pendientes Autorización</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.pendientesCount}</h3>
          </div>
        </div>

        {/* Card Autorizados */}
        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-lg flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-100/50 text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Registros Aprobados</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.autorizadosCount}</h3>
          </div>
        </div>

        {/* Card Presupuesto */}
        <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-lg flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-100/50 text-emerald-800">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Monto Aprobado</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">${stats.totalMonto.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Tarjeta Informativa Grande */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white shadow-xl">
        <h2 className="text-xl font-bold">Instrucciones de Ley (LOSEP)</h2>
        <p className="text-slate-300 mt-2 text-sm leading-relaxed max-w-3xl">
          Recuerde que toda hora suplementaria ingresada al sistema debe contar con autorización previa.
          Las horas extraordinarias laboradas en días de descanso obligatorio (sábados y domingos) o feriados se liquidan con el 100% de recargo. 
          El sistema está bloqueando de forma automatizada los excedentes sobre 4 horas suplementarias diarias y 12 semanales.
        </p>
      </div>
    </div>
  );
};
