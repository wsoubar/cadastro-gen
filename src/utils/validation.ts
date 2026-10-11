import { FormValues, FormErrors } from '../types';

export const validateField = (name: keyof FormValues, value: string): string | undefined => {
  const trimmed = value.trim();

  switch (name) {
    case 'nome':
      if (!trimmed) {
        return 'O nome completo é obrigatório.';
      }
      if (trimmed.length < 3) {
        return 'O nome deve ter no mínimo 3 caracteres.';
      }
      if (trimmed.length > 80) {
        return 'O nome não pode ultrapassar 80 caracteres.';
      }
      return undefined;

    case 'email':
      if (!trimmed) {
        return 'O e-mail é obrigatório.';
      }
      // Expressão regular padrão para validação de formato de e-mail
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(trimmed)) {
        return 'Informe um endereço de e-mail válido (ex: usuario@dominio.com).';
      }
      return undefined;

    case 'mensagem':
      if (!trimmed) {
        return 'A mensagem é obrigatória.';
      }
      if (trimmed.length < 10) {
        return `A mensagem deve ter pelo menos 10 caracteres (atual: ${trimmed.length}).`;
      }
      if (trimmed.length > 500) {
        return 'A mensagem não pode ultrapassar 500 caracteres.';
      }
      return undefined;

    default:
      return undefined;
  }
};

export const validateAll = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};
  const nomeError = validateField('nome', values.nome);
  const emailError = validateField('email', values.email);
  const mensagemError = validateField('mensagem', values.mensagem);

  if (nomeError) errors.nome = nomeError;
  if (emailError) errors.email = emailError;
  if (mensagemError) errors.mensagem = mensagemError;

  return errors;
};
