import React, { useState } from 'react';
import { Database, Copy, Check, ChevronDown, ChevronUp, Code2, ExternalLink } from 'lucide-react';

interface SupabaseInfoBannerProps {
  isConfigured: boolean;
  onCopySuccess: () => void;
}

const SQL_SCRIPT = `-- Execute no SQL Editor do painel Supabase:
CREATE TABLE IF NOT EXISTS public.cadastros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS (Segurança por linha)
ALTER TABLE public.cadastros ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para a chave anônima (anon)
CREATE POLICY "Permitir leitura publica" 
ON public.cadastros FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permitir insercao anonima" 
ON public.cadastros FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Permitir exclusao" 
ON public.cadastros FOR DELETE TO anon, authenticated USING (true);
`;

export const SupabaseInfoBanner: React.FC<SupabaseInfoBannerProps> = ({ isConfigured, onCopySuccess }) => {
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCRIPT);
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  if (isConfigured) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Supabase Ativo:</strong> Todos os novos cadastros, listagens e exclusões estão sendo sincronizados com o PostgreSQL em nuvem.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-indigo-100 rounded-xl shadow-xs overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/60 to-white">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>Pronto para conectar ao Supabase</span>
              <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Configuração Pendente
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Basta definir <code className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_URL</code> e <code className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> nas variáveis de ambiente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSql((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showSql ? 'Ocultar SQL da Tabela' : 'Ver SQL da Tabela'}</span>
            {showSql ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {showSql && (
        <div className="p-4 border-t border-indigo-100 bg-slate-900 text-slate-100 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-mono text-[11px]">
              Tabela: <span className="text-emerald-400">public.cadastros</span>
            </span>
            <button
              onClick={handleCopySql}
              className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Script SQL'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto p-3 bg-slate-950/80 rounded-lg font-mono text-[11px] leading-relaxed text-slate-300 border border-slate-800">
            {SQL_SCRIPT}
          </pre>
          <div className="mt-2.5 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Dica: Copie o código acima e cole no</span>
            <span className="text-indigo-300 font-semibold">SQL Editor</span>
            <span>do painel do Supabase.</span>
          </div>
        </div>
      )}
    </div>
  );
};
