// File: supabase/functions/delete-user/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define os cabeçalhos CORS para permitir que sua aplicação chame a função
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Responde a requisições OPTIONS para verificação de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userIdToDelete } = await req.json();
    if (!userIdToDelete) {
      throw new Error("O ID do usuário a ser excluído não foi fornecido.");
    }

    // Cria um cliente Supabase com permissões de 'service_role' (admin)
    // para poder executar ações privilegiadas.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Pega o token de autorização do usuário que está fazendo a chamada
    const authHeader = req.headers.get('Authorization')!;
    
    // Cria um cliente para verificar quem está chamando a função
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Pega os dados do usuário que está tentando excluir alguém
    const { data: { user: caller } } = await supabaseClient.auth.getUser();
    if (!caller) throw new Error('Usuário não autenticado.');

    // Verifica se o usuário que está chamando a função é um gerente
    const { data: callerProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (callerProfile?.role !== 'gerente') {
      return new Response(JSON.stringify({ error: 'Apenas gerentes podem excluir usuários.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }

    // Se tudo estiver certo, exclui o usuário do sistema de autenticação
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);

    if (deleteError) {
      throw deleteError;
    }

    // Retorna sucesso
    return new Response(JSON.stringify({ message: 'Usuário excluído com sucesso.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Retorna um erro se algo falhar
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});