import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCRMStore } from '../store/useStore';
import { LayoutDashboard, Users, PlusCircle, BarChart2, Target, Settings, LogOut, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';

const navLinks = [
  { icon: LayoutDashboard, text: 'Dashboard', path: '/' },
  { icon: PlusCircle, text: 'Prospecção', path: '/novo-cliente' },
  { icon: BarChart2, text: 'Kanban', path: '/kanban' },
  { icon: Users, text: 'Meus Clientes', path: '/clientes' },
  { icon: Target, text: 'Metas', path: '/metas' },
  { icon: Settings, text: 'Configurações', path: '/configuracoes' },
];

export function Sidebar() {
  const { currentUser, logout, theme, toggleTheme, isSidebarCollapsed, toggleSidebar } = useCRMStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const panelTitle = currentUser?.role === 'gerente' ? 'Painel do Gerente' : 'Painel do Vendedor';

  return (
    <div className={`h-screen bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 flex flex-col p-4 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="mb-8 flex items-center justify-between">
        <div className={`overflow-hidden transition-all duration-200 ${isSidebarCollapsed ? 'w-0' : 'w-auto'}`}>
          <h1 className="text-2xl font-bold text-primary dark:text-white whitespace-nowrap">AutoCRM</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{currentUser?.role === 'gerente' ? 'Painel do Gerente' : 'Painel do Vendedor'}</p>
        </div>
        <button onClick={toggleSidebar} className="hidden md:block p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`
            }
          >
            <link.icon className={`w-5 h-5 ${!isSidebarCollapsed ? 'mr-3' : ''}`} />
            <span className={isSidebarCollapsed ? 'hidden' : 'block'}>{link.text}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <button 
          onClick={toggleTheme}
          className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className={isSidebarCollapsed ? 'hidden' : 'ml-3'}>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>

        <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center overflow-hidden transition-all duration-200 ${isSidebarCollapsed ? 'w-0' : 'w-auto'}`}>
              <img 
                src={currentUser?.photoUrl || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=random`}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate whitespace-nowrap">{currentUser?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors p-2 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
