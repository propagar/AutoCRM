import React, { useState, useRef, useEffect } from 'react';
import { useCRMStore } from '../store/useStore';
import { Camera, Save, UserPlus, Mail, User, Shield, ChevronDown, ChevronUp, Key, Trash2, Paintbrush } from 'lucide-react';

export function Settings() {
  const { currentUser, updateCurrentUser, users, addUser, deleteUser, primaryColor, secondaryColor, updateThemeColors, resetAllSales } = useCRMStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  const [colors, setColors] = useState({
    primary: primaryColor,
    secondary: secondaryColor,
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendedor' as 'gerente' | 'vendedor',
  });

  useEffect(() => {
    if (currentUser?.role === 'gerente') {
      const fakeUsers = users.filter(u => u.email === 'vendedor@loja.com' || u.email === 'vendedor2@loja.com');
      if (fakeUsers.length > 0) {
        fakeUsers.forEach(u => deleteUser(u.id));
      }
    }
  }, [users, currentUser?.role, deleteUser]);

  if (!currentUser) return null;

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurrentUser(profileData);
    alert('Perfil atualizado com sucesso!');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await updateCurrentUser({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Por favor, preencha todos os campos, incluindo a senha.');
      return;
    }
    
    await addUser(newUser);
    setNewUser({ name: '', email: '', password: '', role: 'vendedor' });
    alert('Usuário adicionado com sucesso!');
  };

  const toggleUserExpanded = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      alert('Você não pode excluir sua própria conta.');
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
      await deleteUser(userId);
    }
  };

  const handleSaveColors = (e: React.FormEvent) => {
    e.preventDefault();
    updateThemeColors(colors.primary, colors.secondary);
    alert('Cores do sistema atualizadas com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie seu perfil e preferências do sistema.</p>
      </div>

      {/* Perfil do Usuário */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-50 dark:border-zinc-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Meu Perfil</h3>
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Foto */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-primary-light dark:bg-primary-light/30 border-4 border-white dark:border-gray-800 shadow-md flex items-center justify-center overflow-hidden transition-colors">
                  {currentUser.photoUrl ? (
                    <img src={currentUser.photoUrl} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary dark:text-primary">{currentUser.name.charAt(0)}</span>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 rounded-full text-white flex items-center justify-center shadow-lg transition-colors border-2 border-white dark:border-gray-800"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                  ${currentUser.role === 'gerente' ? 'bg-secondary-light dark:bg-secondary-light/30 text-secondary dark:text-secondary' : 'bg-primary-light dark:bg-primary-light/30 text-primary dark:text-primary'}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveProfile} className="flex-1 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail de Login</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Personalização do Sistema (Apenas Gerente) */}
      {currentUser.role === 'gerente' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-primary-light dark:border-primary-light/50 overflow-hidden transition-colors">
          <div className="bg-primary-light dark:bg-primary-light/20 p-6 border-b border-primary-light dark:border-primary-light/50 flex items-center">
            <Paintbrush className="w-6 h-6 text-primary dark:text-primary mr-3" />
            <div>
              <h3 className="text-lg font-bold text-primary dark:text-primary">Personalização</h3>
              <p className="text-sm text-primary dark:text-primary/80">Personalize as cores principais do sistema.</p>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <form onSubmit={handleSaveColors} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor Principal (Azul)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-zinc-800 bg-transparent"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={colors.primary}
                        onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-primary focus:border-primary sm:text-sm font-mono"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Usada em botões principais, ícones e destaques.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor Secundária (Roxo)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={colors.secondary}
                      onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-zinc-800 bg-transparent"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={colors.secondary}
                        onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-secondary focus:border-secondary sm:text-sm font-mono"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Usada em seções administrativas e papéis de gerente.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Cores
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary-light dark:border-secondary-light/50 overflow-hidden transition-colors">
        <div className="bg-secondary-light dark:bg-secondary-light/20 p-6 border-b border-secondary-light dark:border-secondary-light/50 flex items-center">
          <Shield className="w-6 h-6 text-secondary dark:text-secondary mr-3" />
          <div>
            <h3 className="text-lg font-bold text-secondary dark:text-secondary">Equipe da Loja</h3>
            <p className="text-sm text-secondary dark:text-secondary/80">
              {currentUser.role === 'gerente' ? 'Adicione e gerencie os vendedores da loja.' : 'Visualize os membros da equipe.'}
            </p>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          <div className={`grid grid-cols-1 ${currentUser.role === 'gerente' ? 'lg:grid-cols-2' : ''} gap-8`}>
            {/* Adicionar Usuário (Apenas Gerente) */}
            {currentUser.role === 'gerente' && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">Novo Usuário</h4>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-secondary focus:border-secondary sm:text-sm placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Nome do Vendedor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-secondary focus:border-secondary sm:text-sm placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="vendedor@loja.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha de Acesso</label>
                    <input
                      type="text"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-secondary focus:border-secondary sm:text-sm placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Senha inicial"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Papel</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-secondary focus:border-secondary sm:text-sm"
                    >
                      <option value="vendedor">Vendedor</option>
                      <option value="gerente">Gerente</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-secondary hover:bg-secondary/90 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Usuário
                  </button>
                </form>
              </div>
            )}

              {/* Lista de Usuários */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">Equipe Atual</h4>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {users.map((user) => (
                    <div key={user.id} className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden transition-all duration-200">
                      <div 
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                        onClick={() => toggleUserExpanded(user.id)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold overflow-hidden">
                            {user.photoUrl ? (
                              <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase
                            ${user.role === 'gerente' ? 'bg-secondary-light dark:bg-secondary-light/30 text-secondary dark:text-secondary' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}>
                            {user.role}
                          </span>
                          {expandedUserId === user.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {expandedUserId === user.id && (
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Informações de Acesso</p>
                              <div className="bg-gray-50 dark:bg-black/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                    <Mail className="w-4 h-4 mr-2" /> E-mail:
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</span>
                                </div>
                                {currentUser.role === 'gerente' && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                      <Key className="w-4 h-4 mr-2" /> Senha:
                                    </span>
                                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                      {user.password || 'Não definida'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {user.id !== currentUser.id && currentUser.role === 'gerente' && (
                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  className="inline-flex items-center px-3 py-1.5 border border-red-200 dark:border-red-900/50 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                  Excluir Usuário
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
