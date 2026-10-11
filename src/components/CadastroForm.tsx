import React, { useState } from 'react';
import { User, Mail, MessageSquare, Send, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { FormValues, FormTouched, Registro } from '../types';
import { validateField, validateAll } from '../utils/validation';

interface CadastroFormProps {
  onAddRegistro: (registro: Omit<Registro, 'id' | 'criadoEm'>) => void;
}

const INITIAL_VALUES: FormValues = {
  nome: '',
  email: '',
  mensagem: '',
};

const INITIAL_TOUCHED: FormTouched = {
  nome: false,
  email: false,
  mensagem: false,
};

export const CadastroForm: React.FC<CadastroFormProps> = ({ onAddRegistro }) => {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<FormTouched>(INITIAL_TOUCHED);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validação reativa contínua
  const errors = validateAll(values);
  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Marca todos os campos como tocados ao submeter
    setTouched({
      nome: true,
      email: true,
      mensagem: true,
    });

    const currentErrors = validateAll(values);
    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    // Pequena animação de feedback reativo
    setTimeout(() => {
      onAddRegistro({
        nome: values.nome.trim(),
        email: values.email.trim(),
        mensagem: values.mensagem.trim(),
      });

      // Limpa formulário após envio com sucesso
      setValues(INITIAL_VALUES);
      setTouched(INITIAL_TOUCHED);
      setIsSubmitting(false);
    }, 250);
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setTouched(INITIAL_TOUCHED);
  };

  // Helpers visuais de validação por campo
  const getFieldStatus = (fieldName: keyof FormValues) => {
    const isFieldTouched = touched[fieldName];
    const fieldError = validateField(fieldName, values[fieldName]);
    const hasValue = values[fieldName].trim().length > 0;

    if (!isFieldTouched && !hasValue) {
      return { isInvalid: false, isValid: false, error: undefined };
    }

    if (fieldError) {
      return { isInvalid: isFieldTouched, isValid: false, error: fieldError };
    }

    return { isInvalid: false, isValid: hasValue, error: undefined };
  };

  const nomeStatus = getFieldStatus('nome');
  const emailStatus = getFieldStatus('email');
  const mensagemStatus = getFieldStatus('mensagem');

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Novo Cadastro</span>
          <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
            Front-end SPA
          </span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Preencha os campos abaixo. A validação ocorre em tempo real e o envio salva imediatamente no LocalStorage.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Campo: Nome */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="nome" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              Nome Completo <span className="text-rose-500" title="Obrigatório">*</span>
            </label>
            {nomeStatus.isValid && (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Válido
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="nome"
              name="nome"
              type="text"
              value={values.nome}
              onChange={handleChange}
              onBlur={() => handleBlur('nome')}
              placeholder="Ex: Gabriela de Oliveira"
              aria-invalid={nomeStatus.isInvalid}
              aria-describedby={nomeStatus.isInvalid ? 'nome-error' : undefined}
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 text-sm text-slate-900 rounded-xl border transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                nomeStatus.isInvalid
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/30'
                  : nomeStatus.isValid
                  ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              {nomeStatus.isInvalid && <AlertCircle className="w-4 h-4 text-rose-500" />}
              {nomeStatus.isValid && <Check className="w-4 h-4 text-emerald-500" />}
            </div>
          </div>
          {nomeStatus.isInvalid && (
            <p id="nome-error" role="alert" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <span>{nomeStatus.error}</span>
            </p>
          )}
        </div>

        {/* Campo: E-mail */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              Endereço de E-mail <span className="text-rose-500" title="Obrigatório">*</span>
            </label>
            {emailStatus.isValid && (
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Válido
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              placeholder="Ex: gabriela@empresa.com"
              aria-invalid={emailStatus.isInvalid}
              aria-describedby={emailStatus.isInvalid ? 'email-error' : undefined}
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 text-sm text-slate-900 rounded-xl border transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                emailStatus.isInvalid
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/30'
                  : emailStatus.isValid
                  ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              {emailStatus.isInvalid && <AlertCircle className="w-4 h-4 text-rose-500" />}
              {emailStatus.isValid && <Check className="w-4 h-4 text-emerald-500" />}
            </div>
          </div>
          {emailStatus.isInvalid && (
            <p id="email-error" role="alert" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <span>{emailStatus.error}</span>
            </p>
          )}
        </div>

        {/* Campo: Mensagem */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="mensagem" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              Mensagem <span className="text-rose-500" title="Obrigatório">*</span>
            </label>
            <div className="flex items-center gap-2">
              {mensagemStatus.isValid && (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Válido
                </span>
              )}
              <span className={`text-[11px] font-mono ${values.mensagem.length > 500 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                {values.mensagem.length}/500
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <textarea
              id="mensagem"
              name="mensagem"
              rows={4}
              value={values.mensagem}
              onChange={handleChange}
              onBlur={() => handleBlur('mensagem')}
              placeholder="Digite aqui sua mensagem, comentário ou observação (mínimo de 10 caracteres)..."
              aria-invalid={mensagemStatus.isInvalid}
              aria-describedby={mensagemStatus.isInvalid ? 'mensagem-error' : undefined}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/50 text-sm text-slate-900 rounded-xl border transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-y min-h-[96px] ${
                mensagemStatus.isInvalid
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/30'
                  : mensagemStatus.isValid
                  ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
          </div>
          {mensagemStatus.isInvalid && (
            <p id="mensagem-error" role="alert" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <span>{mensagemStatus.error}</span>
            </p>
          )}
        </div>

        {/* Barra de Ações: Enviar e Limpar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 order-2 sm:order-1 text-center sm:text-left">
            {!isFormValid && (touched.nome || touched.email || touched.mensagem) && (
              <span className="text-amber-600 font-medium">
                Corrija os campos destacados para habilitar o envio.
              </span>
            )}
            {isFormValid && values.nome && values.email && values.mensagem && (
              <span className="text-emerald-600 font-medium flex items-center gap-1 justify-center sm:justify-start">
                <Check className="w-3.5 h-3.5" /> Pronto para enviar
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            {(values.nome || values.email || values.mensagem) && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`flex-1 sm:flex-initial px-6 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                isFormValid && !isSubmitting
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Salvando...' : 'Enviar Cadastro'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
