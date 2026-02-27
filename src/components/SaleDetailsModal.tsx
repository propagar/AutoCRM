import React, { useState, useEffect } from 'react';
import { Client } from '../store/useStore';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onConfirm: (saleDetails: {
    carBrand: string;
    carModel: string;
    carYear: string;
    carFullName: string;
    paymentMethod: string;
    saleValue: string;
  }) => void;
}

export function SaleDetailsModal({ isOpen, onClose, client, onConfirm }: SaleDetailsModalProps) {
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [carFullName, setCarFullName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('À Vista');
  const [saleValue, setSaleValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setCarBrand('');
      setCarModel('');
      setCarYear('');
      setCarFullName('');
      setPaymentMethod('À Vista');
      setSaleValue('');
    }
  }, [isOpen]);

  if (!isOpen || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ carBrand, carModel, carYear, carFullName, paymentMethod, saleValue });
  };

  const inputClasses = "block w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-2xl focus:ring-primary focus:border-primary bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm placeholder-gray-400 dark:placeholder-gray-500";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-md border border-gray-100 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Registrar Venda</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Confirme os detalhes da venda para o cliente <span className="font-bold">{client.fullName}</span>.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Marca</label>
              <input type="text" value={carBrand} onChange={e => setCarBrand(e.target.value)} required className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Modelo</label>
              <input type="text" value={carModel} onChange={e => setCarModel(e.target.value)} required className={inputClasses} />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Nome Completo do Veículo</label>
            <input type="text" value={carFullName} onChange={e => setCarFullName(e.target.value)} required className={inputClasses} placeholder="Ex: Chevrolet Onix 1.0 Turbo" />
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Ano</label>
              <input type="number" value={carYear} onChange={e => setCarYear(e.target.value)} required className={inputClasses} placeholder="2023" />
            </div>
            <div>
              <label className={labelClasses}>Valor (R$)</label>
              <input type="number" step="0.01" value={saleValue} onChange={e => setSaleValue(e.target.value)} required className={inputClasses} placeholder="75000.00" />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Forma de Pagamento</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={inputClasses}>
              <option>À Vista</option>
              <option>Financiamento</option>
              <option>Consórcio</option>
              <option>Troca</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-zinc-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-xl shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Confirmar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
