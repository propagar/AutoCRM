import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRMStore, FunnelStage, Interaction } from '../store/useStore';
import { ArrowLeft, Phone, MessageCircle, MapPin, Calendar, Clock, Plus, Edit, Tag, FileText, ChevronDown, User, Check, DollarSign, CheckCircle, Mail } from 'lucide-react';

export function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, addInteraction, updateClientStage, funnelStages, currentUser, users, updateClient } = useCRMStore();
  
  const client = clients.find(c => c.id === id);

  const [isEditingSalesperson, setIsEditingSalesperson] = useState(false);
  const [selectedSalesperson, setSelectedSalesperson] = useState(client?.salesperson || '');
  
  const [newInteraction, setNewInteraction] = useState({
    type: 'WhatsApp' as const,
    description: ''
  });

  const handleSalespersonChange = async () => {
    if (client && selectedSalesperson && client.salesperson !== selectedSalesperson) {
      await updateClient(client.id, { ...client, salesperson: selectedSalesperson });
      setIsEditingSalesperson(false);
    }
  };

  const iconMap: { [key in Interaction['type']]: React.ElementType } = {
    Ligação: Phone,
    WhatsApp: MessageCircle,
    Visita: MapPin,
    Email: Mail,
    Venda: DollarSign,
    Status: CheckCircle,
  };

  const interactionColors: { [key in Interaction['type']]: string } = {
    Ligação: 'bg-blue-500',
    WhatsApp: 'bg-green-500',
    Visita: 'bg-purple-500',
    Email: 'bg-gray-500',
    Venda: 'bg-yellow-500',
    Status: 'bg-indigo-500',
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.description) return;
    
    await addInteraction(client.id, newInteraction);
    setNewInteraction({ ...newInteraction, description: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </button>

      {/* Header Profile */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 md:p-8 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-primary-light dark:bg-primary-light/50 text-primary dark:text-primary flex items-center justify-center text-2xl font-bold">
              {client.fullName.charAt(0)}
            </div>
            <div className="ml-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{client.fullName}</h2>
                {currentUser?.role === 'gerente' ? (
                  <div className="relative">
                    {!isEditingSalesperson ? (
                      <button 
                        onClick={() => setIsEditingSalesperson(true)}
                        className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                      >
                        <User className="w-3 h-3" />
                        <span>Atendente: {client.salesperson || 'N/A'}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select 
                          value={selectedSalesperson}
                          onChange={(e) => setSelectedSalesperson(e.target.value)}
                          className="text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md px-2 py-1 focus:ring-primary focus:border-primary"
                        >
                          <option value="">Selecione...</option>
                          {users.filter(u => u.role === 'vendedor' || u.role === 'gerente').map(user => (
                            <option key={user.id} value={user.name}>{user.name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={handleSalespersonChange}
                          className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  client.salesperson && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md font-medium border border-gray-200 dark:border-gray-600">
                      Atendente: {client.salesperson}
                    </span>
                  )
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <div className="relative mr-3 group">
                  <select
                    value={client.stage}
                    onChange={(e) => updateClientStage(client.id, e.target.value as FunnelStage)}
                    className={`appearance-none pl-2 pr-8 py-0.5 rounded-full text-xs font-semibold cursor-pointer border-none focus:ring-2 focus:ring-primary transition-colors
                      ${client.stage === 'Vendido' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 
                        client.stage === 'Perdido' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 
                        'bg-primary-light dark:bg-primary-light/30 text-primary dark:text-primary'}`}
                  >
                    {funnelStages.map(stage => (
                      <option key={stage} value={stage} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                        {stage}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>
                <Clock className="w-3 h-3 mr-1" /> Cadastrado em {new Date(client.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => navigate(`/editar-cliente/${client.id}`)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" /> Editar
            </button>
            <a href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </a>
            <a href={`tel:${client.phone.replace(/\D/g, '')}`} className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <Phone className="w-4 h-4 mr-2" /> Ligar
            </a>
          </div>
        </div>

        {client.tags && client.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {client.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary border border-primary-light dark:bg-primary-light/30 dark:text-primary dark:border-primary-light/50">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {client.notes && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50 rounded-xl p-4">
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">Observações da Prospecção</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300/80 whitespace-pre-wrap">{client.notes}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Contato</p>
            <p className="text-sm text-gray-900 dark:text-white">{client.phone}</p>
            {client.email && <p className="text-sm text-gray-900 dark:text-white mt-1">{client.email}</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Redes Sociais</p>
            {client.instagram && <p className="text-sm text-gray-900 dark:text-white">Instagram: {client.instagram}</p>}
            {client.facebook && <p className="text-sm text-gray-900 dark:text-white">Facebook: {client.facebook}</p>}
            {!client.instagram && !client.facebook && <p className="text-sm text-gray-500 dark:text-gray-400">Não informado</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Localização</p>
            <p className="text-sm text-gray-900 dark:text-white">{client.city || 'Não informado'}</p>
            {client.address && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{client.address}</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Documento</p>
            <p className="text-sm text-gray-900 dark:text-white">{client.cpf || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Timeline & Interactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sticky top-24 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Novo Registro</h3>
            <form onSubmit={handleAddInteraction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Interação</label>
                <select 
                  value={newInteraction.type}
                  onChange={(e) => setNewInteraction({...newInteraction, type: e.target.value as any})}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl border"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Ligação">Ligação</option>
                  <option value="Visita">Visita à Loja</option>
                  <option value="Email">E-mail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  required
                  value={newInteraction.description}
                  onChange={(e) => setNewInteraction({...newInteraction, description: e.target.value})}
                  className="block w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-primary focus:border-primary sm:text-sm placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Resumo da conversa..."
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" /> Registrar
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Histórico (Timeline)</h3>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {client.interactions.length === 0 ? (
                  <li className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma interação registrada ainda.</li>
                ) : (
                  [...client.interactions].reverse().map((interaction, interactionIdx) => (
                    <li key={interaction.id}>
                      <div className="relative pb-8">
                        {interactionIdx !== client.interactions.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${interactionColors[interaction.type]}`}>
                              {React.createElement(iconMap[interaction.type], { className: 'h-4 w-4 text-white' })}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-white">{interaction.type}</span>
                              </p>
                              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{interaction.description}</p>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-gray-500 dark:text-gray-400">
                              <time dateTime={interaction.date}>
                                {new Date(interaction.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
