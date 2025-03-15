'use client';

import { useState } from 'react';
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
  FaTerminal,
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
  const [sourceServerConnected, setSourceServerConnected] = useState(false);
  const [targetServerConnected, setTargetServerConnected] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);

  const [formData, setFormData] = useState({
    sourceIP: '',
    targetIP: '',
    targetPassword: '',
    domain: '',
    email: '',
    installPath: '/root/',
    databaseType: 'sqlite',
    databaseConfig: { host: '', port: '', username: '', password: '', database: '' },
  });

  const STEPS = ['Connexion', 'Instance', 'Serveur', 'Configuration', 'Vérification'];

  const validateIP = (ip: string) =>
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);

  const validateDomain = (domain: string) =>
    /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/.test(domain);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const connectToSourceServer = async () => {
    setIsLoading(true);
    try {
      // Simulate connection to source server
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSourceServerConnected(true);
    } catch (error) {
      console.error('Error connecting to source server:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToTargetServer = async () => {
    setIsLoading(true);
    try {
      // Simulate connection to target server
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTargetServerConnected(true);
    } catch (error) {
      console.error('Error connecting to target server:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployment = async () => {
    setIsLoading(true);
    try {
      // Simulate deployment process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setDeploymentSuccess(true);
    } catch (error) {
      console.error('Error during deployment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setDeploymentSuccess(false);
    setSourceServerConnected(false);
    setTargetServerConnected(false);
    setFormData({
      sourceIP: '',
      targetIP: '',
      targetPassword: '',
      domain: '',
      email: '',
      installPath: '/root/',
      databaseType: 'sqlite',
      databaseConfig: { host: '', port: '', username: '', password: '', database: '' },
    });
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
                        value={formData.sourceIP}
                        onChange={(e) => setFormData({ ...formData, sourceIP: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={connectToSourceServer}
                      className={`px-4 py-2 rounded-md ${
                        sourceServerConnected ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      disabled={isLoading}
                    >
                      {sourceServerConnected ? 'Connecté' : 'Se connecter'}
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Connexion au serveur cible</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Adresse IP du serveur cible</label>
                      <input
                        type="text"
                        placeholder="Ex: 192.168.1.2"
                        value={formData.targetIP}
                        onChange={(e) => setFormData({ ...formData, targetIP: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={connectToTargetServer}
                      className={`px-4 py-2 rounded-md ${
                        targetServerConnected ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      disabled={isLoading}
                    >
                      {targetServerConnected ? 'Connecté' : 'Se connecter'}
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Configuration du domaine</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom de domaine</label>
                      <input
                        type="text"
                        placeholder="Ex: example.com"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Vérification des informations</h2>
                  <div className="flex flex-col gap-4">
                    <p>Adresse IP source : {formData.sourceIP}</p>
                    <p>Adresse IP cible : {formData.targetIP}</p>
                    <p>Nom de domaine : {formData.domain}</p>
                    <button
                      onClick={handleDeployment}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Déployer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="shadow-md rounded-md p-6">
            <DeploymentSuccess domain={formData.domain} onReset={resetForm} />
          </div>
        )}
      </div>
    </div>
  );
}