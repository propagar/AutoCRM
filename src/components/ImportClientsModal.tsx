import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { useCRMStore, Client } from '../store/useStore';

interface ImportClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportClientsModal({ isOpen, onClose }: ImportClientsModalProps) {
  const { addClient, clients } = useCRMStore();
  const [file, setFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setImportStatus('idle');
      setErrorMessage('');
      setImportedCount(0);
    }
  };

  const handleImport = () => {
    if (!file) {
      setErrorMessage('Por favor, selecione um arquivo para importar.');
      setImportStatus('error');
      return;
    }

    setImportStatus('processing');
    setErrorMessage('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';',
      encoding: 'ISO-8859-1', // Garante que acentos do Excel (Windows) sejam lidos corretamente
      complete: async (results) => {
        if (results.errors.length > 0) {
          console.error('Erros de parsing:', results.errors);
          setErrorMessage('Erro ao ler o arquivo: ' + results.errors.map(e => e.message).join('; '));
          setImportStatus('error');
          return;
        }

        const clientsToImport: Omit<Client, 'id' | 'interactions' | 'createdAt' | 'stage'>[] = [];
        let successfulImports = 0;
        const skippedClients: string[] = [];

        const existingCpfs = new Set(clients.map(c => c.cpf).filter(Boolean));

        for (const row of results.data) {
          const clientData = row as any;

          // Clean and validate CPF
          const rawCpf = String(clientData.cpf || '').replace(/[.\-]/g, '');
          const formattedCpf = rawCpf.length === 11 ? rawCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '';

          // Basic validation for required fields
          if (!clientData.fullName || !clientData.phone || !clientData.email) {
            skippedClients.push(clientData.fullName || 'Cliente sem nome (dados incompletos)');
            continue;
          }

          // Check for duplicate CPF
          if (formattedCpf && existingCpfs.has(formattedCpf)) {
            skippedClients.push(`${clientData.fullName} (CPF já cadastrado)`);
            continue;
          }

          clientsToImport.push({
            fullName: String(clientData.fullName || ''),
            cpf: formattedCpf,
            phone: String(clientData.phone || ''),
            email: String(clientData.email || ''),
            instagram: String(clientData.instagram || ''),
            facebook: String(clientData.facebook || ''),
            city: String(clientData.city || ''),
            address: String(clientData.address || ''),
            birthDate: String(clientData.birthDate || ''),
            salesperson: String(clientData.salesperson || ''),
            notes: String(clientData.notes || ''),
            tags: clientData.tags ? String(clientData.tags).split(',').map((tag: string) => tag.trim()) : [],
          });
        }

        for (const client of clientsToImport) {
          try {
            await addClient(client, { isImport: true });
            successfulImports++;
          } catch (error) {
            console.error('Erro ao adicionar cliente:', client.fullName, error);
            skippedClients.push(`${client.fullName} (erro ao salvar)`);
          }
        }

        if (successfulImports > 0) {
          setImportedCount(successfulImports);
          setImportStatus('success');
          setFile(null); // Clear file input
          if (skippedClients.length > 0) {
            setErrorMessage(`Importação concluída com ${successfulImports} clientes. ${skippedClients.length} clientes foram ignorados: ${skippedClients.join(', ')}`);
          }
        } else {
          setErrorMessage('Nenhum cliente válido encontrado para importação ou todos falharam. ' + (skippedClients.length > 0 ? `Ignorados: ${skippedClients.join(', ')}` : ''));
          setImportStatus('error');
        }

        if (successfulImports > 0) {
          setImportedCount(successfulImports);
          setImportStatus('success');
          setFile(null); // Clear file input
        } else {
          setErrorMessage('Nenhum cliente válido encontrado para importação ou todos falharam.');
          setImportStatus('error');
        }
      },
      error: (error: any) => {
        console.error('Erro no PapaParse:', error);
        setErrorMessage('Erro ao processar o arquivo: ' + error.message);
        setImportStatus('error');
      },
    });
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'fullName', 'cpf', 'phone', 'email', 'instagram', 'facebook', 
      'city', 'address', 'birthDate', 'salesperson', 'notes', 'tags'
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(';'); // Usa ponto e vírgula no template
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_clientes_autocrm.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6 relative border border-gray-100 dark:border-zinc-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Importar Clientes</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Importe clientes de um arquivo CSV. Certifique-se de que as colunas correspondam aos campos do CRM (fullName, phone, email, etc.).</p>
        <button 
          onClick={handleDownloadTemplate}
          className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
        >
          <FileText className="w-4 h-4" /> Baixar modelo CSV
        </button>

        <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors">
          <label htmlFor="file-upload" className="cursor-pointer block">
            <UploadCloud className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">Arraste e solte seu arquivo aqui ou <span className="text-primary">clique para selecionar</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Apenas arquivos CSV são suportados.</p>
          </label>
          <input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        </div>

        {file && (
          <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl border border-gray-100 dark:border-zinc-700">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-primary mr-2" />
              <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
            </div>
            {importStatus === 'processing' && <span className="text-sm text-gray-500">Processando...</span>}
            {importStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {importStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-xl flex items-center text-sm">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        )}

        {importStatus === 'success' && importedCount > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-xl flex items-center text-sm">
            <CheckCircle className="w-5 h-5 mr-2" />
            {importedCount} clientes importados com sucesso!
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button 
            onClick={handleImport}
            disabled={!file || importStatus === 'processing'}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
          >
            {importStatus === 'processing' ? (
              <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Importar
          </button>
        </div>
      </div>
    </div>
  );
}
