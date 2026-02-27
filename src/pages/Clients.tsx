import React, { useState, useMemo, useEffect } from 'react';
import { useCRMStore, FunnelStage } from '../store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Download, Upload, MoreVertical, Phone, MessageCircle, ChevronDown } from 'lucide-react';

export function Clients() {
  const { clients, updateClientStage, funnelStages, users, currentUser } = useCRMStore();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const stageFilterFromURL = searchParams.get('stage');
  const salespersonFilterFromURL = searchParams.get('salesperson');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState(salespersonFilterFromURL || 'Todos');
  const [filterStage, setFilterStage] = useState(stageFilterFromURL || 'Todos');

  // Get unique salespeople from clients list
  const salespeople = Array.from(new Set(clients.map(c => c.salesperson).filter(Boolean))) as string[];

  useEffect(() => {
    if (stageFilterFromURL) {
      setFilterStage(stageFilterFromURL);
    }
    if (salespersonFilterFromURL) {
      setSelectedSalesperson(salespersonFilterFromURL);
    }
  }, [stageFilterFromURL, salespersonFilterFromURL]);

  const filteredClients = clients.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      c.fullName.toLowerCase().includes(searchLower) || 
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchLower)) ||
      (c.address && c.address.toLowerCase().includes(searchLower)) ||
      (c.tags && c.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );

    const matchesSalesperson = selectedSalesperson === 'Todos' || c.salesperson === selectedSalesperson;
    const matchesStage = filterStage === 'Todos' || c.stage === filterStage;

    return matchesSearch && matchesSalesperson && matchesStage;
  });

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nome,Telefone,Etapa,Data de Cadastro\n"
      + clients.map(c => `${c.fullName},${c.phone},${c.stage},${new Date(c.createdAt).toLocaleDateString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clientes_autocrm.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Clientes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie sua carteira de clientes.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-zinc-800 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </button>
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, telefone, e-mail, endereço ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-zinc-800 rounded-2xl focus:ring-primary focus:border-primary bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <div className="relative w-full md:w-64">
          <select
            value={selectedSalesperson}
            onChange={(e) => setSelectedSalesperson(e.target.value)}
            className="block w-full pl-4 pr-10 py-3 border border-gray-200 dark:border-zinc-800 rounded-2xl focus:ring-primary focus:border-primary bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm appearance-none cursor-pointer"
          >
            <option value="Todos">Todos os Vendedores</option>
            {salespeople.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-zinc-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Contato
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Etapa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Data
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
              {filteredClients.map((client) => (
                <tr 
                  key={client.id} 
                  onClick={() => navigate(`/clientes/${client.id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-light dark:bg-primary-light/50 flex items-center justify-center text-primary dark:text-primary font-bold">
                        {client.fullName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {client.fullName}
                          {client.salesperson && (
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-md font-normal">
                              {client.salesperson}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">{client.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900 dark:text-gray-300 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {client.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="relative group inline-block">
                      <select
                        value={client.stage}
                        onChange={(e) => updateClientStage(client.id, e.target.value as FunnelStage)}
                        className={`appearance-none pl-2 pr-7 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer border-none focus:ring-1 focus:ring-primary transition-colors
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
                      <ChevronDown className="w-2.5 h-2.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
