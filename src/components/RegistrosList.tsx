import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ArrowUpDown, Trash2, Download, Inbox, Sparkles, FileSpreadsheet, ChevronDown, Check } from 'lucide-react';
import { Registro } from '../types';
import { RegistroCard } from './RegistroCard';

export type SortOption =
  | 'data-desc'
  | 'data-asc'
  | 'nome-asc'
  | 'nome-desc'
  | 'email-asc'
  | 'email-desc'
  | 'msg-desc'
  | 'msg-asc';

interface SortConfig {
  id: SortOption;
  label: string;
  badge?: string;
}

const SORT_OPTIONS: SortConfig[] = [
  { id: 'data-desc', label: 'Mais recentes primeiro' },
  { id: 'data-asc', label: 'Mais antigos primeiro' },
  { id: 'nome-asc', label: 'Nome (A a Z - Alfabética)' },
  { id: 'nome-desc', label: 'Nome (Z a A - Alfabética reversa)' },
  { id: 'email-asc', label: 'E-mail (A a Z)' },
  { id: 'email-desc', label: 'E-mail (Z a A)' },
  { id: 'msg-desc', label: 'Mensagem mais longa' },
  { id: 'msg-asc', label: 'Mensagem mais curta' },
];

interface RegistrosListProps {
  registros: Registro[];
  onDeleteRegistro: (id: string) => void;
  onClearAll: () => void;
  onLoadDemoData: () => void;
  onCopyText: (texto: string) => void;
  onNotify?: (texto: string, tipo?: 'sucesso' | 'info') => void;
}

export const RegistrosList: React.FC<RegistrosListProps> = ({
  registros,
  onDeleteRegistro,
  onClearAll,
  onLoadDemoData,
  onCopyText,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('data-desc');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown de ordenação ao clicar fora ou pressionar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
      switch (sortOption) {
        case 'data-desc':
          return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
        case 'data-asc':
          return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime();
        case 'nome-asc':
          return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
        case 'nome-desc':
          return b.nome.localeCompare(a.nome, 'pt-BR', { sensitivity: 'base' });
        case 'email-asc':
          return a.email.toLowerCase().localeCompare(b.email.toLowerCase(), 'pt-BR');
        case 'email-desc':
          return b.email.toLowerCase().localeCompare(a.email.toLowerCase(), 'pt-BR');
        case 'msg-desc':
          return b.mensagem.trim().length - a.mensagem.trim().length;
        case 'msg-asc':
          return a.mensagem.trim().length - b.mensagem.trim().length;
        default:
          return 0;
      }
    });

    return result;
  }, [registros, searchTerm, sortOption]);

  const currentSortLabel = useMemo(() => {
    return SORT_OPTIONS.find((opt) => opt.id === sortOption)?.label || 'Mais recentes primeiro';
  }, [sortOption]);

  const handleExportCSV = () => {
    if (registros.length === 0) return;

    // Escapa valores conforme a RFC 4180
    const escapeCSV = (field: string | undefined | null) => {
      if (field === null || field === undefined) return '""';
      const text = String(field).replace(/"/g, '""');
      return `"${text}"`;
    };

    // Cabeçalhos amigáveis em português
    const headers = ['ID', 'Nome', 'E-mail', 'Mensagem', 'Data de Cadastro'];

    const rows = registros.map((r) => {
      let dataFormatada = r.criadoEm;
      try {
        dataFormatada = new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date(r.criadoEm));
      } catch {
        dataFormatada = r.criadoEm;
      }

      return [
        escapeCSV(r.id),
        escapeCSV(r.nome),
        escapeCSV(r.email),
        escapeCSV(r.mensagem),
        escapeCSV(dataFormatada),
      ].join(';'); // Separador ';' padrão para compatibilidade no Brasil com Excel e planilhas
    });

    // Prefixo BOM UTF-8 (\uFEFF) para abrir acentos perfeitamente no Excel/Calc
    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `cadastros_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
    if (onNotify) {
      onNotify(`Arquivo CSV com ${registros.length} ${registros.length === 1 ? 'registro' : 'registros'} baixado com sucesso!`, 'sucesso');
    }
  };

  const handleExportJSON = () => {
    if (registros.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(registros, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cadastros_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (onNotify) {
      onNotify('Arquivo JSON baixado com sucesso!', 'sucesso');
    }
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              title="Baixar todos os registros em formato de planilha CSV"
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Baixar CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              title="Exportar todos os registros em arquivo JSON"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>JSON</span>
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

          <div className="relative w-full sm:w-auto" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-between sm:justify-center gap-2 shrink-0 cursor-pointer"
              title="Alterar ordem de exibição dos registros"
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
            >
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-500 hidden md:inline">Ordem:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px] sm:max-w-none">
                  {currentSortLabel}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 shrink-0 ${
                  isSortOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Menu Popover de Opções de Ordenação */}
            {isSortOpen && (
              <div
                role="listbox"
                aria-label="Opções de ordenação"
                className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100"
              >
                {/* Grupo: Por Data */}
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Data de Cadastro
                  </div>
                  {SORT_OPTIONS.slice(0, 2).map((opt) => {
                    const isSelected = sortOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setSortOption(opt.id);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Grupo: Por Nome */}
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nome Completo
                  </div>
                  {SORT_OPTIONS.slice(2, 4).map((opt) => {
                    const isSelected = sortOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setSortOption(opt.id);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Grupo: E-mail e Mensagem */}
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    E-mail & Mensagem
                  </div>
                  {SORT_OPTIONS.slice(4).map((opt) => {
                    const isSelected = sortOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setSortOption(opt.id);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
