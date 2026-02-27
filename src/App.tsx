/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';
import { ClientForm } from './pages/ClientForm';
import { Clients } from './pages/Clients';
import { ClientProfile } from './pages/ClientProfile';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { useCRMStore } from './store/useStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useCRMStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { theme, isAuthenticated, fetchInitialData, primaryColor, secondaryColor } = useCRMStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated, fetchInitialData]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply custom colors
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--color-secondary', secondaryColor);
    
    // Create lighter versions for backgrounds (with 15% opacity)
    // We'll use hex + 26 for 15% opacity
    root.style.setProperty('--color-primary-light', `${primaryColor}26`);
    root.style.setProperty('--color-secondary-light', `${secondaryColor}26`);
  }, [theme, primaryColor, secondaryColor]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="novo-cliente" element={<ClientForm />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="clientes/:id" element={<ClientProfile />} />
          <Route path="editar-cliente/:id" element={<ClientForm />} />
          <Route path="metas" element={<Goals />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
