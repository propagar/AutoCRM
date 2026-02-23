import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRMStore } from '../store/useStore';
import { ArrowLeft, Phone, MessageCircle, MapPin, Calendar, Clock, Plus } from 'lucide-react';

export function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, addInteraction } = useCRMStore();
  
  const client = clients.find(c => c.id === id);
  
  const [newInteraction, setNewInteraction] = useState({
    type: 'WhatsApp' as const,
    description: ''
  });

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente não encontrado.</p>
        <button onClick={() => navigate('/clientes')} className="mt-4 text-blue-600 hover:underline">Voltar para clientes</button>
      </div>
    );
  }

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.description) return;
    
    addInteraction(client.id, newInteraction);
    setNewInteraction({ ...newInteraction, description: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </button>

      {/* Header Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
              {client.fullName.charAt(0)}
            </div>
            <div className="ml-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{client.fullName}</h2>
                {client.salesperson && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium border border-gray-200">
                    Atendente: {client.salesperson}
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold mr-3
                  ${client.stage === 'Vendido' ? 'bg-green-100 text-green-800' : 
                    client.stage === 'Perdido' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'}`}>
                  {client.stage}
                </span>
                <Clock className="w-3 h-3 mr-1" /> Cadastrado em {new Date(client.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </a>
            <a href={`tel:${client.phone.replace(/\D/g, '')}`} className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Phone className="w-4 h-4 mr-2" /> Ligar
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Contato</p>
            <p className="text-sm text-gray-900">{client.phone}</p>
            {client.email && <p className="text-sm text-gray-900 mt-1">{client.email}</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Redes Sociais</p>
            {client.instagram && <p className="text-sm text-gray-900">Instagram: {client.instagram}</p>}
            {client.facebook && <p className="text-sm text-gray-900">Facebook: {client.facebook}</p>}
            {!client.instagram && !client.facebook && <p className="text-sm text-gray-500">Não informado</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Localização</p>
            <p className="text-sm text-gray-900">{client.city || 'Não informado'}</p>
            {client.address && <p className="text-sm text-gray-500 mt-1">{client.address}</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Documento</p>
            <p className="text-sm text-gray-900">{client.cpf || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Timeline & Interactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Novo Registro</h3>
            <form onSubmit={handleAddInteraction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Interação</label>
                <select 
                  value={newInteraction.type}
                  onChange={(e) => setNewInteraction({...newInteraction, type: e.target.value as any})}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl border"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Ligação">Ligação</option>
                  <option value="Visita">Visita à Loja</option>
                  <option value="Email">E-mail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  required
                  value={newInteraction.description}
                  onChange={(e) => setNewInteraction({...newInteraction, description: e.target.value})}
                  className="block w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Resumo da conversa..."
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" /> Registrar
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Histórico (Timeline)</h3>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {client.interactions.length === 0 ? (
                  <li className="text-sm text-gray-500 text-center py-4">Nenhuma interação registrada ainda.</li>
                ) : (
                  [...client.interactions].reverse().map((interaction, interactionIdx) => (
                    <li key={interaction.id}>
                      <div className="relative pb-8">
                        {interactionIdx !== client.interactions.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                              ${interaction.type === 'WhatsApp' ? 'bg-green-500' : 
                                interaction.type === 'Ligação' ? 'bg-blue-500' : 
                                interaction.type === 'Visita' ? 'bg-purple-500' : 'bg-gray-500'}`}>
                              {interaction.type === 'WhatsApp' && <MessageCircle className="h-4 w-4 text-white" />}
                              {interaction.type === 'Ligação' && <Phone className="h-4 w-4 text-white" />}
                              {interaction.type === 'Visita' && <MapPin className="h-4 w-4 text-white" />}
                              {interaction.type === 'Email' && <MessageCircle className="h-4 w-4 text-white" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">{interaction.type}</span>
                              </p>
                              <p className="mt-1 text-sm text-gray-700">{interaction.description}</p>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-gray-500">
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
