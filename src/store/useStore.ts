import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type FunnelStage = string;

export interface Interaction {
  id: string;
  type: 'Ligação' | 'WhatsApp' | 'Visita' | 'Email' | 'Venda' | 'Status';
  description: string;
  date: string;
}

export interface Client {
  id: string;
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  instagram?: string;
  facebook?: string;
  city: string;
  address: string;
  birthDate: string;
  salesperson?: string;
  notes?: string;
  tags?: string[];
  stage: FunnelStage;
  interactions: Interaction[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional for now since we're mocking, but needed for login
  role: 'gerente' | 'vendedor';
  photoUrl?: string;
  company_id?: string;
}

export interface Goals {
  dailyProspects: number;
  monthlySales: number;
  currentProspects: number;
  currentSales: number;
}

export interface UserGoal extends Goals {
  userId: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  state?: string;
  phone?: string;
  owner_id: string;
  created_at: string;
}

interface CRMStore {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  company: Company | null;
  users: User[];
  clients: Client[];
  goals: Goals;
  allGoals: UserGoal[];
  funnelStages: string[];
  availableTags: string[];
  theme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  isLoading: boolean;
  fetchInitialData: () => Promise<void>;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string, companyName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateCurrentUser: (data: Partial<User>) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateCompany: (companyId: string, companyData: Partial<Company>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'interactions' | 'createdAt' | 'stage'>, options?: { isImport?: boolean }) => Promise<void>;
  updateClient: (id: string, clientData: Partial<Client>) => Promise<void>;
  updateClientStage: (id: string, stage: FunnelStage) => Promise<void>;
  addInteraction: (clientId: string, interaction: Omit<Interaction, 'id' | 'date'>) => Promise<void>;
  updateGoals: (goals: Partial<Goals>) => Promise<void>;
  updateUserGoals: (userId: string, goals: Partial<Goals>) => Promise<void>;
  incrementProspects: () => Promise<void>;
  incrementSales: () => Promise<void>;
  updateFunnelStages: (stages: string[]) => void;
  addTag: (tag: string) => void;
  toggleTheme: () => void;
  updateThemeColors: (primary: string, secondary: string) => void;
  resetAllSales: () => Promise<void>;
  resetAllProspects: () => Promise<void>;
  resetCurrentUsersSales: () => Promise<void>;
  resetDailyProspects: () => Promise<void>;
}

// Helper to map DB snake_case to App camelCase
const mapClientFromDB = (dbClient: any): Client => ({
  id: dbClient.id,
  fullName: dbClient.full_name,
  cpf: dbClient.cpf,
  phone: dbClient.phone,
  email: dbClient.email,
  instagram: dbClient.instagram,
  facebook: dbClient.facebook,
  city: dbClient.city,
  address: dbClient.address,
  birthDate: dbClient.birth_date,
  salesperson: dbClient.salesperson,
  notes: dbClient.notes,
  tags: dbClient.tags || [],
  stage: dbClient.stage,
  interactions: [],
  createdAt: dbClient.created_at,
});

const mapUserFromDB = (dbUser: any): User => ({
  id: dbUser.id,
  name: dbUser.name,
  email: dbUser.email,
  password: dbUser.password,
  role: dbUser.role,
  photoUrl: dbUser.photo_url,
});

export const useCRMStore = create<CRMStore>()(
  persist(
    (set, get) => ({
      isSidebarCollapsed: false,
      toggleSidebar: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      isAuthenticated: false,
      currentUser: null,
      company: null,
      users: [],
      clients: [],
      goals: {
        dailyProspects: 10,
        monthlySales: 5,
        currentProspects: 0,
        currentSales: 0,
      },
      allGoals: [],
      funnelStages: ['Base de Clientes', 'Lead Novo', 'Em Negociação', 'Ficha Aprovada', 'Vendido', 'Perdido'],
      availableTags: ['Urgente', 'Financiamento', 'À Vista', 'Troca'],
      theme: 'light',
      primaryColor: '#2563eb', // blue-600
      secondaryColor: '#9333ea', // purple-600
      isLoading: false,

  fetchInitialData: async () => {
    set({ isLoading: true });
    
    // Ensure 'Base de Clientes' is in funnelStages
    const currentStages = get().funnelStages;
    if (!currentStages.includes('Base de Clientes')) {
      set({ funnelStages: ['Base de Clientes', ...currentStages] });
    }

    try {
      // Fetch users
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) {
        set({ users: usersData.map(mapUserFromDB) });
      }

      // Fetch company data for the current user's company
      const currentUserCompanyId = get().currentUser?.company_id;
      if (currentUserCompanyId) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', currentUserCompanyId)
          .single();
        if (companyData) {
          set({ company: companyData });
        }
      }

      // Fetch clients
      const { data: clientsData } = await supabase.from('clients').select('*');
      
      // Fetch interactions
      const { data: interactionsData } = await supabase.from('interactions').select('*');

      if (clientsData) {
        const mappedClients = clientsData.map(mapClientFromDB);
        
        // Attach interactions
        if (interactionsData) {
          interactionsData.forEach(interaction => {
            const client = mappedClients.find(c => c.id === interaction.client_id);
            if (client) {
              client.interactions.push({
                id: interaction.id,
                type: interaction.type,
                description: interaction.description,
                date: interaction.date,
              });
            }
          });
        }
        
        set({ clients: mappedClients });
      }

      // Fetch goals for current user
      const currentUser = get().currentUser;
      if (currentUser) {
        // Fetch all goals so everyone can see team progress
        const { data: allGoalsData } = await supabase.from('goals').select('*');
        if (allGoalsData) {
          const mappedAllGoals = allGoalsData.map(g => ({
            userId: g.user_id,
            dailyProspects: g.daily_prospects,
            monthlySales: g.monthly_sales,
            currentProspects: g.current_prospects,
            currentSales: g.current_sales,
          }));
          set({ allGoals: mappedAllGoals });

          // Set current user's goals
          const userGoals = mappedAllGoals.find(g => g.userId === currentUser.id);
          if (userGoals) {
            set({ goals: userGoals });
            // Se currentSales não for 0, zere todas as vendas
            if (userGoals.currentSales > 0) {
              console.log('Vendas diferentes de zero detectadas, zerando todas as vendas para 0.');
              await get().resetAllSales();
            }
          } else {
            // Create initial goals if missing
            const defaultGoals = {
              user_id: currentUser.id,
              daily_prospects: 10,
              monthly_sales: 5,
              current_prospects: 0,
              current_sales: 0
            };
            await supabase.from('goals').insert([defaultGoals]);
            const newGoal = {
              userId: currentUser.id,
              dailyProspects: defaultGoals.daily_prospects,
              monthlySales: defaultGoals.monthly_sales,
              currentProspects: defaultGoals.current_prospects,
              currentSales: defaultGoals.current_sales,
            };
            set(state => ({ 
              goals: newGoal,
              allGoals: [...state.allGoals, newGoal]
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      // 1. Try Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });

      if (!authError && authData.user) {
        // Auth success, get user data from public.users
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        let finalUser;

        if (!userData) {
          const { data: newUserData, error: insertError } = await supabase
            .from('users')
            .insert([{ 
              id: authData.user.id, 
              name: email.split('@')[0], 
              email, 
              role: 'vendedor' 
            }])
            .select()
            .single();
            
          if (insertError) throw insertError;
          finalUser = newUserData;
          
          await supabase.from('goals').insert([{
            user_id: finalUser.id,
            daily_prospects: 10,
            monthly_sales: 5,
            current_prospects: 0,
            current_sales: 0
          }]);
        } else {
          finalUser = userData;
        }

        set({ isAuthenticated: true, currentUser: mapUserFromDB(finalUser) });
        await get().fetchInitialData();
        return true;
      }

      // 2. Fallback for MVP: Check public.users table directly (for users added by manager)
      const { data: simpleUser, error: simpleError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (simpleUser) {
        set({ isAuthenticated: true, currentUser: mapUserFromDB(simpleUser) });
        await get().fetchInitialData();
        return true;
      }

      if (authError) throw authError;
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password, companyName) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || '',
        options: {
          data: { name, companyName }, // Pass name and companyName to be used in the trigger
        },
      });

      if (error || !data.user) {
        console.error('Register error:', error?.message);
        set({ isLoading: false });
        return false;
      }
      
      // The trigger will create the company and user profile.
      // We need a small delay to ensure the trigger has run before fetching.
      await new Promise(res => setTimeout(res, 1000)); 

      // Re-fetch user data to get the user with company_id
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userData) {
        set({ isAuthenticated: true, currentUser: mapUserFromDB(userData) });
        await get().fetchInitialData();
        return true;
      } else {
        // Fallback if trigger is slow or fails
        await supabase.auth.signOut();
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, currentUser: null, clients: [] });
  },

  updateCurrentUser: async (data) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    
    const updatePayload: any = {};
    if (data.name) updatePayload.name = data.name;
    if (data.email) updatePayload.email = data.email;
    if (data.photoUrl) updatePayload.photo_url = data.photoUrl;

    const { error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', currentUser.id);

    if (!error) {
      set((state) => ({
        currentUser: { ...state.currentUser!, ...data },
        users: state.users.map(u => u.id === currentUser.id ? { ...u, ...data } : u)
      }));
    }
  },

  addUser: async (userData) => {
    const state = get();
    const currentUser = state.currentUser;
    if (!currentUser || currentUser.role !== 'gerente') return;

    // The RLS policy ensures we can only fetch the company_id of the current user's company.
    const { data: companyData, error: companyError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', currentUser.id)
      .single();

    if (companyError || !companyData) {
      console.error('Could not fetch manager company ID:', companyError?.message);
      return;
    }

    // Create the user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || '',
    });

    if (signUpError || !signUpData.user) {
        console.error('Error creating auth user:', signUpError?.message);
        return;
    }

    // Add the user to the public.users table with the correct company_id
    const { data: newUserData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: signUpData.user.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        company_id: companyData.company_id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting user profile:', insertError.message);
      // Cleanup: remove the user from auth if profile insertion fails
      // This requires admin privileges, so we'll just log the error for now.
      // await supabase.auth.admin.deleteUser(signUpData.user.id);
      return;
    }

    if (newUserData) {
      set((state) => ({ users: [...state.users, mapUserFromDB(newUserData)] }));
      // Create initial goals for the new user
      await supabase.from('goals').insert([{
        user_id: newUserData.id,
        daily_prospects: 10,
        monthly_sales: 5,
        current_prospects: 0,
        current_sales: 0
      }]);
    }
  },

  updateCompany: async (companyId, companyData) => {
    const updatePayload: any = {};
    if (companyData.name !== undefined) updatePayload.name = companyData.name;
    if (companyData.cnpj !== undefined) updatePayload.cnpj = companyData.cnpj;

    const { error } = await supabase
      .from('companies')
      .update(updatePayload)
      .eq('id', companyId);

    if (error) {
      console.error('Error updating company:', error);
    } else {
      set((state) => ({
        company: state.company ? { ...state.company, ...companyData } : null,
      }));
    }
  },

  deleteUser: async (id) => {
    console.log(`[deleteUser] Iniciando exclusão para o ID: ${id}`);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userIdToDelete: id },
      });

      // Log completo da resposta para depuração
      console.log('[deleteUser] Resposta recebida da Edge Function:', { data, error });

      if (error) {
        // Erro de rede ou na chamada da função
        throw new Error(`Erro de rede/chamada: ${error.message}`);
      }

      // A função pode retornar um erro dentro do objeto 'data'
      if (data && data.error) {
        throw new Error(`Erro retornado pela função: ${data.error}`);
      }

      // Se a exclusão for bem-sucedida, a função deve retornar uma mensagem de sucesso
      console.log('[deleteUser] Exclusão bem-sucedida no servidor. Atualizando estado local.');
      set((state) => ({
        users: state.users.filter(u => u.id !== id)
      }));
      alert('Usuário excluído com sucesso!');

    } catch (e) {
      const err = e as Error;
      console.error('[deleteUser] Ocorreu uma falha no processo de exclusão:', err);
      alert(`ERRO: Não foi possível excluir o usuário. Verifique o console do navegador para detalhes técnicos (F12 > Console).`);
    }
  },

