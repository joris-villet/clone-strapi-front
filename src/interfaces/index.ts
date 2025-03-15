export interface Instance {
  id: string;
  name: string;
  url: string;
  interval: number;
  status: string;
  statusHistory: string; // JSON stringified array
  color?: string; // Optionnel, pour la gestion des couleurs
  statusCode?: number;
  statusText?: string;
  date?: string;
}

export interface ErrorData {
  statusCode: number;
  statusText: string;
  url: string;
  date: string;
  status: string;
}

export interface IToast {
  title: string;
  description: string;
  status: 'success' | 'error' | 'info';
}