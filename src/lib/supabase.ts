import { createClient } from '@supabase/supabase-js';
import { config } from '@/config/env';

if (!config.supabase.url) {
  throw new Error('Supabase URL não configurada');
}

if (!config.supabase.anonKey) {
  throw new Error('Supabase Anon Key não configurada');
}

// Log de inicialização
console.log('Inicializando cliente Supabase:', {
  url: config.supabase.url,
  hasAnonKey: !!config.supabase.anonKey,
  timestamp: new Date().toISOString()
});

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10));

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    db: {
      schema: 'public'
    }
  }
);

// Função auxiliar para login
export const signIn = async (email: string, password: string) => {
  console.log('Tentando fazer login com:', { email });
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Erro no login:', error);
      throw error;
    }

    console.log('Login bem-sucedido:', { user: data.user?.email });
    return data;
  } catch (error) {
    console.error('Erro durante o login:', error);
    throw error;
  }
};

// Função auxiliar para logout
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
    console.log('Logout realizado com sucesso');
  } catch (error) {
    console.error('Erro durante o logout:', error);
    throw error;
  }
}; 