import React, { useState, useEffect } from 'react';
import { useCRMStore } from '../store/useStore';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, UserPlus, Phone, Mail, MapPin, Calendar, Instagram, CreditCard, Facebook, Edit, FileText, Tag, Plus, X } from 'lucide-react';

export function ClientForm() {
  const { id } = useParams<{ id: string }>();
  const { addClient, updateClient, clients, availableTags, addTag } = useCRMStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    phone: '',
    email: '',
    instagram: '',
    facebook: '',
    city: '',
    address: '',
    birthDate: '',
    notes: '',
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!id;

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '' || cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let add = 0;
    for (let i = 0; i < 9; i++)
      add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    
    add = 0;
    for (let i = 0; i < 10; i++)
      add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  useEffect(() => {
    if (isEditMode) {
      const client = clients.find(c => c.id === id);
      if (client) {
        setFormData({
          fullName: client.fullName,
          cpf: client.cpf,
          phone: client.phone,
          email: client.email,
          instagram: client.instagram || '',
          facebook: client.facebook || '',
          city: client.city,
          address: client.address,
          birthDate: client.birthDate,
          notes: client.notes || '',
          tags: client.tags || [],
        });
      }
    }
  }, [id, clients, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let error = '';

    if (name === 'cpf') {
      formattedValue = formatCPF(value);
      if (formattedValue.length === 14 && !validateCPF(formattedValue)) {
        error = 'CPF inválido';
      }
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
      if (formattedValue.length >= 14 && !validatePhone(formattedValue)) {
        error = 'Telefone inválido';
      }
    } else if (name === 'email') {
      if (value && !validateEmail(value)) {
        error = 'E-mail inválido';
      }
    } else if (['fullName', 'city', 'address', 'birthDate'].includes(name)) {
      if (!value) {
        error = 'Campo obrigatório';
      }
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleToggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCreateTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim())) {
      addTag(newTag.trim());
      handleToggleTag(newTag.trim());
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Campo obrigatório';
    if (!formData.phone) newErrors.phone = 'Campo obrigatório';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Telefone inválido';
    
    if (!formData.cpf) newErrors.cpf = 'Campo obrigatório';
    else if (!validateCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';
    
    if (!formData.email) newErrors.email = 'Campo obrigatório';
    else if (!validateEmail(formData.email)) newErrors.email = 'E-mail inválido';
    
    if (!formData.birthDate) newErrors.birthDate = 'Campo obrigatório';
    if (!formData.city) newErrors.city = 'Campo obrigatório';
    if (!formData.address) newErrors.address = 'Campo obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = document.querySelector(`[name="${Object.keys(newErrors)[0]}"]`);
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (isEditMode) {
      await updateClient(id, formData);
      navigate(`/clientes/${id}`);
    } else {
      await addClient(formData);
      navigate('/kanban');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          {isEditMode ? (
            <Edit className="w-6 h-6 mr-2 text-primary dark:text-primary" />
          ) : (
            <UserPlus className="w-6 h-6 mr-2 text-primary dark:text-primary" />
          )}
          {isEditMode ? 'Editar Cliente' : 'Nova Prospecção'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isEditMode ? 'Atualize as informações do cliente.' : 'Cadastre um novo cliente para iniciar o atendimento.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors">
        <div className="p-6 md:p-8 space-y-6">
          {/* Dados Pessoais */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserPlus className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.fullName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-zinc-700 focus:ring-primary focus:border-primary'} bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-xl sm:text-sm placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="João da Silva"
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="cpf"
                    required
                    value={formData.cpf}
                    onChange={handleChange}
                    maxLength={14}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.cpf ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-zinc-700 focus:ring-primary focus:border-primary'} bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-xl sm:text-sm placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="000.000.000-00"
                  />
                </div>
                {errors.cpf && <p className="mt-1 text-xs text-red-500">{errors.cpf}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Nascimento *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="date"
                    name="birthDate"
                    required
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.birthDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-zinc-700 focus:ring-primary focus:border-primary'} bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-xl sm:text-sm`}
                  />
                </div>
                {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate}</p>}
              </div>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2 mt-8">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone / WhatsApp *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-zinc-700 focus:ring-primary focus:border-primary'} bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-xl sm:text-sm placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-zinc-700 focus:ring-primary focus:border-primary'} bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-xl sm:text-sm placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="joao@exemplo.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Instagram className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-primary focus:border-primary sm:text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="@joaosilva"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Facebook className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-primary focus:border-primary sm:text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="joao.silva"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Localização */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2 mt-8">Localização</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.city ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-zinc-700 focus:ring-primary focus:border-primary'} bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-xl sm:text-sm placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="São Paulo"
                  />
                </div>
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço Completo *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.address ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-zinc-700 focus:ring-primary focus:border-primary'} bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-xl sm:text-sm placeholder-gray-400 dark:placeholder-gray-500`}
                    placeholder="Rua Exemplo, 123 - Bairro"
                  />
                </div>
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Observações e Tags */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2 mt-8">Observações e Tags</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-primary-light border-primary-light text-primary dark:bg-primary-light/40 dark:border-primary-light/50 dark:text-primary'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                  
                  {isAddingTag ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
                        placeholder="Nova tag..."
                        className="px-3 py-1 text-xs border border-gray-300 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary w-28"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateTag}
                        className="p-1 text-green-600 hover:text-green-700 dark:text-green-500"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsAddingTag(false); setNewTag(''); }}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(true)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Criar Tag
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações (Opcional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <textarea
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-primary focus:border-primary sm:text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Adicione notas relevantes sobre a prospecção, interesses do cliente, etc."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditMode ? 'Salvar Alterações' : 'Salvar Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
