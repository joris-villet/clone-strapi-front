'use client'

import { useState, useRef } from 'react'
import { FaServer, FaGlobe, FaEnvelope, FaFolder, FaArrowLeft, FaArrowRight, 
         FaRocket, FaDatabase, FaCheckCircle, FaExclamationTriangle, 
         FaInfoCircle, FaLock, FaCopy, FaTerminal, FaSync, FaWifi } from 'react-icons/fa'
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline'

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
)

const DatabaseForm = ({ formData, setFormData }: { 
  formData: FormData; 
  setFormData: (data: FormData) => void;
}) => {
  if (formData.databaseType === 'sqlite') return null;
  
  const fields = [
    { name: 'host', label: 'Hôte', placeholder: 'localhost' },
    { name: 'port', label: 'Port', placeholder: formData.databaseType === 'mysql' ? '3306' : '5432' },
    { name: 'username', label: "Nom d'utilisateur", placeholder: 'root' },
    { name: 'password', label: 'Mot de passe', placeholder: '********', type: 'password' },
    { name: 'database', label: 'Nom de la base de données', placeholder: 'strapi' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map(field => (
        <div key={field.name} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{field.label}</label>
          <input
            type={field.type || 'text'}
            placeholder={field.placeholder}
            value={formData.databaseConfig[field.name as keyof typeof formData.databaseConfig]}
            onChange={(e) =>
              setFormData({
                ...formData,
                databaseConfig: { ...formData.databaseConfig, [field.name]: e.target.value },
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      ))}
    </div>
  );
};

const TerminalDisplay = ({ logs, isLoading }: { logs: string[]; isLoading: boolean }) => (
  <div className="bg-gray-900 text-green-300 p-4 rounded-md h-[400px] overflow-y-auto font-mono text-sm">
    {logs.map((log, index) => {
      const isCommand = log.startsWith('Command:')
      const isError = log.includes('Error:')
      const isOutput = log.includes('Output:')
      const isInfo = log.startsWith('Info:')
      const isWarning = log.startsWith('Warning:')
      
      return (
        <p
          key={index}
          className={`mb-1 ${
            isError ? 'text-red-300' :
            isCommand ? 'text-yellow-300' :
            isOutput ? 'text-green-300' :
            isWarning ? 'text-orange-300' :
            isInfo ? 'text-blue-300' :
            'text-gray-300'
          }`}
        >
          {log}
        </p>
      );
    })}
    {isLoading && (
      <div className="flex items-center gap-2 mt-2">
        <div className="animate-spin h-4 w-4 border-2 border-green-300 rounded-full border-t-transparent" />
        <span className="text-green-300">Exécution en cours...</span>
      </div>
    )}
  </div>
);
const DeploymentSuccess = ({ domain, onReset }: { domain: string; onReset: () => void }) => (
  <div className="flex flex-col items-center gap-6 p-6">
    <FaCheckCircle className="w-16 h-16 text-green-500" />
    <h2 className="text-lg font-bold text-center">Déploiement réussi !</h2>
    <p className="text-center">
      Votre instance Strapi est maintenant accessible sur <span className="font-semibold">{domain}</span>
    </p>
    <div className="flex flex-wrap justify-center gap-4">
      <a
        href={`https://${domain}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600"
      >
        <FaGlobe />
        Visiter le site
      </a>
      <a
        href={`https://${domain}/admin`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-teal-500 text-white rounded-md flex items-center gap-2 hover:bg-teal-600"
      >
        <FaLock />
        Accéder à l'admin
      </a>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md flex items-center gap-2 hover:bg-gray-400"
      >
        <FaSync />
        Nouveau déploiement
      </button>
    </div>
  </div>
);

export default function Page() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [sourceServerConnected, setSourceServerConnected] = useState(false);
  const [targetServerConnected, setTargetServerConnected] = useState(false);
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [showTargetPassword, setShowTargetPassword] = useState(false);
  const toggleShowTargetPassword = () => setShowTargetPassword(!showTargetPassword);

  const [sourceIP, setSourceIP] = useState('163.172.140.154');
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

  const validateIP = (ip: string) =>
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
  const validateDomain = (domain: string) =>
    /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/.test(domain);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePath = (path: string) => path.startsWith('/');

  const showNotification = ({ title, description, status }: { title: string; description: string; status: string }) => {
    alert(`${title}: ${description}`);
  };

  const connectToSourceServer = async () => {
    setConnectionInProgress(true);
    setIsLoading(true);
    setTerminalLogs([]);
    try {
      setTerminalLogs((prev) => [...prev, `Command: Connecting to source server ${SOURCE_SERVER.ip}...`]);
      const response = await fetch('/api/connectToSource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: SOURCE_SERVER.ip,
          username: SOURCE_SERVER.username,
          privateKeyPath: 'C:/Users/jcmei/.ssh/id_ed25519',
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la connexion');
      }
      const data = await response.json();
      data.logs.forEach((log: string) => setTerminalLogs((prev) => [...prev, log]));
      setSourceServerConnected(true);
      showNotification({
        title: 'Connexion réussie',
        description: `Connecté au serveur source ${SOURCE_SERVER.ip}`,
        status: 'success',
      });
      await fetchInstances();
    } catch (error: any) {
      console.error('Error:', error);
      setTerminalLogs((prev) => [...prev, `Error: ${error.message}`]);
      showNotification({
        title: 'Erreur de connexion',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
      setConnectionInProgress(false);
    }
  };

  const fetchInstances = async () => {
    try {
      const res = await fetch('/api/listInstances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: SOURCE_SERVER.ip,
          username: SOURCE_SERVER.username,
          privateKeyPath: 'C:/Users/jcmei/.ssh/id_ed25519',
          passphrase: 'Oskarek',
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des instances');
      }
      const data = await res.json();
      setInstances(data.instances);
    } catch (error) {
      console.error('Error fetching instances:', error);
      showNotification({
        title: 'Erreur',
        description: 'Impossible de récupérer la liste des instances',
        status: 'error',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      sourceInstance: '',
      targetIP: '91.108.113.59',
      targetPassword: 'Oskarek1973#',
      domain: 'fabien.strapi-pro.com',
      email: 'jc.meilland@idboats.com',
      installPath: '/root/',
      databaseType: 'sqlite',
      databaseConfig: { host: '', port: '', username: '', password: '', database: '' },
    });
    setStep(1);
    setDeploymentSuccess(false);
    setTerminalLogs([]);
    setTargetServerConnected(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto">
        {!deploymentSuccess ? (
          <>
            <StepperHeader step={step} steps={STEPS} />
            <div className="bg-white shadow-md rounded-lg p-6">
              {/* Render steps here */}
            </div>
          </>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <DeploymentSuccess domain={formData.domain} onReset={resetForm} />
          </div>
        )}
      </div>
    </div>
  );
}