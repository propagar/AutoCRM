import React from 'react';
import { useCRMStore } from '../store/useStore';
import { Users, Target, TrendingUp, PhoneCall } from 'lucide-react';

export function Dashboard() {
  const { goals, clients } = useCRMStore();

  const prospectProgress = Math.min((goals.currentProspects / goals.dailyProspects) * 100, 100);
  const salesProgress = Math.min((goals.currentSales / goals.monthlySales) * 100, 100);

  const stats = [
    { name: 'Total de Clientes', value: clients.length, icon: Users, color: 'bg-blue-500' },
    { name: 'Em Negociação', value: clients.filter(c => c.stage === 'Em Negociação').length, icon: TrendingUp, color: 'bg-yellow-500' },
    { name: 'Fichas Aprovadas', value: clients.filter(c => c.stage === 'Ficha Aprovada').length, icon: Target, color: 'bg-green-500' },
    { name: 'Atendimentos Hoje', value: goals.currentProspects, icon: PhoneCall, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resumo do Dia</h2>
        <p className="text-sm text-gray-500">Acompanhe seus números e metas.</p>
      </div>

      {/* Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Meta de Prospecções (Diária)</p>
              <h3 className="text-2xl font-bold text-gray-900">{goals.currentProspects} / {goals.dailyProspects}</h3>
            </div>
            <span className="text-sm font-medium text-blue-600">{Math.round(prospectProgress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${prospectProgress}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Meta de Vendas (Mensal)</p>
              <h3 className="text-2xl font-bold text-gray-900">{goals.currentSales} / {goals.monthlySales}</h3>
            </div>
            <span className="text-sm font-medium text-green-600">{Math.round(salesProgress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${salesProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className={`w-10 h-10 rounded-full ${stat.color} text-white flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.name}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
