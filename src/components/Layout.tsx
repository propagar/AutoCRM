import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useCRMStore } from '../store/useStore';
import { LayoutDashboard, Users, PlusCircle, BarChart2, Target, Settings, Sun, Moon } from 'lucide-react';

const mobileNavLinks = [
  { icon: LayoutDashboard, text: 'Dashboard', path: '/' },
  { icon: PlusCircle, text: 'Prospecção', path: '/novo-cliente' },
  { icon: BarChart2, text: 'Kanban', path: '/kanban' },
  { icon: Users, text: 'Clientes', path: '/clientes' },
  { icon: Settings, text: 'Ajustes', path: '/configuracoes' },
];

export function Layout() {
  const { isSidebarCollapsed, currentUser, theme, toggleTheme } = useCRMStore();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed h-full z-30">
        <Sidebar />
      </div>
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800 z-20 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={currentUser?.photoUrl || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=random`}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full mr-3"
            />
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role === 'gerente' ? 'Gerente' : 'Vendedor'}</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
      </div>
      
      <main className={`flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-300 md:ml-64 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pt-24 md:pt-8 pb-24 md:pb-8`}>
        <Outlet />
      </main>

      {/* Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 z-30">
        <div className="flex justify-around items-center h-16">
          {mobileNavLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end
              className={({ isActive }) => 
                `flex flex-col items-center justify-center text-xs w-full transition-colors ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`
              }
            >
              <link.icon className="w-6 h-6 mb-1" />
              <span>{link.text}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