  addClient: async (clientData, options) => {
    const currentUser = get().currentUser;
    const salespersonName = clientData.salesperson || currentUser?.name || 'Vendedor';
    const isImport = options?.isImport || false;

    const insertPayload = {
      full_name: clientData.fullName,
      cpf: clientData.cpf,
      phone: clientData.phone,
      email: clientData.email,
      instagram: clientData.instagram,
      facebook: clientData.facebook,
      city: clientData.city,
      address: clientData.address,
      birth_date: clientData.birthDate || null,
      salesperson: salespersonName,
      stage: isImport ? 'Base de Clientes' : 'Lead Novo'
    };

    const { data, error } = await supabase
      .from('clients')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Error adding client:', error);
      return;
    }

    if (data) {
      const newClient = mapClientFromDB(data);
      set((state) => ({
        clients: [...state.clients, newClient]
      }));
      
      if (!isImport) {
        await get().incrementProspects();
      }
    }
  },

  updateClient: async (id, clientData) => {
    const updatePayload: any = {};
    if (clientData.fullName !== undefined) updatePayload.full_name = clientData.fullName;
    if (clientData.cpf !== undefined) updatePayload.cpf = clientData.cpf;
    if (clientData.phone !== undefined) updatePayload.phone = clientData.phone;
    if (clientData.email !== undefined) updatePayload.email = clientData.email;
    if (clientData.instagram !== undefined) updatePayload.instagram = clientData.instagram;
    if (clientData.facebook !== undefined) updatePayload.facebook = clientData.facebook;
    if (clientData.city !== undefined) updatePayload.city = clientData.city;
    if (clientData.address !== undefined) updatePayload.address = clientData.address;
    if (clientData.birthDate !== undefined) updatePayload.birth_date = clientData.birthDate || null;

    const { error } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', id);

    if (!error) {
      set((state) => ({
        clients: state.clients.map(c => c.id === id ? { ...c, ...clientData } : c)
      }));
    }
  },

  updateClientStage: async (id, stage) => {
    const state = get();
    const client = state.clients.find(c => c.id === id);
    const oldStage = client?.stage;
    
    const { error } = await supabase
      .from('clients')
      .update({ stage })
      .eq('id', id);

    if (!error) {
      // Create the interaction record for the stage change
      if (oldStage && oldStage !== stage) {
        const description = `Status alterado de "${oldStage}" para "${stage}".`;
        const { data: interactionData, error: interactionError } = await supabase
          .from('interactions')
          .insert([{ client_id: id, type: 'Status', description }])
          .select()
          .single();
        
        if (!interactionError && interactionData) {
          // Update state with both changes at once
          set(state => ({
            clients: state.clients.map(c => {
              if (c.id === id) {
                return { 
                  ...c, 
                  stage,
                  interactions: [...c.interactions, { id: interactionData.id, type: interactionData.type, description: interactionData.description, date: interactionData.date }]
                };
              }
              return c;
            })
          }));
        } else {
          // If interaction fails to log, still update the stage locally
          set(state => ({ clients: state.clients.map(c => c.id === id ? { ...c, stage } : c) }));
        }
      } else {
         // If no stage change, just update the stage in the state
         set(state => ({
            clients: state.clients.map(c => c.id === id ? { ...c, stage } : c)
         }));
      }
      
      if (stage === 'Vendido' && oldStage !== 'Vendido') {
        await get().incrementSales();
      }

      if (oldStage === 'Base de Clientes' && stage !== 'Base de Clientes' && stage !== 'Perdido') {
        await get().incrementProspects();
      }
    }
  },

  addInteraction: async (clientId, interactionData) => {
    const { data, error } = await supabase
      .from('interactions')
      .insert([{
        client_id: clientId,
        type: interactionData.type,
        description: interactionData.description
      }])
      .select()
      .single();

    if (data) {
      set((state) => ({
        clients: state.clients.map(c => {
          if (c.id === clientId) {
            return {
              ...c,
              interactions: [
                ...c.interactions,
                { id: data.id, type: data.type, description: data.description, date: data.date }
              ]
            };
          }
          return c;
        })
      }));
    }
  },

  updateGoals: async (newGoals) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const updatePayload: any = {};
    if (newGoals.dailyProspects !== undefined) updatePayload.daily_prospects = newGoals.dailyProspects;
    if (newGoals.monthlySales !== undefined) updatePayload.monthly_sales = newGoals.monthlySales;

    const { error } = await supabase
      .from('goals')
      .update(updatePayload)
      .eq('user_id', currentUser.id);

    if (!error) {
      set((state) => ({
        goals: { ...state.goals, ...newGoals },
        allGoals: state.allGoals.map(g => g.userId === currentUser.id ? { ...g, ...newGoals } : g)
      }));
    }
  },

  updateUserGoals: async (userId, newGoals) => {
    const updatePayload: any = {};
    if (newGoals.dailyProspects !== undefined) updatePayload.daily_prospects = newGoals.dailyProspects;
    if (newGoals.monthlySales !== undefined) updatePayload.monthly_sales = newGoals.monthlySales;
    if (newGoals.currentProspects !== undefined) updatePayload.current_prospects = newGoals.currentProspects;
    if (newGoals.currentSales !== undefined) updatePayload.current_sales = newGoals.currentSales;

    const { error } = await supabase
      .from('goals')
      .update(updatePayload)
      .eq('user_id', userId);

    if (!error) {
      set((state) => {
        const updatedAllGoals = state.allGoals.map(g => g.userId === userId ? { ...g, ...newGoals } : g);
        const newState: any = { allGoals: updatedAllGoals };
        
        // If updating current user's goals, update the main goals object too
        if (state.currentUser?.id === userId) {
          newState.goals = { ...state.goals, ...newGoals };
        }
        
        return newState;
      });
    }
  },

  incrementProspects: async () => {
    const currentUser = get().currentUser;
    const currentGoals = get().goals;
    if (!currentUser) return;

    const newProspects = currentGoals.currentProspects + 1;
    
    const { error } = await supabase
      .from('goals')
      .update({ current_prospects: newProspects })
      .eq('user_id', currentUser.id);

    if (!error) {
      set((state) => ({
        goals: { ...state.goals, currentProspects: newProspects },
        allGoals: state.allGoals.map(g => g.userId === currentUser.id ? { ...g, currentProspects: newProspects } : g)
      }));
    }
  },

  incrementSales: async () => {
    const currentUser = get().currentUser;
    const currentGoals = get().goals;
    if (!currentUser) return;

    const newSales = currentGoals.currentSales + 1;
    
    const { error } = await supabase
      .from('goals')
      .update({ current_sales: newSales })
      .eq('user_id', currentUser.id);

    if (!error) {
      set((state) => ({
        goals: { ...state.goals, currentSales: newSales },
        allGoals: state.allGoals.map(g => g.userId === currentUser.id ? { ...g, currentSales: newSales } : g)
      }));
    }
  },

  resetDailyProspects: async () => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const { error } = await supabase
      .from('goals')
      .update({ current_prospects: 0 })
      .eq('user_id', currentUser.id);

    if (!error) {
      set((state) => ({
        goals: { ...state.goals, currentProspects: 0 },
        allGoals: state.allGoals.map(g => g.userId === currentUser.id ? { ...g, currentProspects: 0 } : g)
      }));
    }
  },

  updateFunnelStages: (stages) => set({ funnelStages: stages }),
  
  addTag: (tag) => set((state) => {
    if (!state.availableTags.includes(tag)) {
      return { availableTags: [...state.availableTags, tag] };
    }
    return state;
  }),
  
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  
  updateThemeColors: (primary, secondary) => set({ primaryColor: primary, secondaryColor: secondary }),

  resetAllSales: async () => {
    // Reset clients stage
    const { data: clientsToReset, error: fetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('stage', 'Vendido');

    if (fetchError) {
      console.error('Error fetching clients to reset:', fetchError);
      return;
    }

    if (clientsToReset && clientsToReset.length > 0) {
      const idsToReset = clientsToReset.map(c => c.id);
      const { error: updateError } = await supabase
        .from('clients')
        .update({ stage: 'Contato Inicial' })
        .in('id', idsToReset);
      if (updateError) {
        console.error('Error resetting client stages:', updateError);
        return;
      }
    }

    // Reset goals - using a filter to ensure it works with RLS/Safe updates
    const { error: goalsError } = await supabase
      .from('goals')
      .update({ current_sales: 0 })
      .not('user_id', 'is', null);
    
    if (goalsError) {
      console.error('Error resetting goals:', goalsError);
      return;
    }

    // Update state locally
    set((state) => ({
      clients: state.clients.map(c => c.stage === 'Vendido' ? { ...c, stage: 'Contato Inicial' } : c),
      allGoals: state.allGoals.map(g => ({ ...g, currentSales: 0 })),
      goals: { ...state.goals, currentSales: 0 },
    }));
  },

  resetAllProspects: async () => {
    const { error } = await supabase
      .from('goals')
      .update({ current_prospects: 0 })
      .not('user_id', 'is', null);
    
    if (error) {
      console.error('Error resetting all prospects:', error);
      return;
    }

    set((state) => ({
      allGoals: state.allGoals.map(g => ({ ...g, currentProspects: 0 })),
      goals: { ...state.goals, currentProspects: 0 },
    }));
  },

  resetCurrentUsersSales: async () => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const { error: goalsError } = await supabase
      .from('goals')
      .update({ current_sales: 0 })
      .eq('user_id', currentUser.id);
    
    if (goalsError) {
      console.error('Error resetting current user sales:', goalsError);
      return;
    }

    set((state) => ({
      allGoals: state.allGoals.map(g => g.userId === currentUser.id ? { ...g, currentSales: 0 } : g),
      goals: { ...state.goals, currentSales: 0 },
    }));
  },
    }),
    {
      name: 'crm-storage',
      partialize: (state) => ({ 
        isSidebarCollapsed: state.isSidebarCollapsed,
        isAuthenticated: state.isAuthenticated, 
        currentUser: state.currentUser,
        theme: state.theme,
        primaryColor: state.primaryColor,
        secondaryColor: state.secondaryColor,
        availableTags: state.availableTags
      }),
    }
  )
);
