import { Registro } from '../types';

const STORAGE_KEY = 'cadastro_app_registros_v1';

export const getRegistrosFromStorage = (): Registro[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Retorna uma lista com registros iniciais de demonstração amigáveis
      const demoData: Registro[] = [
        {
          id: 'demo-1',
          nome: 'Mariana Silva',
          email: 'mariana.silva@exemplo.com.br',
          mensagem: 'Olá! Gostaria de receber mais informações sobre o processo de inscrição e os próximos módulos.',
          criadoEm: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutos atrás
        },
        {
          id: 'demo-2',
          nome: 'Carlos Eduardo Santos',
          email: 'carlos.santos@techmail.com',
          mensagem: 'Excelente iniciativa! Estou deixando registrado meu interesse em participar das próximas etapas.',
          criadoEm: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 horas atrás
        },
      ];
      saveRegistrosToStorage(demoData);
      return demoData;
    }
    return JSON.parse(data) as Registro[];
  } catch (error) {
    console.error('Erro ao ler do LocalStorage:', error);
    return [];
  }
};

export const saveRegistrosToStorage = (registros: Registro[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
    return true;
  } catch (error) {
    console.error('Erro ao salvar no LocalStorage:', error);
    return false;
  }
};

export const clearRegistrosStorage = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao limpar LocalStorage:', error);
    return false;
  }
};
