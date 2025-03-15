// app/types/index.ts
export interface FormData {
    sourceInstance: string;
    targetIP: string;
    targetPassword: string;
    domain: string;
    email: string;
    installPath: string;
  }
  
  export interface Instance {
    id: string;
    name: string;
    path: string;
  }
  
  export interface NotificationProps {
    title: string;
    description: string;
    status: 'success' | 'error' | 'warning' | 'info';
  }