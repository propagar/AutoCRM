/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';
import { ClientForm } from './pages/ClientForm';
import { Clients } from './pages/Clients';
import { ClientProfile } from './pages/ClientProfile';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="novo-cliente" element={<ClientForm />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="clientes/:id" element={<ClientProfile />} />
          <Route path="metas" element={<Goals />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
