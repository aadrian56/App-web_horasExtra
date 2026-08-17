import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { calcularHorasNocturnas } from '../utils/calculations';
import { 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Filter, 
  User, 
  X, 
  Briefcase, 
  ChevronRight, 
  Award, 
  RefreshCw,
  Clock
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Datos crudos de la API
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [horasExtra, setHorasExtra] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de Filtros
  const [filtroRango, setFiltroRango] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroFuncionarioId, setFiltroFuncionarioId] = useState<number | null>(null);

  // Estado de interactividad para los gráficos
  const [activeDoughnutIndex, setActiveDoughnutIndex] = useState<number | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Función para obtener datos
  const fetchData = async () => {
    try {
      const [funcRes, horasRes] = await Promise.all([
        api.get('/funcionarios'),
        api.get('/horas-extra')
      ]);
      setFuncionarios(funcRes.data);
      setHorasExtra(horasRes.data);
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    initFetch();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // 1. Filtrado Reactivo de Datos usando useMemo
  const filteredData = useMemo(() => {
    let result = [...horasExtra];

    // Filtro por tipo de funcionario
    if (filtroTipo !== 'todos') {
      result = result.filter(h => h.funcionario_tipo === filtroTipo);
    }

    // Filtro por estado del registro
    if (filtroEstado !== 'todos') {
      result = result.filter(h => h.estado === filtroEstado);
    }

    // Filtro por funcionario individual (Drill-down)
    if (filtroFuncionarioId !== null) {
      result = result.filter(h => h.funcionario_id === filtroFuncionarioId);
    }

    // Filtro por rango de fecha
    if (filtroRango !== 'todos') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed

      result = result.filter(h => {
        // Evitamos problemas de zona horaria parseando la fecha localmente
        const hDate = new Date(h.fecha + 'T00:00:00');
        
        if (filtroRango === 'mes_actual') {
          return hDate.getFullYear() === currentYear && hDate.getMonth() === currentMonth;
        } else if (filtroRango === 'mes_anterior') {
          const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return hDate.getFullYear() === targetYear && hDate.getMonth() === targetMonth;
        } else if (filtroRango === 'ultimos_30_dias') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return hDate >= thirtyDaysAgo && hDate <= now;
        }
        return true;
      });
    }

    return result;
  }, [horasExtra, filtroTipo, filtroEstado, filtroRango, filtroFuncionarioId]);

  // 2. Cálculos de Contadores de Métricas en base a filtros
  const metrics = useMemo(() => {
    // Total Funcionarios Activos según filtros aplicables a funcionarios
    let activeFuncs = funcionarios.filter(f => f.estado);
    if (filtroTipo !== 'todos') {
      activeFuncs = activeFuncs.filter(f => f.tipo === filtroTipo);
    }
    if (filtroFuncionarioId !== null) {
      activeFuncs = activeFuncs.filter(f => f.id === filtroFuncionarioId);
    }

    const pendientes = filteredData.filter(h => h.estado === 'pendiente').length;
    const aprobados = filteredData.filter(h => h.estado === 'autorizado');
    const totalMontoAprobado = aprobados.reduce((acc, curr) => acc + parseFloat(curr.valor_calculado || 0), 0);

    return {
      funcionariosActivos: activeFuncs.length,
      pendientesCount: pendientes,
      aprobadosCount: aprobados.length,
      totalMonto: totalMontoAprobado
    };
  }, [funcionarios, filteredData, filtroTipo, filtroFuncionarioId]);

  // 3. Procesar datos para Gráfico de Dona (Distribución de Horas y Monto por Tipo de Recargo)
  const doughnutData = useMemo(() => {
    let supDiurnaMonto = 0;
    let supNocturnaMonto = 0;
    let extDiurnaMonto = 0;
    let extNocturnaMonto = 0;

    let supDiurnaHoras = 0;
    let supNocturnaHoras = 0;
    let extDiurnaHoras = 0;
    let extNocturnaHoras = 0;

    filteredData.forEach(h => {
      const horasTotales = parseFloat(h.horas_calculadas || 0);
      const inicio = h.hora_inicio.slice(0, 5);
      const fin = h.hora_fin.slice(0, 5);
      const horasNocturnas = calcularHorasNocturnas(inicio, fin);
      const horasDiurnas = Math.max(0, horasTotales - horasNocturnas);
      
      const rmu = parseFloat(h.rmu_historico || 0);
      const valorHoraOrdinaria = rmu / 240;

      if (h.tipo_jornada === 'suplementaria') {
        supDiurnaHoras += horasDiurnas;
        supNocturnaHoras += horasNocturnas;
        supDiurnaMonto += horasDiurnas * valorHoraOrdinaria * 1.25;
        // Suplementaria + Nocturna = recargo 50%
        supNocturnaMonto += horasNocturnas * valorHoraOrdinaria * 1.50;
      } else {
        extDiurnaHoras += horasDiurnas;
        extNocturnaHoras += horasNocturnas;
        extDiurnaMonto += horasDiurnas * valorHoraOrdinaria * 2.00;
        // Extraordinaria + Nocturna = recargo 125%
        extNocturnaMonto += horasNocturnas * valorHoraOrdinaria * 2.25;
      }
    });

    const totalMonto = supDiurnaMonto + supNocturnaMonto + extDiurnaMonto + extNocturnaMonto;
    const totalHoras = supDiurnaHoras + supNocturnaHoras + extDiurnaHoras + extNocturnaHoras;

    return {
      categories: [
        { name: 'Suple. Diurna (25%)', value: supDiurnaMonto, horas: supDiurnaHoras, color: '#0D9488', className: 'bg-teal-600' },
        { name: 'Suple. Nocturna (50%)', value: supNocturnaMonto, horas: supNocturnaHoras, color: '#2DD4BF', className: 'bg-teal-400' },
        { name: 'Extra. Diurna (100%)', value: extDiurnaMonto, horas: extDiurnaHoras, color: '#F59E0B', className: 'bg-amber-500' },
        { name: 'Extra. Nocturna (125%)', value: extNocturnaMonto, horas: extNocturnaHoras, color: '#EA580C', className: 'bg-orange-600' }
      ],
      totalMonto,
      totalHoras
    };
  }, [filteredData]);

  // Generar segmentos del círculo para la Dona SVG
  const doughnutSegments = useMemo(() => {
    const C = 2 * Math.PI * 32; // Circunferencia con r=32 es ~201.06
    let accumulatedPercent = 0;

    if (doughnutData.totalMonto === 0) {
      return [{
        strokeDasharray: `${C} ${C}`,
        strokeDashoffset: 0,
        color: '#E2E8F0', // slate-200
        index: -1,
        name: 'Sin registros',
        value: 0,
        horas: 0
      }];
    }

    return doughnutData.categories.map((cat, idx) => {
      const percent = doughnutData.totalMonto > 0 ? (cat.value / doughnutData.totalMonto) * 100 : 0;
      const strokeDasharray = `${(percent / 100) * C} ${C}`;
      const strokeDashoffset = -((accumulatedPercent / 100) * C);
      accumulatedPercent += percent;

      return {
        ...cat,
        strokeDasharray,
        strokeDashoffset,
        index: idx,
        percent
      };
    });
  }, [doughnutData]);

  // 4. Procesar datos para Gráfico de Barras (Tendencia de Horas Extra)
  const trendData = useMemo(() => {
    const groups: { [key: string]: { label: string; valor: number; horas: number } } = {};

    if (filtroRango === 'todos') {
      // Agrupar por mes y año
      filteredData.forEach(h => {
        const dateParts = h.fecha.split('-');
        const year = dateParts[0];
        const monthIndex = parseInt(dateParts[1]) - 1;
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const label = `${months[monthIndex]} ${year.slice(2)}`;
        const key = `${year}-${dateParts[1]}`;

        if (!groups[key]) {
          groups[key] = { label, valor: 0, horas: 0 };
        }
        groups[key].valor += parseFloat(h.valor_calculado || 0);
        groups[key].horas += parseFloat(h.horas_calculadas || 0);
      });

      return Object.keys(groups)
        .sort()
        .slice(-6) // Últimos 6 meses con datos
        .map(k => groups[k]);
    } else {
      // Agrupar por semanas para rangos menores
      const weeks = [
        { label: 'Semana 1', min: 1, max: 7, valor: 0, horas: 0 },
        { label: 'Semana 2', min: 8, max: 14, valor: 0, horas: 0 },
        { label: 'Semana 3', min: 15, max: 21, valor: 0, horas: 0 },
        { label: 'Semana 4', min: 22, max: 28, valor: 0, horas: 0 },
        { label: 'Semana 5', min: 29, max: 31, valor: 0, horas: 0 }
      ];

      filteredData.forEach(h => {
        const dateParts = h.fecha.split('-');
        const day = parseInt(dateParts[2]);

        const week = weeks.find(w => day >= w.min && day <= w.max);
        if (week) {
          week.valor += parseFloat(h.valor_calculado || 0);
          week.horas += parseFloat(h.horas_calculadas || 0);
        }
      });

      return weeks.filter(w => w.valor > 0 || w.horas > 0 || filtroRango !== 'ultimos_30_dias');
    }
  }, [filteredData, filtroRango]);

  const maxTrendVal = useMemo(() => {
    return Math.max(...trendData.map(d => d.valor), 10);
  }, [trendData]);

  // 5. Ranking Top 5 Funcionarios con más horas / monto acumulado
  const topFuncionarios = useMemo(() => {
    const registry: { [id: number]: { id: number; nombre: string; tipo: string; totalHoras: number; totalMonto: number } } = {};

    filteredData.forEach(h => {
      const fid = h.funcionario_id;
      if (!registry[fid]) {
        registry[fid] = {
          id: fid,
          nombre: h.nombres_apellidos,
          tipo: h.funcionario_tipo,
          totalHoras: 0,
          totalMonto: 0
        };
      }
      registry[fid].totalHoras += parseFloat(h.horas_calculadas || 0);
      registry[fid].totalMonto += parseFloat(h.valor_calculado || 0);
    });

    return Object.values(registry)
      .sort((a, b) => b.totalMonto - a.totalMonto)
      .slice(0, 5);
  }, [filteredData]);

  const maxEmployeeMonto = useMemo(() => {
    return Math.max(...topFuncionarios.map(f => f.totalMonto), 1);
  }, [topFuncionarios]);

  const activeEmployeeFilterName = useMemo(() => {
    if (filtroFuncionarioId === null) return '';
    const emp = funcionarios.find(f => f.id === filtroFuncionarioId);
    return emp ? emp.nombres_apellidos : '';
  }, [filtroFuncionarioId, funcionarios]);

  const hasActiveFilters = filtroRango !== 'todos' || filtroTipo !== 'todos' || filtroEstado !== 'todos' || filtroFuncionarioId !== null;

  const handleResetFilters = () => {
    setFiltroRango('todos');
    setFiltroTipo('todos');
    setFiltroEstado('todos');
    setFiltroFuncionarioId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sucua-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hola, <span className="text-sucua-green">{user?.username}</span>
          </h1>
          <p className="text-slate-500 mt-1">Panel de control de Horas Extras del GAD Municipal Cantón Sucúa.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center self-start px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sucua-green cursor-pointer h-[44px]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin text-sucua-green' : 'text-slate-500'}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Barra de Filtros Interactiva (Glassmorphism) */}
      <div className="p-4 bg-white/85 border border-slate-200/60 backdrop-blur-md rounded-2xl shadow-md flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center text-slate-600 font-semibold text-xs uppercase mr-2">
            <Filter className="w-4 h-4 mr-1.5 text-sucua-green" />
            Filtrar Datos
          </div>

          {/* Rango de Fechas */}
          <div className="relative">
            <select
              value={filtroRango}
              onChange={(e) => setFiltroRango(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sucua-green cursor-pointer h-[40px] hover:border-slate-300"
            >
              <option value="todos">Todos los registros</option>
              <option value="mes_actual">Este Mes</option>
              <option value="mes_anterior">Mes Anterior</option>
              <option value="ultimos_30_dias">Últimos 30 días</option>
            </select>
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          {/* Tipo de Funcionario */}
          <div className="relative">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sucua-green cursor-pointer h-[40px] hover:border-slate-300"
            >
              <option value="todos">Todos los Funcionarios</option>
              <option value="guardia">Guardias</option>
              <option value="limpieza">Limpieza</option>
            </select>
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          {/* Estado de Horas */}
          <div className="relative">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sucua-green cursor-pointer h-[40px] hover:border-slate-300"
            >
              <option value="todos">Todos los Estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="autorizado">Autorizados</option>
              <option value="rechazado">Rechazados</option>
            </select>
            <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Botón para Limpiar Filtros */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Alerta de Drill-down Activo */}
      {filtroFuncionarioId !== null && (
        <div className="flex items-center justify-between p-3.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl shadow-sm text-sm animate-fade-in">
          <div className="flex items-center font-medium">
            <User className="w-4 h-4 mr-2 text-sucua-green" />
            Filtro de Drill-down activo para el funcionario:{' '}
            <span className="font-extrabold ml-1 underline">{activeEmployeeFilterName}</span>
          </div>
          <button
            onClick={() => setFiltroFuncionarioId(null)}
            className="p-1 rounded-full hover:bg-teal-100 text-teal-600 transition-colors duration-150 cursor-pointer"
            title="Quitar filtro de funcionario"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid de Estadísticas (Reactivo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Funcionarios Activos */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-lg flex items-center space-x-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="p-3.5 rounded-xl bg-teal-50 text-sucua-green">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Funcionarios Activos</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.funcionariosActivos}</h3>
          </div>
        </div>

        {/* Pendientes Autorización */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-lg flex items-center space-x-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="p-3.5 rounded-xl bg-amber-50 text-sucua-yellow">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pendientes Autorización</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.pendientesCount}</h3>
          </div>
        </div>

        {/* Registros Aprobados */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-lg flex items-center space-x-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Registros Aprobados</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.aprobadosCount}</h3>
          </div>
        </div>

        {/* Monto Aprobado */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-lg flex items-center space-x-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Monto Aprobado</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">${metrics.totalMonto.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Sección de Gráficos Nativos Interactivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dona: Distribución de Horas y Recargos */}
        <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <span className="w-2.5 h-2.5 bg-sucua-green rounded-full mr-2"></span>
              Distribución por Tipo de Hora y Recargos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Participación sobre el total acumulado en dólares ($)</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-6">
            {/* Gráfico SVG Dona */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <g transform="rotate(-90 50 50)">
                  {doughnutSegments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="32"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={activeDoughnutIndex === idx ? '8' : '6.5'}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => seg.index !== -1 && setActiveDoughnutIndex(seg.index)}
                      onMouseLeave={() => setActiveDoughnutIndex(null)}
                    />
                  ))}
                </g>

                {/* Centro interactivo */}
                <circle cx="50" cy="50" r="26.5" fill="white" />
                <g transform="translate(50, 50)" textAnchor="middle">
                  {activeDoughnutIndex === null ? (
                    <>
                      <text y="-5" fontSize="4.5" fontWeight="bold" className="fill-slate-400 font-semibold tracking-wider">MONTO TOTAL</text>
                      <text y="5" fontSize="7.5" fontWeight="900" className="fill-slate-800">
                        ${doughnutData.totalMonto.toFixed(2)}
                      </text>
                      <text y="13" fontSize="4" className="fill-slate-500 font-medium">
                        {doughnutData.totalHoras.toFixed(1)} hrs tot.
                      </text>
                    </>
                  ) : (
                    <>
                      <text y="-9" fontSize="3.5" fontWeight="bold" fill={doughnutData.categories[activeDoughnutIndex].color} className="uppercase tracking-wider">
                        {doughnutData.categories[activeDoughnutIndex].name.split(' (')[0]}
                      </text>
                      <text y="1.5" fontSize="7" fontWeight="900" className="fill-slate-800">
                        ${doughnutData.categories[activeDoughnutIndex].value.toFixed(2)}
                      </text>
                      <text y="9.5" fontSize="3.8" className="fill-slate-500 font-medium">
                        {doughnutData.categories[activeDoughnutIndex].horas.toFixed(1)} horas
                      </text>
                      <text y="16" fontSize="4.5" fontWeight="extrabold" fill={doughnutData.categories[activeDoughnutIndex].color}>
                        {doughnutData.totalMonto > 0 
                          ? ((doughnutData.categories[activeDoughnutIndex].value / doughnutData.totalMonto) * 100).toFixed(1)
                          : 0}%
                      </text>
                    </>
                  )}
                </g>
              </svg>
            </div>

            {/* Leyenda Detallada */}
            <div className="flex flex-col gap-2.5 w-full sm:w-auto">
              {doughnutSegments.map((seg, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all duration-200 ${
                    activeDoughnutIndex === idx 
                      ? 'bg-slate-50 border-slate-300/80 translate-x-1 shadow-sm font-semibold' 
                      : 'border-transparent font-medium text-slate-600'
                  }`}
                  onMouseEnter={() => seg.index !== -1 && setActiveDoughnutIndex(seg.index)}
                  onMouseLeave={() => setActiveDoughnutIndex(null)}
                >
                  <div className="flex items-center mr-6">
                    <span 
                      className="w-3 h-3 rounded-full mr-2.5 flex-shrink-0"
                      style={{ backgroundColor: seg.color }}
                    ></span>
                    <span>{seg.name}</span>
                  </div>
                  <span className="text-slate-800 font-bold ml-auto">${seg.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de Barras: Tendencia Temporal */}
        <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <span className="w-2.5 h-2.5 bg-sucua-yellow rounded-full mr-2"></span>
              Tendencia de Pago de Horas Extra
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {filtroRango === 'todos' ? 'Monto acumulado por mes' : 'Monto acumulado por semana en el período'}
            </p>
          </div>

          <div className="relative mt-6 w-full flex-grow flex items-end">
            {trendData.length === 0 ? (
              <div className="flex items-center justify-center w-full h-[180px] bg-slate-50 rounded-xl text-xs text-slate-400 font-semibold border border-dashed border-slate-200">
                Sin datos suficientes en este rango
              </div>
            ) : (
              <svg viewBox="0 0 450 200" className="w-full h-full overflow-visible">
                {/* Líneas guía horizontal */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const yVal = 170 - ratio * 150;
                  const labelVal = ratio * maxTrendVal;
                  return (
                    <g key={idx} className="opacity-45">
                      <line x1="45" y1={yVal} x2="435" y2={yVal} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                      <text x="38" y={yVal + 3} fontSize="7" fontWeight="semibold" fill="#94A3B8" textAnchor="end">
                        ${Math.round(labelVal)}
                      </text>
                    </g>
                  );
                })}

                {/* Dibujo de las barras */}
                {trendData.map((d, i) => {
                  const barCount = trendData.length;
                  const barWidth = Math.floor(390 / barCount) - 16;
                  const spacing = 16;
                  const x = 45 + i * (barWidth + spacing) + spacing / 2;
                  const h = (d.valor / maxTrendVal) * 150;
                  const y = 170 - h;

                  return (
                    <g key={i}>
                      {/* Barra de Fondo en Hover */}
                      <rect
                        x={x - 4}
                        y="15"
                        width={barWidth + 8}
                        height="160"
                        fill="#F8FAFC"
                        className="opacity-0 hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(i)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      />

                      {/* Barra de Color */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(h, 2)}
                        rx="3.5"
                        ry="3.5"
                        fill={hoveredBarIndex === i ? '#F59E0B' : '#0F766E'}
                        className="transition-colors duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(i)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      />

                      {/* Tooltip Integrado */}
                      {hoveredBarIndex === i && (
                        <g transform={`translate(${x + barWidth / 2}, ${y - 12})`} className="pointer-events-none animate-fade-in z-20">
                          <rect x="-35" y="-18" width="70" height="22" rx="5" fill="#0F172A" />
                          <text y="-5" fontSize="7.5" fill="white" textAnchor="middle" fontWeight="black">
                            ${d.valor.toFixed(2)}
                          </text>
                          <text y="1" fontSize="5.5" fill="#94A3B8" textAnchor="middle">
                            {d.horas.toFixed(1)} hrs
                          </text>
                          <polygon points="-4,4 4,4 0,8" fill="#0F172A" transform="translate(0, -4)" />
                        </g>
                      )}

                      {/* Label en el eje X */}
                      <text x={x + barWidth / 2} y="186" fontSize="7.5" fontWeight="bold" fill="#64748B" textAnchor="middle">
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Grid Inferior: Ranking y Listado Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Funcionarios con más Horas (1 col) */}
        <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-sucua-yellow" />
              Top 5 Funcionarios
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Clic en funcionario para aislar datos (Drill-down)</p>
          </div>

          <div className="mt-5 space-y-4.5 flex-grow">
            {topFuncionarios.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl">
                Sin datos de funcionarios
              </div>
            ) : (
              topFuncionarios.map((f, idx) => {
                const percent = (f.totalMonto / maxEmployeeMonto) * 100;
                const isSelected = filtroFuncionarioId === f.id;

                return (
                  <div
                    key={f.id}
                    onClick={() => handleFuncionarioClick(f.id)}
                    className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer border ${
                      isSelected 
                        ? 'border-sucua-green bg-teal-50/45 shadow-sm' 
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center min-w-0">
                        <span className="text-xs font-black text-slate-400 mr-2 w-4">#{idx + 1}</span>
                        <p className="text-xs font-bold text-slate-800 truncate" title={f.nombre}>{f.nombre}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-700 ml-2">${f.totalMonto.toFixed(2)}</span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                          isSelected 
                            ? 'from-emerald-500 to-sucua-green shadow-sm' 
                            : 'from-sucua-green to-teal-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-1 uppercase">
                      <span>{f.tipo === 'guardia' ? '💂 Guardia' : '🧹 Limpieza'}</span>
                      <span>{f.totalHoras.toFixed(1)} Horas</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Últimos Movimientos (2 cols) */}
        <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-lg lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Últimos Movimientos</h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                Coincidentes: {filteredData.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Registros recientes de horas extras ingresados.</p>
          </div>

          <div className="mt-4 flex-grow overflow-x-auto">
            {filteredData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl">
                Ningún registro coincide con los filtros activos
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5">Funcionario</th>
                    <th className="py-2.5">Fecha</th>
                    <th className="py-2.5">Tipo</th>
                    <th className="py-2.5 text-center">Horas</th>
                    <th className="py-2.5 text-right">Monto</th>
                    <th className="py-2.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredData.slice(0, 5).map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="py-3">
                        <div className="font-bold text-slate-800">{h.nombres_apellidos}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{h.cedula}</div>
                      </td>
                      <td className="py-3">{h.fecha}</td>
                      <td className="py-3 capitalize">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          h.tipo_jornada === 'suplementaria' 
                            ? 'bg-teal-50 text-teal-700' 
                            : 'bg-amber-50 text-amber-800'
                        }`}>
                          {h.tipo_jornada}
                        </span>
                      </td>
                      <td className="py-3 text-center font-bold">{parseFloat(h.horas_calculadas).toFixed(1)}h</td>
                      <td className="py-3 text-right font-bold text-slate-800">${parseFloat(h.valor_calculado).toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <StatusBadge status={h.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Tarjeta Informativa Grande */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-sucua-yellow" />
            Control de Límites Legales (LOSEP)
          </h2>
          <p className="text-slate-300 mt-2 text-xs leading-relaxed">
            El sistema valida de forma automática que ningún funcionario de tipo Guardia o Limpieza exceda las **4 horas suplementarias al día** ni las **12 horas suplementarias a la semana** en concordancia con el marco legal ecuatoriano. Toda hora calculada y autorizada es inmutable, garantizando transparencia en la rendición de cuentas institucional del GAD Sucúa.
          </p>
        </div>
      </div>
    </div>
  );
};

