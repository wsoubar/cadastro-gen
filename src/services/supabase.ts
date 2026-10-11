import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Registro } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verifica se as credenciais foram devidamente preenchidas (não vazias e não placeholders)
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim() !== '' &&
    !supabaseUrl.includes('seu-projeto.supabase.co') &&
    !supabaseAnonKey.includes('sua-chave-anon')
);

// Instância do cliente Supabase criada condicionalmente
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface CadastrosTableRow {
  id: string;
  nome: string;
  email: string;
  mensagem: string;
  criado_em: string;
}

const mapRowToRegistro = (row: CadastrosTableRow): Registro => ({
  id: row.id,
  nome: row.nome,
  email: row.email,
  mensagem: row.mensagem,
  criadoEm: row.criado_em,
});

/**
 * Busca todos os registros salvos na tabela `cadastros` do Supabase
 */
export async function getRegistrosFromSupabase(): Promise<Registro[]> {
  if (!supabase) {
    throw new Error('Supabase não está configurado.');
  }

  const { data, error } = await supabase
    .from('cadastros')
    .select('id, nome, email, mensagem, criado_em')
    .order('criado_em', { ascending: false });

  if (error) {
    console.error('Erro ao buscar cadastros no Supabase:', error);
    throw error;
  }

  return (data as CadastrosTableRow[] || []).map(mapRowToRegistro);
}

/**
 * Insere um novo cadastro na tabela `cadastros`
 */
export async function insertRegistroInSupabase(
  registro: Omit<Registro, 'id' | 'criadoEm'>
): Promise<Registro> {
  if (!supabase) {
    throw new Error('Supabase não está configurado.');
  }

  const { data, error } = await supabase
    .from('cadastros')
    .insert([
      {
        nome: registro.nome,
        email: registro.email,
        mensagem: registro.mensagem,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir cadastro no Supabase:', error);
    throw error;
  }

  return mapRowToRegistro(data as CadastrosTableRow);
}

/**
 * Remove um cadastro pelo ID
 */
export async function deleteRegistroFromSupabase(id: string): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase não está configurado.');
  }

  const { error } = await supabase
    .from('cadastros')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir cadastro no Supabase:', error);
    throw error;
  }

  return true;
}

/**
 * Remove todos os cadastros
 */
export async function clearAllRegistrosFromSupabase(): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase não está configurado.');
  }

  // Deleta todas as linhas
  const { error } = await supabase
    .from('cadastros')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Erro ao limpar cadastros no Supabase:', error);
    throw error;
  }

  return true;
}
