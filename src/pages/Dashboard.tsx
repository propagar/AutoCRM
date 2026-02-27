import React from 'react';
import { useCRMStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Users, Target, TrendingUp, PhoneCall } from 'lucide-react';

export function Dashboard() {
  const { goals, allGoals, clients, currentUser } = useCRMStore();
  const navigate = useNavigate();

  const prospectProgress = Math.min((goals.currentProspects / (goals.dailyProspects || 1)) * 100, 100);
  const salesProgress = Math.min((goals.currentSales / (goals.monthlySales || 1)) * 100, 100);

  // Team Progress
  const teamDailyProspects = allGoals.reduce((acc, g) => acc + g.dailyProspects, 0);
  const teamMonthlySales = allGoals.reduce((acc, g) => acc + g.monthlySales, 0);
  const teamCurrentProspects = allGoals.reduce((acc, g) => acc + g.currentProspects, 0);
  const teamCurrentSales = allGoals.reduce((acc, g) => acc + g.currentSales, 0);

  const teamProspectProgress = Math.min((teamCurrentProspects / (teamDailyProspects || 1)) * 100, 100);
  const teamSalesProgress = Math.min((teamCurrentSales / (teamMonthlySales || 1)) * 100, 100);

  const stats = [
    { name: 'Total de Clientes', value: clients.length, icon: Users, color: 'bg-primary', link: '/clientes' },
    { name: 'Em Negociação', value: clients.filter(c => c.stage === 'Em Negociação').length, icon: TrendingUp, color: 'bg-yellow-500', link: `/clientes?stage=Em+Negociação` },
    { name: 'Fichas Aprovadas', value: clients.filter(c => c.stage === 'Ficha Aprovada').length, icon: Target, color: 'bg-green-500', link: `/clientes?stage=Ficha+Aprovada` },
    { name: 'Atendimentos Equipe', value: teamCurrentProspects, icon: PhoneCall, color: 'bg-secondary', link: '/clientes' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumo do Dia</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe seus números e metas da equipe.</p>
        </div>
      </div>

      {/* Metas Individuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Minha Meta Diária</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{goals.currentProspects} / {goals.dailyProspects}</h3>
            </div>
            <span className="text-sm font-medium text-primary dark:text-primary">{Math.round(prospectProgress)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-primary dark:bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${prospectProgress}%` }}></div>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50"
          onClick={() => navigate(`/clientes?stage=Vendido&salesperson=${currentUser?.name}`)}
        >
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Minha Meta Mensal</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{goals.currentSales} / {goals.monthlySales}</h3>
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">{Math.round(salesProgress)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${salesProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Metas da Equipe */}
      <div 
        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50"
        onClick={() => navigate(`/clientes?stage=Vendido`)}
      >
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Users className="w-4 h-4 mr-2 text-secondary" />
          Progresso da Equipe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Prospecções</span>
              <span className="font-bold text-secondary">{teamCurrentProspects} / {teamDailyProspects}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-secondary h-1.5 rounded-full transition-all duration-500" style={{ width: `${teamProspectProgress}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Vendas</span>
              <span className="font-bold text-green-600">{teamCurrentSales} / {teamMonthlySales}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${teamSalesProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <button 
            key={stat.name}
            onClick={() => stat.link && navigate(stat.link)}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left w-full"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
