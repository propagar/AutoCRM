import React, { useState } from 'react';
import { useCRMStore } from '../store/useStore';
import { Target, TrendingUp, Award, Calendar, ChevronRight } from 'lucide-react';

export function Goals() {
  const { goals, updateGoals } = useCRMStore();
  
  // For Manager View Simulation
  const [isManager, setIsManager] = useState(false);
  const [editGoals, setEditGoals] = useState({
    dailyProspects: goals.dailyProspects,
    monthlySales: goals.monthlySales
  });

  const prospectProgress = Math.min((goals.currentProspects / goals.dailyProspects) * 100, 100);
  const salesProgress = Math.min((goals.currentSales / goals.monthlySales) * 100, 100);

  const handleSaveGoals = () => {
    updateGoals({
      dailyProspects: Number(editGoals.dailyProspects),
      monthlySales: Number(editGoals.monthlySales)
    });
    alert('Metas atualizadas com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Metas e Desempenho</h2>
          <p className="text-sm text-gray-500">Acompanhe seus resultados e objetivos.</p>
        </div>
        <button 
          onClick={() => setIsManager(!isManager)}
          className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          {isManager ? 'Ver como Vendedor' : 'Ver como Gerente'}
        </button>
      </div>

      {/* Vendedor View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta Diária */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Prospecções Diárias</h3>
                <p className="text-sm text-gray-500">Falar com novos clientes</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-end mb-4">
              <div className="text-4xl font-black text-gray-900 tracking-tight">
                {goals.currentProspects} <span className="text-lg text-gray-400 font-medium">/ {goals.dailyProspects}</span>
              </div>
              <div className="text-lg font-bold text-blue-600">{Math.round(prospectProgress)}%</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ease-out ${prospectProgress >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                style={{ width: `${prospectProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              {prospectProgress >= 100 
                ? '🎉 Parabéns! Meta diária atingida!' 
                : `Faltam ${goals.dailyProspects - goals.currentProspects} prospecções para bater a meta.`}
            </p>
          </div>
        </div>

        {/* Meta Mensal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-4">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Vendas no Mês</h3>
                <p className="text-sm text-gray-500">Carros vendidos</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-end mb-4">
              <div className="text-4xl font-black text-gray-900 tracking-tight">
                {goals.currentSales} <span className="text-lg text-gray-400 font-medium">/ {goals.monthlySales}</span>
              </div>
              <div className="text-lg font-bold text-green-600">{Math.round(salesProgress)}%</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ease-out ${salesProgress >= 100 ? 'bg-yellow-400' : 'bg-green-500'}`}
                style={{ width: `${salesProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              {salesProgress >= 100 
                ? '🏆 Incrível! Meta mensal batida!' 
                : `Faltam ${goals.monthlySales - goals.currentSales} vendas para bater a meta.`}
            </p>
          </div>
        </div>
      </div>

      {/* Manager View - Edit Goals */}
      {isManager && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden mt-8">
          <div className="bg-purple-50 p-4 border-b border-purple-100">
            <h3 className="text-lg font-bold text-purple-900 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Visão do Gerente: Definir Metas
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Diária de Prospecções</label>
                <input
                  type="number"
                  value={editGoals.dailyProspects}
                  onChange={(e) => setEditGoals({...editGoals, dailyProspects: Number(e.target.value)})}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Mensal de Vendas</label>
                <input
                  type="number"
                  value={editGoals.monthlySales}
                  onChange={(e) => setEditGoals({...editGoals, monthlySales: Number(e.target.value)})}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleSaveGoals}
                className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-sm"
              >
                Salvar Novas Metas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
