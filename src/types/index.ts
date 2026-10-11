export interface Registro {
  id: string;
  nome: string;
  email: string;
  mensagem: string;
  criadoEm: string; // ISO string
}

export interface FormValues {
  nome: string;
  email: string;
  mensagem: string;
}

export interface FormErrors {
  nome?: string;
  email?: string;
  mensagem?: string;
}

export interface FormTouched {
  nome: boolean;
  email: boolean;
  mensagem: boolean;
}
