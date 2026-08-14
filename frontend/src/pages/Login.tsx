import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import api from '../services/api';
import { Shield, Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión. Inténtelo más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-slate-900 via-teal-950 to-slate-950 px-4">
      {/* Tarjeta con Glassmorphism */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-sucua-green/20 rounded-full border border-sucua-green/30 mb-3 animate-pulse">
            <Shield className="w-10 h-10 text-sucua-yellow" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">GAD Municipal Sucúa</h1>
          <p className="text-slate-300 text-sm mt-1">Control de Horas Extra</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/60 border border-red-500/50 rounded-lg text-white text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-200 text-sm font-semibold mb-2" htmlFor="username">
              Usuario
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-950/60 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sucua-yellow focus:border-transparent min-h-[44px]"
                placeholder="Nombre de usuario"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-200 text-sm font-semibold mb-2" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-950/60 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sucua-yellow focus:border-transparent min-h-[44px]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="secondary"
            fullWidth
            disabled={submitting}
            className="font-bold py-3 mt-4 text-slate-950 transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          >
            {submitting ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </Button>
        </form>
      </div>
    </div>
  );
};
