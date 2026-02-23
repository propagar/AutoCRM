import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Trello, Target, PlusCircle, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCRMStore } from '../../store/useStore';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Prospecção', path: '/novo-cliente', icon: PlusCircle },
  { name: 'Kanban', path: '/kanban', icon: Trello },
  { name: 'Meus Clientes', path: '/clientes', icon: Users },
  { name: 'Metas', path: '/metas', icon: Target },
  { name: 'Configurações', path: '/configuracoes', icon: SettingsIcon },
];

export function MainLayout() {
  const location = useLocation();
  const { currentUser } = useCRMStore();

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">AutoCRM</h1>
          <p className="text-xs text-gray-500 mt-1">Painel do Vendedor</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-blue-700" : "text-gray-400")} />
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm overflow-hidden">
              {currentUser.photoUrl ? (
                <img src={currentUser.photoUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-blue-700">AutoCRM</h1>
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm overflow-hidden">
            {currentUser.photoUrl ? (
              <img src={currentUser.photoUrl} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser.name.charAt(0)
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-20 pb-safe">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name} className="flex-1">
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center h-full w-full space-y-1",
                    isActive ? "text-blue-700" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn("w-6 h-6", isActive ? "text-blue-700" : "text-gray-400")} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
