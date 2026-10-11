import React from 'react';
import { Database, ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  totalRegistros: number;
}

export const Header: React.FC<HeaderProps> = ({ totalRegistros }) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Portal de Cadastro SPA
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Validação reativa de formulário & persistência local
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5" title="Dados salvos no navegador sem necessidade de backend">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-slate-700">LocalStorage Ativo</span>
          </div>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <div className="flex items-center gap-1.5" title="Validação de integridade de dados ativa">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Validação em tempo real</span>
          </div>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <div className="font-semibold text-slate-800">
            {totalRegistros} {totalRegistros === 1 ? 'registro' : 'registros'}
          </div>
        </div>
      </div>
    </header>
  );
};
