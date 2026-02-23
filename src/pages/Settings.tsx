import React, { useState, useRef } from 'react';
import { useCRMStore } from '../store/useStore';
import { Camera, Save, UserPlus, Mail, User, Shield } from 'lucide-react';

export function Settings() {
  const { currentUser, updateCurrentUser, users, addUser } = useCRMStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'vendedor' as 'gerente' | 'vendedor',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser(profileData);
    alert('Perfil atualizado com sucesso!');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCurrentUser({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    
    addUser(newUser);
    setNewUser({ name: '', email: '', role: 'vendedor' });
    alert('Usuário adicionado com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-sm text-gray-500">Gerencie seu perfil e preferências do sistema.</p>
      </div>

      {/* Perfil do Usuário */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Meu Perfil</h3>
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Foto */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-blue-50 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                  {currentUser.photoUrl ? (
                    <img src={currentUser.photoUrl} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-blue-600">{currentUser.name.charAt(0)}</span>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors border-2 border-white"
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
                  ${currentUser.role === 'gerente' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveProfile} className="flex-1 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de Login</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Área do Gerente */}
      {currentUser.role === 'gerente' && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
          <div className="bg-purple-50 p-6 border-b border-purple-100 flex items-center">
            <Shield className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-purple-900">Administração de Equipe</h3>
              <p className="text-sm text-purple-700">Adicione e gerencie os vendedores da loja.</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Adicionar Usuário */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Novo Usuário</h4>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="Nome do Vendedor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="vendedor@loja.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Papel</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    >
                      <option value="vendedor">Vendedor</option>
                      <option value="gerente">Gerente</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Usuário
                  </button>
                </form>
              </div>

              {/* Lista de Usuários */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Equipe Atual</h4>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                          {user.photoUrl ? (
                            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase
                        ${user.role === 'gerente' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'}`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
