import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRMStore } from '../store/useStore';
import { Car, LogIn, UserPlus } from 'lucide-react';

export function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register, isLoading } = useCRMStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!name.trim()) {
        setError('Por favor, informe seu nome.');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      const success = await register(name, email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Este e-mail já está em uso ou ocorreu um erro.');
      }
    } else {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('E-mail ou senha incorretos.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Car className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          AutoCRM
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {isRegistering ? 'Crie sua conta de Gerente' : 'Faça login para acessar o painel'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-xl shadow-gray-200/50 dark:shadow-none sm:rounded-3xl sm:px-10 border border-gray-100 dark:border-zinc-800 transition-colors">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome Completo
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Endereço de e-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors"
                  placeholder="vendedor@loja.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-pulse">Aguarde...</span>
                ) : isRegistering ? (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Criar Conta
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Entrar no Sistema
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 font-medium"
            >
              {isRegistering 
                ? 'Já tem uma conta? Faça login' 
                : 'Não tem conta? Cadastre-se como Gerente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
