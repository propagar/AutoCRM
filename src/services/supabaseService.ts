import { supabase } from '../lib/supabase';
import { Client, Interaction, User, Goals } from '../store/useStore';

export const supabaseService = {
  // Users
  async getUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data as User[];
  },

  async addUser(user: Omit<User, 'id'>) {
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw error;
    return data as User;
  },

  // Clients
  async getClients() {
    const { data, error } = await supabase.from('clients').select('*, interactions(*)');
    if (error) throw error;
    return data as Client[];
  },

  async addClient(client: Omit<Client, 'id' | 'interactions' | 'createdAt' | 'stage'>) {
    const { data, error } = await supabase.from('clients').insert([{
      full_name: client.fullName,
      cpf: client.cpf,
      phone: client.phone,
      email: client.email,
      instagram: client.instagram,
      facebook: client.facebook,
      city: client.city,
      address: client.address,
      birth_date: client.birthDate,
      salesperson: client.salesperson,
      stage: 'Lead Novo'
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateClient(id: string, clientData: Partial<Client>) {
    const { data, error } = await supabase.from('clients').update({
      full_name: clientData.fullName,
      cpf: clientData.cpf,
      phone: clientData.phone,
      email: clientData.email,
      instagram: clientData.instagram,
      facebook: clientData.facebook,
      city: clientData.city,
      address: clientData.address,
      birth_date: clientData.birthDate,
      salesperson: clientData.salesperson,
      stage: clientData.stage
    }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // Interactions
  async addInteraction(clientId: string, interaction: Omit<Interaction, 'id' | 'date'>) {
    const { data, error } = await supabase.from('interactions').insert([{
      client_id: clientId,
      type: interaction.type,
      description: interaction.description
    }]).select().single();
    if (error) throw error;
    return data;
  },

  // Funnel Stages
  async getFunnelStages() {
    const { data, error } = await supabase.from('funnel_stages').select('*').order('order_index');
    if (error) throw error;
    return data.map(stage => stage.name);
  },

  async updateFunnelStages(stages: string[]) {
    // Delete all existing stages
    await supabase.from('funnel_stages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new stages
    const newStages = stages.map((name, index) => ({ name, order_index: index + 1 }));
    const { error } = await supabase.from('funnel_stages').insert(newStages);
    if (error) throw error;
  },

  // Goals
  async getGoals(userId: string) {
    const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"
    return data;
  },

  async updateGoals(userId: string, goals: Partial<Goals>) {
    const { data, error } = await supabase.from('goals').upsert({
      user_id: userId,
      daily_prospects: goals.dailyProspects,
      monthly_sales: goals.monthlySales,
      current_prospects: goals.currentProspects,
      current_sales: goals.currentSales,
      updated_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return data;
  }
};
