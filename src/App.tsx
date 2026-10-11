import { useState, useEffect } from 'react';
import { Registro } from './types';
import { getRegistrosFromStorage, saveRegistrosToStorage, clearRegistrosStorage } from './utils/storage';
import { Header } from './components/Header';
import { CadastroForm } from './components/CadastroForm';
import { RegistrosList } from './components/RegistrosList';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Inicializa a lista a partir do LocalStorage
  useEffect(() => {
    const loaded = getRegistrosFromStorage();
    setRegistros(loaded);
  }, []);

  const showToast = (texto: string, tipo: 'sucesso' | 'erro' | 'info' = 'sucesso') => {
    setToast({
      id: String(Date.now()),
      tipo,
      texto,
    });
  };

  // Adicionar novo registro
  const handleAddRegistro = (novo: Omit<Registro, 'id' | 'criadoEm'>) => {
    const registroCompleto: Registro = {
      ...novo,
      id: crypto.randomUUID ? crypto.randomUUID() : `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      criadoEm: new Date().toISOString(),
    };

    const updated = [registroCompleto, ...registros];
    setRegistros(updated);
    saveRegistrosToStorage(updated);
    showToast(`Registro de "${registroCompleto.nome}" salvo no LocalStorage com sucesso!`, 'sucesso');
  };

  // Excluir registro individual
  const handleDeleteRegistro = (id: string) => {
    const registroRemovido = registros.find((r) => r.id === id);
    const updated = registros.filter((r) => r.id !== id);
    setRegistros(updated);
    saveRegistrosToStorage(updated);
    showToast(
      registroRemovido ? `Registro de "${registroRemovido.nome}" removido.` : 'Registro removido com sucesso.',
      'info'
    );
  };

  // Limpar todos os registros
  const handleClearAll = () => {
    clearRegistrosStorage();
    setRegistros([]);
    showToast('Todos os registros foram removidos do LocalStorage.', 'info');
  };

  // Carregar exemplos de teste
  const handleLoadDemoData = () => {
    const demos: Registro[] = [
      {
        id: `demo-${Date.now()}-1`,
        nome: 'Mariana Silva',
        email: 'mariana.silva@exemplo.com.br',
        mensagem: 'Olá! Gostaria de receber mais informações sobre o processo de inscrição e os próximos módulos.',
        criadoEm: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: `demo-${Date.now()}-2`,
        nome: 'Carlos Eduardo Santos',
        email: 'carlos.santos@techmail.com',
        mensagem: 'Excelente iniciativa! Estou deixando registrado meu interesse em participar das próximas etapas.',
        criadoEm: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ];
    setRegistros(demos);
    saveRegistrosToStorage(demos);
    showToast('Dados de demonstração carregados com sucesso!', 'sucesso');
  };

  // Copiar texto para área de transferência
  const handleCopyText = async (texto: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(texto);
      } else {
        // Fallback para navegadores sem API Clipboard assíncrona
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
      <Header totalRegistros={registros.length} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Formulário com validações reativas */}
        <CadastroForm onAddRegistro={handleAddRegistro} />

        {/* Lista de Registros e Controles de Persistência */}
        <RegistrosList
          registros={registros}
          onDeleteRegistro={handleDeleteRegistro}
          onClearAll={handleClearAll}
          onLoadDemoData={handleLoadDemoData}
          onCopyText={handleCopyText}
        />
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Aplicação SPA com validação reativa e persistência via LocalStorage.
          </p>
          <p className="text-slate-400">
            Execução 100% no cliente (sem chamadas a backend ou APIs externas).
          </p>
        </div>
      </footer>

      {/* Componente Toast de Notificação */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
