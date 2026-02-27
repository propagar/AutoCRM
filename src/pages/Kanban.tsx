import React, { useState } from 'react';
import { useCRMStore, FunnelStage } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, CheckCircle, Clock, User, Settings as SettingsIcon, Plus, X, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';
import { SaleDetailsModal } from '../components/SaleDetailsModal';
import { Client } from '../store/useStore';

export function Kanban() {
  const { clients, updateClientStage, currentUser, funnelStages, updateFunnelStages, addInteraction } = useCRMStore();
  const navigate = useNavigate();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingStages, setEditingStages] = useState<string[]>([]);
  const [newStageName, setNewStageName] = useState('');
  const [draggedStageIndex, setDraggedStageIndex] = useState<number | null>(null);
  const [dragOverStageIndex, setDragOverStageIndex] = useState<number | null>(null);
  const [selectedSalesperson, setSelectedSalesperson] = useState('Todos');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [clientForSale, setClientForSale] = useState<Client | null>(null);

  // Get unique salespeople from clients list
  const salespeople = Array.from(new Set(clients.map(c => c.salesperson).filter(Boolean))) as string[];

  // Show all stages in the main board
  const activeStages = funnelStages;

  const filteredClients = clients.filter(c => 
    selectedSalesperson === 'Todos' || c.salesperson === selectedSalesperson
  );

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stage: FunnelStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && stage) {
      if (stage === 'Vendido') {
        const clientToSell = clients.find(c => c.id === id);
        if (clientToSell) {
          setClientForSale(clientToSell);
          setIsSaleModalOpen(true);
        }
      } else {
        await updateClientStage(id, stage);
      }
    }
    setDraggedItem(null);
  };

  const handleConfirmSale = async (saleDetails: any) => {
    if (clientForSale) {
      const description = `Venda registrada: ${saleDetails.carFullName} (${saleDetails.carBrand} ${saleDetails.carModel} ${saleDetails.carYear}) por R$ ${saleDetails.saleValue} via ${saleDetails.paymentMethod}.`;
      await addInteraction(clientForSale.id, { type: 'Venda', description });
      await updateClientStage(clientForSale.id, 'Vendido');
    }
    setIsSaleModalOpen(false);
    setClientForSale(null);
  };

  const handleOpenConfig = () => {
    setEditingStages([...funnelStages]);
    setIsConfigOpen(true);
  };

  const handleSaveConfig = () => {
    updateFunnelStages(editingStages);
    setIsConfigOpen(false);
  };

  const handleAddStage = () => {
    if (newStageName.trim() && !editingStages.includes(newStageName.trim())) {
      // Add before Vendido and Perdido if they exist, otherwise at the end
      const newStages = [...editingStages];
      const insertIndex = newStages.findIndex(s => s === 'Vendido' || s === 'Perdido');
      if (insertIndex !== -1) {
        newStages.splice(insertIndex, 0, newStageName.trim());
      } else {
        newStages.push(newStageName.trim());
      }
      setEditingStages(newStages);
      setNewStageName('');
    }
  };

  const handleRemoveStage = (stageToRemove: string) => {
    // Don't allow removing stages that have clients
    const hasClients = clients.some(c => c.stage === stageToRemove);
    if (hasClients) {
      alert('Não é possível remover uma etapa que possui clientes. Mova os clientes primeiro.');
      return;
    }
    setEditingStages(editingStages.filter(s => s !== stageToRemove));
  };

  const handleStageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleStageDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverStageIndex(index);
  };

  const handleStageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleStageDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedStageIndex === null) return;
    
    const newStages = [...editingStages];
    const draggedItem = newStages[draggedStageIndex];
    
    newStages.splice(draggedStageIndex, 1);
    newStages.splice(index, 0, draggedItem);
    
    setEditingStages(newStages);
    setDraggedStageIndex(null);
    setDragOverStageIndex(null);
  };

  const handleStageDragEnd = () => {
    setDraggedStageIndex(null);
    setDragOverStageIndex(null);
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Funil de Vendas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Arraste os cards para atualizar a etapa.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-56">
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="block w-full pl-4 pr-10 py-2 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-primary focus:border-primary bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 shadow-sm appearance-none cursor-pointer text-sm"
            >
              <option value="Todos">Todos os Vendedores</option>
              {salespeople.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {currentUser.role === 'gerente' && (
            <button
              onClick={handleOpenConfig}
              className="flex items-center px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <SettingsIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              Configurar Funil
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board - Horizontal scroll on mobile */}
      <div className="flex-1 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-4 h-full min-w-max md:min-w-0">
          {activeStages.map((stage) => {
            const stageClients = filteredClients.filter(c => c.stage === stage);
            return (
              <div 
                key={stage} 
                className="w-72 md:flex-1 bg-gray-100/50 dark:bg-zinc-900/50 rounded-2xl p-4 flex flex-col border border-gray-200 dark:border-zinc-800"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">{stage}</h3>
                  <span className="bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-gray-100 dark:border-zinc-800">
                    {stageClients.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {stageClients.map(client => (
                    <div
                      key={client.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, client.id)}
                      onClick={() => navigate(`/clientes/${client.id}`)}
                      className={cn(
                        "bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
                        draggedItem === client.id ? "opacity-50" : "opacity-100"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate pr-2">{client.fullName}</h4>
                        {/* Quick actions */}
                        <a 
                          href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="text-green-500 hover:text-green-600 bg-green-50 dark:bg-green-900/30 p-1.5 rounded-lg"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                      {client.salesperson && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <User className="w-3 h-3 mr-1" />
                          {client.salesperson}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-3">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                      
                      {/* Move to next stage buttons for mobile (since drag and drop is hard on mobile) */}
                      <div className="md:hidden mt-3 pt-3 border-t border-gray-50 dark:border-gray-700 flex justify-end gap-2">
                        {stage !== 'Ficha Aprovada' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateClientStage(client.id, activeStages[activeStages.indexOf(stage) + 1]);
                            }}
                            className="text-xs bg-primary-light dark:bg-primary-light/30 text-primary dark:text-primary px-2 py-1 rounded-md font-medium"
                          >
                            Avançar
                          </button>
                        )}
                        {stage === 'Ficha Aprovada' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateClientStage(client.id, 'Vendido');
                            }}
                            className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-md font-medium flex items-center"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Vender
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageClients.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                      Arraste para cá
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          {/* ... rest of the modal ... */}
        </div>
      )}
      <SaleDetailsModal 
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        client={clientForSale}
        onConfirm={handleConfirmSale}
      />
    </div>
  );
}
