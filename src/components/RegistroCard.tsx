import React, { useState } from 'react';
import { Mail, Clock, Copy, Trash2, Check, MessageSquare } from 'lucide-react';
import { Registro } from '../types';

interface RegistroCardProps {
  registro: Registro;
  onDelete: (id: string) => void;
  onCopyText: (texto: string) => void;
}

// Gera cor consistente baseada no nome
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-sky-600 text-white',
    'bg-violet-600 text-white',
    'bg-amber-600 text-white',
    'bg-teal-600 text-white',
    'bg-rose-600 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const RegistroCard: React.FC<RegistroCardProps> = ({ registro, onDelete, onCopyText }) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const handleCopyMessage = () => {
    onCopyText(registro.mensagem);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteClick = () => {
    if (isDeleting) {
      onDelete(registro.id);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  return (
    <article className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs tracking-wider shadow-xs shrink-0 ${getAvatarColor(registro.nome)}`}>
              {getInitials(registro.nome)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm truncate leading-tight">
                {registro.nome}
              </h3>
              <a
                href={`mailto:${registro.email}`}
                className="text-xs text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 mt-0.5 truncate"
                title={`Enviar e-mail para ${registro.email}`}
              >
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{registro.email}</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyMessage}
              title="Copiar mensagem"
              aria-label="Copiar mensagem"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDeleteClick}
              title={isDeleting ? 'Clique novamente para confirmar exclusão' : 'Excluir registro'}
              aria-label="Excluir registro"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDeleting
                  ? 'bg-rose-100 text-rose-700 font-medium text-xs px-2 flex items-center gap-1'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting && <span>Confirmar?</span>}
            </button>
          </div>
        </div>

        {/* Mensagem */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <div className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="whitespace-pre-wrap break-words flex-1 font-normal">
              {registro.mensagem}
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé com timestamp */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-50">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(registro.criadoEm)}</span>
        </div>
        <span className="font-mono text-[10px] text-slate-300">ID: {registro.id.slice(0, 8)}</span>
      </div>
    </article>
  );
};
