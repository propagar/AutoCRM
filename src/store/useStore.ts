import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type FunnelStage = string;

export interface Interaction {
  id: string;
  type: 'Ligação' | 'WhatsApp' | 'Visita' | 'Email';
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
  stage: FunnelStage;
  interactions: Interaction[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'gerente' | 'vendedor';
  photoUrl?: string;
}

export interface Goals {
  dailyProspects: number;
  monthlySales: number;
  currentProspects: number;
  currentSales: number;
}

interface CRMStore {
  currentUser: User;
  users: User[];
  clients: Client[];
  goals: Goals;
  funnelStages: string[];
  updateCurrentUser: (data: Partial<User>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  addClient: (client: Omit<Client, 'id' | 'interactions' | 'createdAt' | 'stage'>) => void;
  updateClientStage: (id: string, stage: FunnelStage) => void;
  addInteraction: (clientId: string, interaction: Omit<Interaction, 'id' | 'date'>) => void;
  updateGoals: (goals: Partial<Goals>) => void;
  incrementProspects: () => void;
  incrementSales: () => void;
  updateFunnelStages: (stages: string[]) => void;
}

export const useCRMStore = create<CRMStore>((set) => ({
  currentUser: {
    id: 'u1',
    name: 'Vendedor 1',
    email: 'vendedor@loja.com',
    role: 'gerente', // Set to gerente to test functionality
  },
  users: [
    { id: 'u1', name: 'Vendedor 1', email: 'vendedor@loja.com', role: 'gerente' },
    { id: 'u2', name: 'Vendedor 2', email: 'vendedor2@loja.com', role: 'vendedor' },
  ],
  clients: [
    {
      id: '1',
      fullName: 'João Silva',
      cpf: '123.456.789-00',
      phone: '11999999999',
      email: 'joao@email.com',
      city: 'São Paulo',
      address: 'Rua A, 123',
      birthDate: '1990-01-01',
      salesperson: 'Vendedor 1',
      stage: 'Lead Novo',
      interactions: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      fullName: 'Maria Oliveira',
      cpf: '987.654.321-11',
      phone: '11888888888',
      email: 'maria@email.com',
      city: 'Rio de Janeiro',
      address: 'Rua B, 456',
      birthDate: '1985-05-15',
      salesperson: 'Vendedor 2',
      stage: 'Em Negociação',
      interactions: [
        { id: 'i1', type: 'WhatsApp', description: 'Enviado catálogo de SUVs', date: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
    }
  ],
  goals: {
    dailyProspects: 10,
    monthlySales: 5,
    currentProspects: 3,
    currentSales: 1,
  },
  funnelStages: ['Lead Novo', 'Em Negociação', 'Ficha Aprovada', 'Vendido', 'Perdido'],
  updateCurrentUser: (data) => set((state) => ({
    currentUser: { ...state.currentUser, ...data },
    users: state.users.map(u => u.id === state.currentUser.id ? { ...u, ...data } : u)
  })),
  addUser: (userData) => set((state) => ({
    users: [...state.users, { ...userData, id: uuidv4() }]
  })),
  addClient: (clientData) => set((state) => {
    const newClient: Client = {
      ...clientData,
      id: uuidv4(),
      salesperson: clientData.salesperson || 'Vendedor 1',
      stage: 'Lead Novo',
      interactions: [],
      createdAt: new Date().toISOString(),
    };
    return {
      clients: [...state.clients, newClient],
      goals: { ...state.goals, currentProspects: state.goals.currentProspects + 1 }
    };
  }),
  updateClientStage: (id, stage) => set((state) => {
    const updatedClients = state.clients.map(c => c.id === id ? { ...c, stage } : c);
    let salesIncrement = 0;
    if (stage === 'Vendido') {
      const oldStage = state.clients.find(c => c.id === id)?.stage;
      if (oldStage !== 'Vendido') salesIncrement = 1;
    }
    return {
      clients: updatedClients,
      goals: { ...state.goals, currentSales: state.goals.currentSales + salesIncrement }
    };
  }),
  addInteraction: (clientId, interactionData) => set((state) => ({
    clients: state.clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          interactions: [
            ...c.interactions,
            { ...interactionData, id: uuidv4(), date: new Date().toISOString() }
          ]
        };
      }
      return c;
    })
  })),
  updateGoals: (newGoals) => set((state) => ({
    goals: { ...state.goals, ...newGoals }
  })),
  incrementProspects: () => set((state) => ({
    goals: { ...state.goals, currentProspects: state.goals.currentProspects + 1 }
  })),
  incrementSales: () => set((state) => ({
    goals: { ...state.goals, currentSales: state.goals.currentSales + 1 }
  })),
  updateFunnelStages: (stages) => set({ funnelStages: stages }),
}));
