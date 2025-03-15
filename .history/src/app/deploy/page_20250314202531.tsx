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
  // Fonction de connexion au serveur source
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

  // Fonction pour récupérer les instances
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

  // Réinitialiser le formulaire
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
    setStep(0);
    setDeploymentSuccess(false);
    setTerminalLogs([]);
    setTargetServerConnected(false);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        <StepperHeader step={step} steps={STEPS} />
        <div className="shadow-md rounded-lg p-6">
          {/* Step 0: Connexion */}
          {step === 0 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold text-blue-600">Connexion au serveur source</h3>
              
              {/* Formulaire IP source */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Adresse IP du serveur source
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaServer className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="163.172.140.154"
                    value={sourceIP}
                    onChange={(e) => setSourceIP(e.target.value)}
                    disabled={sourceServerConnected}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  L'adresse IP du serveur contenant les instances Strapi
                </p>
              </div>

              {/* Carte d'état de connexion */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-bold">Serveur source</span>
                      <span>{SOURCE_SERVER.ip}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${sourceServerConnected 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'}`}
                    >
                      {sourceServerConnected ? 'Connecté' : 'Non connecté'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ce serveur contient les instances Strapi à utiliser comme source.
                  </p>
                  {sourceServerConnected ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => setIsTerminalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <FaTerminal />
                        Voir les logs
                      </button>
                      <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Continuer
                        <FaArrowRight />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={connectToSourceServer}
                      disabled={connectionInProgress}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                    >
                      <FaWifi />
                      {connectionInProgress ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                          Connexion en cours...
                        </>
                      ) : (
                        'Se connecter au serveur'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Message d'information */}
              {!sourceServerConnected && (
                <div className="flex gap-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
                  <FaInfoCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                  <p className="text-sm">
                    Vous devez d'abord vous connecter au serveur source pour récupérer les instances.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Sélection de l'instance */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold text-blue-600">Sélection de l'instance source</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instances.map((instance) => (
                  <div
                    key={instance.id}
                    onClick={() => setFormData({ ...formData, sourceInstance: instance.path })}
                    className={`p-4 border rounded-lg cursor-pointer transition-all
                      ${formData.sourceInstance === instance.path 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <FaFolder className={`h-6 w-6 ${formData.sourceInstance === instance.path ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div>
                        <h4 className="font-medium">{instance.name}</h4>
                        <p className="text-sm text-gray-500">{instance.path}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <FaArrowLeft />
                  Retour
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.sourceInstance}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  Continuer
                  <FaArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Configuration du serveur cible */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold text-blue-600">Configuration du serveur cible</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IP du serveur cible */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Adresse IP du serveur cible
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaServer className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.targetIP}
                      onChange={(e) => setFormData({ ...formData, targetIP: e.target.value })}
                      placeholder="91.108.113.59"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    L'adresse IP du serveur où sera déployée l'instance
                  </p>
                </div>

                {/* Mot de passe du serveur cible */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Mot de passe root
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showTargetPassword ? "text" : "password"}
                      value={formData.targetPassword}
                      onChange={(e) => setFormData({ ...formData, targetPassword: e.target.value })}
                      className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTargetPassword(!showTargetPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showTargetPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FaEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Le mot de passe root du serveur cible
                  </p>
                </div>

                {/* Nom de domaine */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Nom de domaine
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaGlobe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="example.strapi-pro.com"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Le nom de domaine pour accéder à l'instance
                  </p>
                </div>

                {/* Email administrateur */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Email administrateur
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@example.com"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    L'email de l'administrateur de l'instance
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <FaArrowLeft />
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!validateIP(formData.targetIP) || !validateDomain(formData.domain) || !validateEmail(formData.email)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  Continuer
                  <FaArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Configuration de la base de données */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold text-blue-600">Configuration de la base de données</h3>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Type de base de données</label>
                  <select
                    value={formData.databaseType}
                    onChange={(e) => setFormData({ ...formData, databaseType: e.target.value as 'sqlite' | 'mysql' | 'postgres' })}
                    className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="sqlite">SQLite</option>
                    <option value="mysql">MySQL</option>
                    <option value="postgres">PostgreSQL</option>
                  </select>
                  <p className="text-sm text-gray-500">Sélectionnez le type de base de données à utiliser.</p>
                </div>

                {/* Configuration de la base de données */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Configuration de la base de données</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Hôte</label>
                      <input
                        type="text"
                        value={formData.databaseConfig.host}
                        onChange={(e) => setFormData({ ...formData, databaseConfig: { ...formData.databaseConfig, host: e.target.value } })}
                        className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Port</label>
                      <input
                        type="text"
                        value={formData.databaseConfig.port}
                        onChange={(e) => setFormData({ ...formData, databaseConfig: { ...formData.databaseConfig, port: e.target.value } })}
                        className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                      <input
                        type="text"
                        value={formData.databaseConfig.username}
                        onChange={(e) => setFormData({ ...formData, databaseConfig: { ...formData.databaseConfig, username: e.target.value } })}
                        className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                      <input
                        type="password"
                        value={formData.databaseConfig.password}
                        onChange={(e) => setFormData({ ...formData, databaseConfig: { ...formData.databaseConfig, password: e.target.value } })}
                        className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Nom de la base de données</label>
                      <input
                        type="text"
                        value={formData.databaseConfig.database}
                        onChange={(e) => setFormData({ ...formData, databaseConfig: { ...formData.databaseConfig, database: e.target.value } })}
                        className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <FaArrowLeft />
                  Retour
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!validatePath(formData.databaseConfig.database)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  Continuer
                  <FaArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Vérification et déploiement */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold text-blue-600">Vérification et déploiement</h3>

              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-600">
                  Vérifiez les informations suivantes avant de procéder au déploiement :
                </p>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold">Informations de déploiement</h4>
                  <p><strong>Instance source :</strong> {formData.sourceInstance}</p>
                  <p><strong>IP du serveur cible :</strong> {formData.targetIP}</p>
                  <p><strong>Nom de domaine :</strong> {formData.domain}</p>
                  <p><strong>Email administrateur :</strong> {formData.email}</p>
                  <p><strong>Type de base de données :</strong> {formData.databaseType}</p>
                  <p><strong>Hôte :</strong> {formData.databaseConfig.host}</p>
                  <p><strong>Nom de la base de données :</strong> {formData.databaseConfig.database}</p>
                </div>
              </div>

              {/* Boutons de déploiement */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <FaArrowLeft />
                  Retour
                </button>
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const response = await fetch('/api/deploy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData),
                      });
                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Erreur lors du déploiement');
                      }
                      const data = await response.json();
                      setTerminalLogs(data.logs);
                      setDeploymentSuccess(true);
                      showNotification({
                        title: 'Déploiement réussi',
                        description: 'L\'instance a été déployée avec succès.',
                        status: 'success',
                      });
                    } catch (error) {
                      console.error('Error during deployment:', error);
                      showNotification({
                        title: 'Erreur de déploiement',
                        description: error.message,
                        status: 'error',
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Déployer
                  <FaRocket />
                </button>
              </div>
            </div>
          )}

          {/* Modal Terminal */}
          {isTerminalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-4xl mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <FaTerminal className="h-5 w-5" />
                    <h3 className="text-lg font-medium">Terminal de déploiement</h3>
                  </div>
                  <button
                    onClick={() => setIsTerminalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Fermer</span>
                    ×
                  </button>
                </div>
                <div className="p-4">
                  <TerminalDisplay logs={terminalLogs} isLoading={isLoading} />
                </div>
                <div className="flex justify-end gap-3 p-4 border-t">
                  <button
                    onClick={() => setIsTerminalOpen(false)}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(terminalLogs.join('\n'));
                      showNotification({
                        title: 'Copié !',
                        description: 'Les logs ont été copiés dans le presse-papier',
                        status: 'success',
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
                  >
                    <FaCopy />
                    Copier les logs
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}