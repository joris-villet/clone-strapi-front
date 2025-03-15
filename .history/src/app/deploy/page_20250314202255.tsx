'use client'

import { useState, useRef } from 'react'
import { 
  FaServer, 
  FaGlobe, 
  FaEnvelope, 
  FaFolder, 
  FaArrowLeft, 
  FaArrowRight, 
  FaRocket, 
  FaDatabase, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaLock, 
  FaCopy, 
  FaTerminal, 
  FaSync, 
  FaWifi,
  FaEye,
  FaEyeSlash 
} from 'react-icons/fa'

// Types et Interfaces
interface FormData {
  sourceInstance: string;
  targetIP: string;
  targetPassword: string;
  domain: string;
  email: string;
  installPath: string;
  databaseType: 'sqlite' | 'mysql' | 'postgres';
  databaseConfig: {
    host: string;
    port: string;
    username: string;
    password: string;
    database: string;
  };
}

interface Instance {
  id: string;
  name: string;
  path: string;
}

// Composant StepperHeader
const StepperHeader = ({ step, steps }: { step: number; steps: string[] }) => (
  <div className="mb-8">
    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
      />
    </div>
    <div className="flex flex-wrap justify-center gap-4">
      {steps.map((label, index) => (
        <span
          key={label}
          className={`px-4 py-2 rounded-full text-sm font-medium
            ${step >= index 
              ? 'bg-blue-500 text-white' 
              : 'bg-transparent border border-gray-300 text-gray-700'}`}
        >
          {label}
        </span>
      ))}
    </div>
  </div>
);

// Composant TerminalDisplay
const TerminalDisplay = ({ logs, isLoading }: { logs: string[], isLoading: boolean }) => (
  <div className="bg-gray-900 text-gray-100 font-mono p-4 rounded-md h-96 overflow-auto">
    {logs.map((log, index) => (
      <div key={index} className="py-1">
        {log}
      </div>
    ))}
    {isLoading && (
      <div className="flex items-center gap-2 text-blue-400">
        <div className="animate-spin h-4 w-4 border-2 border-blue-400 rounded-full border-t-transparent" />
        Exécution en cours...
      </div>
    )}
  </div>
);

// Composant principal
export default function Page() {
  // États
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [sourceServerConnected, setSourceServerConnected] = useState(false);
  const [targetServerConnected, setTargetServerConnected] = useState(false);
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showTargetPassword, setShowTargetPassword] = useState(false);
  const [sourceIP, setSourceIP] = useState('163.172.140.154');
  
  const cancelRef = useRef<HTMLButtonElement>(null);
  const SOURCE_SERVER = { ip: sourceIP, username: 'root' };
  const STEPS = ['Connexion', 'Instance', 'Serveur', 'Configuration', 'Vérification'];

  const [formData, setFormData] = useState<FormData>({
    sourceInstance: '',
    targetIP: '91.108.113.59',
    targetPassword: 'Oskarek1973#',
    domain: 'fabien.strapi-pro.com',
    email: 'jc.meilland@idboats.com',
    installPath: '/root/',
    databaseType: 'sqlite',
    databaseConfig: { host: '', port: '', username: '', password: '', database: '' },
  });

  // Fonctions de validation
  const validateIP = (ip: string) =>
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
  const validateDomain = (domain: string) =>
    /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/.test(domain);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePath = (path: string) => path.startsWith('/');

  // Fonction utilitaire pour les notifications
  const showNotification = ({ title, description, status }: { 
    title: string; 
    description: string; 
    status: 'success' | 'error' | 'warning' | 'info' 
  }) => {
    alert(`${status.toUpperCase()}: ${title}\n${description}`);
  };