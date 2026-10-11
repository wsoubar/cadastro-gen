import { useState, useEffect, useCallback } from 'react';
import { Registro } from './types';
import {
  isSupabaseConfigured,
  getRegistrosFromSupabase,
  insertRegistroInSupabase,
  deleteRegistroFromSupabase,
  clearAllRegistrosFromSupabase,
} from './services/supabase';
import {
  getRegistrosFromStorage,
  saveRegistrosToStorage,
  clearRegistrosStorage,
} from './utils/storage';
import { Header } from './components/Header';
import { CadastroForm } from './components/CadastroForm';
import { RegistrosList } from './components/RegistrosList';
import { SupabaseInfoBanner } from './components/SupabaseInfoBanner';
import { Toast, ToastMessage } from './components/Toast';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback(
    (texto: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso') => {
      setToast({
        id: String(Date.now()),
        tipo,
        texto,
      });
    },
    []
  );

  // Carrega registros da fonte apropriada (Supabase se configurado, senão LocalStorage)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          const data = await getRegistrosFromSupabase();
          setRegistros(data);
        } catch (error: any) {
          console.error('Falha ao carregar do Supabase:', error);
          showToast(
            'Não foi possível conectar à tabela do Supabase. Verifique se executou o script SQL no painel.',
            'erro'
          );
          // Fallback para storage local para evitar tela em branco
          const fallback = getRegistrosFromStorage();
          setRegistros(fallback);
        }
      } else {
        const loaded = getRegistrosFromStorage();
        setRegistros(loaded);
      }
      setIsLoading(false);
    }

    loadData();
  }, [showToast]);

  // Adicionar novo registro
  const handleAddRegistro = async (novo: Omit<Registro, 'id' | 'criadoEm'>) => {
    if (isSupabaseConfigured) {
      try {
        const created = await insertRegistroInSupabase(novo);
        setRegistros((prev) => [created, ...prev]);
        showToast(`Registro de "${created.nome}" salvo no Supabase com sucesso!`, 'sucesso');
      } catch (error: any) {
        console.error('Erro ao salvar no Supabase:', error);
        showToast(
          'Erro ao salvar no Supabase. Verifique as permissões da tabela e o script SQL.',
          'erro'
        );
      }
    } else {
      const registroCompleto: Registro = {
        ...novo,
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        criadoEm: new Date().toISOString(),
      };

      const updated = [registroCompleto, ...registros];
      setRegistros(updated);
      saveRegistrosToStorage(updated);
      showToast(
        `Registro de "${registroCompleto.nome}" salvo temporariamente no LocalStorage (Configure o Supabase para salvar na nuvem).`,
        'sucesso'
      );
    }
  };

  // Excluir registro individual
  const handleDeleteRegistro = async (id: string) => {
    const registroRemovido = registros.find((r) => r.id === id);

    if (isSupabaseConfigured) {
      try {
        await deleteRegistroFromSupabase(id);
        setRegistros((prev) => prev.filter((r) => r.id !== id));
        showToast(
          registroRemovido
            ? `Registro de "${registroRemovido.nome}" excluído do Supabase.`
            : 'Registro excluído do Supabase.',
          'info'
        );
      } catch (error) {
        console.error('Erro ao excluir no Supabase:', error);
        showToast('Erro ao excluir registro no Supabase.', 'erro');
      }
    } else {
      const updated = registros.filter((r) => r.id !== id);
      setRegistros(updated);
      saveRegistrosToStorage(updated);
      showToast(
        registroRemovido
          ? `Registro de "${registroRemovido.nome}" removido do LocalStorage.`
          : 'Registro removido.',
        'info'
      );
    }
  };

  // Limpar todos os registros
  const handleClearAll = async () => {
    if (isSupabaseConfigured) {
      try {
        await clearAllRegistrosFromSupabase();
        setRegistros([]);
        showToast('Todos os registros foram removidos da tabela no Supabase.', 'info');
      } catch (error) {
        console.error('Erro ao limpar no Supabase:', error);
        showToast('Erro ao limpar tabela no Supabase.', 'erro');
      }
    } else {
      clearRegistrosStorage();
      setRegistros([]);
      showToast('Todos os registros foram removidos do LocalStorage.', 'info');
    }
  };

  // Carregar exemplos de teste
  const handleLoadDemoData = async () => {
    const demosData = [
      {
        nome: 'Mariana Silva',
        email: 'mariana.silva@exemplo.com.br',
        mensagem:
          'Olá! Gostaria de receber mais informações sobre o processo de inscrição e os próximos módulos.',
      },
      {
        nome: 'Carlos Eduardo Santos',
        email: 'carlos.santos@techmail.com',
        mensagem:
          'Excelente iniciativa! Estou deixando registrado meu interesse em participar das próximas etapas.',
      },
    ];

    if (isSupabaseConfigured) {
      try {
        for (const item of demosData) {
          await insertRegistroInSupabase(item);
        }
        const refreshed = await getRegistrosFromSupabase();
        setRegistros(refreshed);
        showToast('Registros de exemplo inseridos no Supabase!', 'sucesso');
      } catch (error) {
        console.error('Erro ao carregar demos no Supabase:', error);
        showToast('Erro ao inserir exemplos no Supabase.', 'erro');
      }
    } else {
      const demos: Registro[] = demosData.map((d, index) => ({
        id: `demo-${Date.now()}-${index}`,
        nome: d.nome,
        email: d.email,
        mensagem: d.mensagem,
        criadoEm: new Date(Date.now() - 1000 * 60 * (index + 1) * 30).toISOString(),
      }));
      setRegistros(demos);
      saveRegistrosToStorage(demos);
      showToast('Dados de demonstração carregados com sucesso no LocalStorage!', 'sucesso');
    }
  };

  // Copiar texto para área de transferência
  const handleCopyText = async (texto: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(texto);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = texto;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      showToast('Mensagem copiada para a área de transferência!', 'sucesso');
    } catch {
      showToast('Não foi possível copiar automaticamente.', 'erro');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Header totalRegistros={registros.length} isSupabaseConfigured={isSupabaseConfigured} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Banner com status do Supabase e botão para copiar SQL */}
        <SupabaseInfoBanner
          isConfigured={isSupabaseConfigured}
          onCopySuccess={() => showToast('Script SQL copiado com sucesso!', 'sucesso')}
        />

        {/* Formulário com validações reativas */}
        <CadastroForm onAddRegistro={handleAddRegistro} />

        {/* Indicador de carregamento ou lista */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
            <p className="text-xs text-slate-500 font-medium">Carregando registros...</p>
          </div>
        ) : (
          <RegistrosList
            registros={registros}
            onDeleteRegistro={handleDeleteRegistro}
            onClearAll={handleClearAll}
            onLoadDemoData={handleLoadDemoData}
            onCopyText={handleCopyText}
            onNotify={showToast}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Portal SPA com formulário reativo e integração com banco de dados PostgreSQL via{' '}
            <strong className="text-slate-700">Supabase</strong>.
          </p>
          <p className="text-slate-400">
            {isSupabaseConfigured
              ? 'Conexão ativa com o Supabase'
              : 'Modo LocalStorage ativo aguardando credenciais'}
          </p>
        </div>
      </footer>

      {/* Componente Toast de Notificação */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
