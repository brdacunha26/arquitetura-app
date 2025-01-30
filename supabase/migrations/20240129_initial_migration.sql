-- Criar tabela de usuários se não existir
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email); 