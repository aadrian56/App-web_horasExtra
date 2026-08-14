import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Funcionarios } from './pages/Funcionarios';
import { RegistroHoras } from './pages/RegistroHoras';
import { Aprobaciones } from './pages/Aprobaciones';
import { Reportes } from './pages/Reportes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    
                    {/* Rutas de Operador y Admin */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'operador']} />}>
                      <Route path="/funcionarios" element={<Funcionarios />} />
                      <Route path="/registro" element={<RegistroHoras />} />
                    </Route>

                    {/* Rutas de Autorizador y Admin */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'autorizador']} />}>
                      <Route path="/aprobaciones" element={<Aprobaciones />} />
                    </Route>

                    {/* Ruta de Reportes (Accesible a todos) */}
                    <Route path="/reportes" element={<Reportes />} />
                  </Routes>
                </Layout>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
