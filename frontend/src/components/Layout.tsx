import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, Clock, CheckSquare, FileText, LayoutDashboard, Calendar, Briefcase } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Inicio', icon: <LayoutDashboard className="w-5 h-5 mr-3" />, roles: ['admin', 'autorizador', 'operador'] },
    { path: '/funcionarios', label: 'Funcionarios', icon: <Users className="w-5 h-5 mr-3" />, roles: ['admin', 'operador'] },
    { path: '/feriados', label: 'Feriados', icon: <Calendar className="w-5 h-5 mr-3" />, roles: ['admin'] },
    { path: '/administrativos', label: 'Firmas / Cargos', icon: <Briefcase className="w-5 h-5 mr-3" />, roles: ['admin'] },
    { path: '/registro', label: 'Registrar Horas', icon: <Clock className="w-5 h-5 mr-3" />, roles: ['admin', 'operador'] },
    { path: '/aprobaciones', label: 'Aprobaciones', icon: <CheckSquare className="w-5 h-5 mr-3" />, roles: ['admin', 'autorizador'] },
    { path: '/reportes', label: 'Reportes', icon: <FileText className="w-5 h-5 mr-3" />, roles: ['admin', 'autorizador', 'operador'] },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar para pantallas medianas/grandes */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 text-white flex-shrink-0 border-r border-slate-800">
        <div className="flex items-center justify-between px-6 py-5 bg-slate-950">
          <div>
            <h2 className="font-bold text-lg text-white">GAD SUCÚA</h2>
            <p className="text-xs text-slate-400">Panel Administrativo</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            if (user && item.roles.includes(user.role)) {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                    active
                      ? 'bg-sucua-green text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            }
            return null;
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-xs text-slate-400">Usuario:</p>
            <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sucua-yellow text-slate-950 uppercase">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-950 hover:text-red-300 text-slate-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Area principal de contenido */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Header para móviles */}
        <header className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white md:hidden border-b border-slate-800 flex-shrink-0">
          <h2 className="font-bold text-md text-white">GAD Sucúa</h2>
          <div className="flex items-center space-x-3">
            <span className="text-xs bg-sucua-yellow text-slate-950 px-2 py-0.5 rounded font-bold uppercase">
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="p-1 text-slate-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Sub-navegación móvil de iconos rápidos */}
        <nav className="flex md:hidden justify-around py-2 bg-slate-850 border-b border-slate-800 text-slate-300 flex-shrink-0">
          {menuItems.map((item) => {
            if (user && item.roles.includes(user.role)) {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded text-[10px] min-h-[44px] min-w-[44px] justify-center ${
                    active ? 'text-sucua-yellow font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.icon}
                </Link>
              );
            }
            return null;
          })}
        </nav>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};
