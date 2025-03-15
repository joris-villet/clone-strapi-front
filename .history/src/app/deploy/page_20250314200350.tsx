'use client';

import { useState, useRef } from 'react';
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
} from 'react-icons/fa';

const StepperHeader = ({ step, steps }: { step: number; steps: string[] }) => (
  <div className="mb-8">
    <div className="relative w-full h-2 bg-gray-200 rounded-full mb-4">
      <div
        className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full"
        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
      ></div>
    </div>
    <div className="flex justify-center flex-wrap gap-4">
      {steps.map((label, index) => (
        <span
          key={label}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            step >= index ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  </div>
);

const DatabaseForm = ({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
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
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label className="text-sm font-medium mb-1">{field.label}</label>
          <input
            type={field.type || 'text'}
            placeholder={field.placeholder}
            value={formData.databaseConfig[field.name]}
            onChange={(e) =>
              setFormData({
                ...formData,
                databaseConfig: { ...formData.databaseConfig, [field.name]: e.target.value },
              })
            }
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );
};

const TerminalDisplay = ({ logs, isLoading }: { logs: string[]; isLoading: boolean }) => (
  <div className="bg-gray-900 text-green-300 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
    {logs.map((log, index) => {
      const isCommand = log.startsWith('Command:');
      const isError = log.includes('Error:');
      const isOutput = log.includes('Output:');
      const isInfo = log.startsWith('Info:');
      const isWarning = log.startsWith('Warning:');
      return (
        <p
          key={index}
          className={`mb-1 ${
            isError
              ? 'text-red-300'
              : isCommand
              ? 'text-yellow-300'
              : isOutput
              ? 'text-green-300'
              : isWarning
              ? 'text-orange-300'
              : isInfo
              ? 'text-blue-300'
              : 'text-gray-300'
          }`}
        >
          {log}
        </p>
      );
    })}
    {isLoading && (
      <div className="flex items-center gap-2 mt-2">
        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-green-300 rounded-full"></div>
        <p className="text-green-300">Exécution en cours...</p>
      </div>
    )}
  </div>
);

const DeploymentSuccess = ({ domain, onReset }: { domain: string; onReset: () => void }) => (
  <div className="flex flex-col items-center gap-6 p-6">
    <FaCheckCircle className="w-16 h-16 text-green-500" />
    <h2 className="text-lg font-bold text-center">Déploiement réussi !</h2>
    <p className="text-center">Votre instance Strapi est maintenant accessible sur {domain}</p>
    <div className="flex flex-wrap justify-center gap-4">
      <a
        href={`https://${domain}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Visiter le site
      </a>
      <a
        href={`https://${domain}/admin`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
      >
        Accéder à l'admin
      </a>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
      >
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

  const STEPS = ['Connexion', 'Instance', 'Serveur', 'Configuration', 'Vérification'];

  const resetForm = () => {
    setStep(0);
    setDeploymentSuccess(false);
    setTerminalLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto">
        {!deploymentSuccess ? (
          <>
            <StepperHeader step={step} steps={STEPS} />
            <div className="shadow-md rounded-md p-6">
              {step === 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Connexion au serveur source</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Adresse IP du serveur source</label>
                      <input
                        type="text"
                        placeholder="Ex: 192.168.1.1"
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              {/* Ajoutez ici les autres étapes */}
            </div>
          </>
        ) : (
          <div className="shadow-md rounded-md p-6">
            <DeploymentSuccess domain="example.com" onReset={resetForm} />
          </div>
        )}
      </div>
    </div>
  );
}