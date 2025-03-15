// app/types/index.ts

// Types de base
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
  
  // Types pour les configurations serveur
  export interface SourceServer {
    ip: string;
    username: string;
    privateKeyPath: string;
    passphrase?: string;
  }
  
  export interface TargetServer {
    ip: string;
    password: string;
  }
  
  // Types pour les étapes
  export interface StepProps {
    setStep: (step: number) => void;
  }
  
  export interface ConnectionStepProps extends StepProps {
    sourceIP: string;
    setSourceIP: (ip: string) => void;
    sourceServerConnected: boolean;
    connectionInProgress: boolean;
    connectToSourceServer: () => Promise<void>;
    setIsTerminalOpen: (isOpen: boolean) => void;
    SOURCE_SERVER: SourceServer;
  }
  
  export interface InstanceSelectionStepProps extends StepProps {
    instances: Instance[];
    formData: FormData;
    setFormData: (data: FormData) => void;
  }
  
  export interface ServerConfigStepProps extends StepProps {
    formData: FormData;
    setFormData: (data: FormData) => void;
    showTargetPassword: boolean;
    setShowTargetPassword: (show: boolean) => void;
    validateIP: (ip: string) => boolean;
    validateDomain: (domain: string) => boolean;
    validateEmail: (email: string) => boolean;
  }
  
  export interface VerificationStepProps extends StepProps {
    formData: FormData;
    deploy: () => Promise<void>;
    isLoading: boolean;
  }
  
  // Types pour les composants réutilisables
  export interface StepperHeaderProps {
    step: number;
    steps: string[];
  }
  
  export interface TerminalDisplayProps {
    logs: string[];
    isLoading: boolean;
  }
  
  // Types pour les réponses API
  export interface ApiResponse {
    success: boolean;
    message?: string;
    logs?: string[];
  }
  
  export interface ConnectResponse extends ApiResponse {
    connected: boolean;
  }
  
  export interface InstancesResponse extends ApiResponse {
    instances: Instance[];
  }
  
  export interface DeploymentResponse extends ApiResponse {
    deploymentId?: string;
    url?: string;
  }
  
  // Types pour la validation
  export interface ValidationResult {
    isValid: boolean;
    message?: string;
  }
  
  // Types pour le déploiement
  export interface DeploymentConfig {
    sourceServer: SourceServer;
    targetServer: TargetServer;
    domain: string;
    email: string;
    installPath: string;
    sourceInstancePath: string;
  }
  
  // Types pour le statut
  export interface ConnectionStatus {
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface DeploymentStatus {
    isDeploying: boolean;
    success: boolean;
    error: string | null;
  }