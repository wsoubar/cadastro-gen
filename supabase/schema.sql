-- ============================================================
-- Estrutura da Tabela para o Supabase (PostgreSQL)
-- Cole e execute este script no "SQL Editor" do painel Supabase
-- ============================================================

-- 1. Criação da tabela de cadastros
CREATE TABLE IF NOT EXISTS public.cadastros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habilitação de Row Level Security (RLS) para proteção da tabela
ALTER TABLE public.cadastros ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acesso com chave anônima (anon key):

-- Permitir que qualquer visitante leia os cadastros salvos
CREATE POLICY "Permitir leitura publica" 
ON public.cadastros 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Permitir que qualquer visitante envie um novo cadastro
CREATE POLICY "Permitir insercao anonima" 
ON public.cadastros 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Permitir exclusao de cadastros
CREATE POLICY "Permitir exclusao" 
ON public.cadastros 
FOR DELETE 
TO anon, authenticated 
USING (true);

-- 4. Opcional: Índice para otimização de ordenação por data de cadastro
CREATE INDEX IF NOT EXISTS idx_cadastros_criado_em ON public.cadastros (criado_em DESC);
