import React, { useState } from 'react';
import { useCRMStore } from '../store/useStore';
import { Target, TrendingUp, Award, Users, ChevronDown, Save, RefreshCcw } from 'lucide-react';
import { cn } from '../utils/cn';

export function Goals() {
  const { goals, allGoals, users, updateGoals, updateUserGoals, currentUser, resetCurrentUsersSales } = useCRMStore();
  
  const [isManagerView, setIsManagerView] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [editGoals, setEditGoals] = useState({
    dailyProspects: 10,
    monthlySales: 5
  });

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Individual Progress
  const prospectProgress = Math.min((goals.currentProspects / goals.dailyProspects) * 100, 100);
  const salesProgress = Math.min((goals.currentSales / goals.monthlySales) * 100, 100);

  // Team Progress
  const teamDailyProspects = allGoals.reduce((acc, g) => acc + g.dailyProspects, 0);
  const teamMonthlySales = allGoals.reduce((acc, g) => acc + g.monthlySales, 0);
  const teamCurrentProspects = allGoals.reduce((acc, g) => acc + g.currentProspects, 0);
  const teamCurrentSales = allGoals.reduce((acc, g) => acc + g.currentSales, 0);

  const teamProspectProgress = Math.min((teamCurrentProspects / (teamDailyProspects || 1)) * 100, 100);
  const teamSalesProgress = Math.min((teamCurrentSales / (teamMonthlySales || 1)) * 100, 100);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    const userGoal = allGoals.find(g => g.userId === userId);
    if (userGoal) {
      setEditGoals({
        dailyProspects: userGoal.dailyProspects,
        monthlySales: userGoal.monthlySales
      });
    } else {
      setEditGoals({ dailyProspects: 10, monthlySales: 5 });
    }
  };

  const handleSaveUserGoals = async () => {
    if (!selectedUserId) return;

    // Find the user's current goal to get existing current values
    const currentGoal = allGoals.find(g => g.userId === selectedUserId);

    await updateUserGoals(selectedUserId, {
      dailyProspects: Number(editGoals.dailyProspects),
      monthlySales: Number(editGoals.monthlySales),
      currentProspects: currentGoal?.currentProspects || 0, // Preserve current progress
      currentSales: currentGoal?.currentSales || 0, // Preserve current progress
    });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const salespeople = users.filter(u => u.role === 'vendedor' || u.role === 'gerente');

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-5 duration-500">
          Metas salvas com sucesso!
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Metas e Desempenho</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe seus resultados e os da equipe.</p>
        </div>
        {currentUser?.role === 'gerente' && (
          <button 
            onClick={() => setIsManagerView(!isManagerView)}
            className="text-xs bg-primary-light dark:bg-primary-light/20 text-primary dark:text-primary px-4 py-2 rounded-xl font-bold hover:bg-primary-light/40 transition-colors border border-primary/20"
          >
            {isManagerView ? 'Ver Minhas Metas' : 'Painel do Gerente'}
          </button>
        )}
      </div>

      {!isManagerView ? (
        <div className="space-y-8">
          {/* Minhas Metas */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Minhas Metas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meta Diária */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 transition-colors">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary-light dark:bg-primary-light/30 flex items-center justify-center mr-4">
                    <TrendingUp className="w-5 h-5 text-primary dark:text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Prospecções Diárias</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Objetivo individual</p>
                  </div>
                </div>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                    {goals.currentProspects} <span className="text-lg text-gray-400 dark:text-gray-500 font-medium">/ {goals.dailyProspects}</span>
                  </div>
                  <div className="text-lg font-bold text-primary dark:text-primary">{Math.round(prospectProgress)}%</div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
                  <div 
                    className={cn("h-4 rounded-full transition-all duration-1000 ease-out", prospectProgress >= 100 ? 'bg-green-500' : 'bg-primary')}
                    style={{ width: `${prospectProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  {prospectProgress >= 100 
                    ? '🎉 Meta atingida!' 
                    : `Faltam ${Math.max(0, goals.dailyProspects - goals.currentProspects)} para o objetivo.`}
                </p>
              </div>

              {/* Meta Mensal */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 transition-colors">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mr-4">
                    <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Vendas no Mês</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Carros vendidos</p>
                  </div>
                </div>
                <div className="flex justify-between items-end mb-4">
                  <div className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                    {goals.currentSales} <span className="text-lg text-gray-400 dark:text-gray-500 font-medium">/ {goals.monthlySales}</span>
                  </div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{Math.round(salesProgress)}%</div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
                  <div 
                    className={cn("h-4 rounded-full transition-all duration-1000 ease-out", salesProgress >= 100 ? 'bg-yellow-400' : 'bg-green-500')}
                    style={{ width: `${salesProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  {salesProgress >= 100 
                    ? '🏆 Meta batida!' 
                    : `Faltam ${Math.max(0, goals.monthlySales - goals.currentSales)} vendas.`}
                </p>
                <div className="mt-4 text-center">
                  <button 
                    onClick={resetCurrentUsersSales}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Zerar esta meta pessoal.
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Meta da Equipe */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Meta da Equipe</h3>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prospecções Totais</span>
                    <span className="text-sm font-bold text-secondary">{teamCurrentProspects} / {teamDailyProspects} ({Math.round(teamProspectProgress)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-secondary h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${teamProspectProgress}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendas Totais</span>
                    <span className="text-sm font-bold text-green-600">{teamCurrentSales} / {teamMonthlySales} ({Math.round(teamSalesProgress)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${teamSalesProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* Manager View - Set Goals per Salesperson */
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-primary/20 overflow-hidden transition-colors">
            <div className="bg-primary-light/20 p-4 border-b border-primary/10">
              <h3 className="text-lg font-bold text-primary flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Gerenciar Metas dos Vendedores
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selecione o Vendedor</label>
                <div className="relative">
                  <select
                    value={selectedUserId}
                    onChange={(e) => handleSelectUser(e.target.value)}
                    className="block w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-xl focus:ring-primary focus:border-primary appearance-none"
                  >
                    <option value="">Selecione um vendedor...</option>
                    {salespeople.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {selectedUserId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Diária de Prospecções</label>
                    <input
                      type="number"
                      value={editGoals.dailyProspects}
                      onChange={(e) => setEditGoals({...editGoals, dailyProspects: Number(e.target.value)})}
                      className="block w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-xl focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Mensal de Vendas</label>
                    <input
                      type="number"
                      value={editGoals.monthlySales}
                      onChange={(e) => setEditGoals({...editGoals, monthlySales: Number(e.target.value)})}
                      className="block w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-xl focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveUserGoals}
                  disabled={!selectedUserId}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Salvar Metas do Vendedor
                </button>
              </div>
            </div>
          </div>

          {/* Resumo da Equipe para o Gerente */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Desempenho da Equipe</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vendedor</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prospecções (Hoje)</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vendas (Mês)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {salespeople.map(user => {
                    const userGoal = allGoals.find(g => g.userId === user.id);
                    return (
                      <tr key={user.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold mr-3">
                              {user.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white font-bold">{userGoal?.currentProspects || 0}</span>
                          <span className="text-xs text-gray-500 ml-1">/ {userGoal?.dailyProspects || 0}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white font-bold">{userGoal?.currentSales || 0}</span>
                          <span className="text-xs text-gray-500 ml-1">/ {userGoal?.monthlySales || 0}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
