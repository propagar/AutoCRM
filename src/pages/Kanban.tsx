import React, { useState } from 'react';
import { useCRMStore, FunnelStage } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, CheckCircle, Clock, User, Settings as SettingsIcon, Plus, X, Trash2, GripVertical } from 'lucide-react';
import { cn } from '../utils/cn';

export function Kanban() {
  const { clients, updateClientStage, currentUser, funnelStages, updateFunnelStages } = useCRMStore();
  const navigate = useNavigate();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingStages, setEditingStages] = useState<string[]>([]);
  const [newStageName, setNewStageName] = useState('');
  const [draggedStageIndex, setDraggedStageIndex] = useState<number | null>(null);
  const [dragOverStageIndex, setDragOverStageIndex] = useState<number | null>(null);

  // Filter out "Vendido" from main board
  const activeStages = funnelStages.filter(s => s !== 'Vendido');

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stage: FunnelStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && stage) {
      updateClientStage(id, stage);
    }
    setDraggedItem(null);
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
          <h2 className="text-2xl font-bold text-gray-900">Funil de Vendas</h2>
          <p className="text-sm text-gray-500">Arraste os cards para atualizar a etapa.</p>
        </div>
        {currentUser.role === 'gerente' && (
          <button
            onClick={handleOpenConfig}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <SettingsIcon className="w-4 h-4 mr-2 text-gray-500" />
            Configurar Funil
          </button>
        )}
      </div>

      {/* Kanban Board - Horizontal scroll on mobile */}
      <div className="flex-1 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-4 h-full min-w-max md:min-w-0">
          {activeStages.map((stage) => {
            const stageClients = clients.filter(c => c.stage === stage);
            return (
              <div 
                key={stage} 
                className="w-72 md:flex-1 bg-gray-100/50 rounded-2xl p-4 flex flex-col border border-gray-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">{stage}</h3>
                  <span className="bg-white text-gray-500 text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-gray-100">
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
                        "bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
                        draggedItem === client.id ? "opacity-50" : "opacity-100"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 truncate pr-2">{client.fullName}</h4>
                        {/* Quick actions */}
                        <a 
                          href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="text-green-500 hover:text-green-600 bg-green-50 p-1.5 rounded-lg"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                      {client.salesperson && (
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <User className="w-3 h-3 mr-1" />
                          {client.salesperson}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 flex items-center mb-3">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                      
                      {/* Move to next stage buttons for mobile (since drag and drop is hard on mobile) */}
                      <div className="md:hidden mt-3 pt-3 border-t border-gray-50 flex justify-end gap-2">
                        {stage !== 'Ficha Aprovada' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateClientStage(client.id, activeStages[activeStages.indexOf(stage) + 1]);
                            }}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium"
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
                            className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium flex items-center"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Vender
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageClients.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm">
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Configurar Funil</h3>
              <button onClick={() => setIsConfigOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar Nova Etapa</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
                    placeholder="Nome da etapa..."
                    className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    onClick={handleAddStage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Etapas Atuais</label>
                <ul className="space-y-2">
                  {editingStages.map((stage, index) => (
                    <li 
                      key={stage} 
                      draggable
                      onDragStart={(e) => handleStageDragStart(e, index)}
                      onDragEnter={(e) => handleStageDragEnter(e, index)}
                      onDragOver={handleStageDragOver}
                      onDrop={(e) => handleStageDrop(e, index)}
                      onDragEnd={handleStageDragEnd}
                      className={cn(
                        "flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl transition-all",
                        draggedStageIndex === index ? "opacity-50" : "opacity-100",
                        dragOverStageIndex === index ? "border-blue-500 bg-blue-50" : ""
                      )}
                    >
                      <div className="flex items-center">
                        <div className="cursor-grab active:cursor-grabbing mr-3 text-gray-400 hover:text-gray-600">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold mr-3">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-700">{stage}</span>
                      </div>
                      {/* Prevent deleting core stages to avoid breaking logic, or allow if careful */}
                      {stage !== 'Vendido' && stage !== 'Perdido' && (
                        <button
                          onClick={() => handleRemoveStage(stage)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Remover etapa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  Nota: As etapas "Vendido" e "Perdido" são fixas do sistema e não podem ser removidas. Você pode arrastar as etapas para reordená-las.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Salvar Funil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
