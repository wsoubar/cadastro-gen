import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Trash2, Download, Inbox, Sparkles } from 'lucide-react';
import { Registro } from '../types';
import { RegistroCard } from './RegistroCard';

interface RegistrosListProps {
  registros: Registro[];
  onDeleteRegistro: (id: string) => void;
  onClearAll: () => void;
  onLoadDemoData: () => void;
  onCopyText: (texto: string) => void;
}

export const RegistrosList: React.FC<RegistrosListProps> = ({
  registros,
  onDeleteRegistro,
  onClearAll,
  onLoadDemoData,
  onCopyText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [confirmingClear, setConfirmingClear] = useState(false);

  // Filtragem e Ordenação
  const filteredRegistros = useMemo(() => {
    let result = [...registros];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.nome.toLowerCase().includes(query) ||
          r.email.toLowerCase().includes(query) ||
          r.mensagem.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.criadoEm).getTime();
      const timeB = new Date(b.criadoEm).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [registros, searchTerm, sortOrder]);

  const handleExportJSON = () => {
    if (registros.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(registros, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cadastros_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearClick = () => {
    if (confirmingClear) {
      onClearAll();
      setConfirmingClear(false);
    } else {
      setConfirmingClear(true);
      setTimeout(() => setConfirmingClear(false), 3000);
    }
  };

  return (
    <section className="mt-8 space-y-4">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Cadastros Realizados</span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
              {registros.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registros armazenados localmente no seu navegador via LocalStorage.
          </p>
        </div>

        {/* Ações globais */}
        {registros.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              title="Exportar todos os registros em arquivo JSON"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar</span>
            </button>
            <button
              onClick={handleClearClick}
              title="Excluir todos os registros do LocalStorage"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                confirmingClear
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 shadow-2xs'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmingClear ? 'Confirmar Limpar Tudo?' : 'Limpar Tudo'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Barra de Filtros e Busca (se houver registros) */}
      {registros.length > 0 && (
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome, e-mail ou palavra-chave..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            title="Alternar ordem de exibição"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'desc' ? 'Mais recentes primeiro' : 'Mais antigos primeiro'}</span>
          </button>
        </div>
      )}

      {/* Lista de Cards */}
      {filteredRegistros.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRegistros.map((registro) => (
            <RegistroCard
              key={registro.id}
              registro={registro}
              onDelete={onDeleteRegistro}
              onCopyText={onCopyText}
            />
          ))}
        </div>
      ) : registros.length > 0 ? (
        /* Caso com busca vazia */
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">Nenhum resultado para "{searchTerm}"</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tente buscar com outros termos ou limpe o campo de pesquisa.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-3 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          >
            Limpar pesquisa
          </button>
        </div>
      ) : (
        /* Estado vazio quando não há registros no storage */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum registro cadastrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Preencha o formulário acima para adicionar um novo registro ou clique no botão abaixo para carregar dados de demonstração.
          </p>
          <button
            onClick={onLoadDemoData}
            className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Carregar dados de exemplo
          </button>
        </div>
      )}
    </section>
  );
};
