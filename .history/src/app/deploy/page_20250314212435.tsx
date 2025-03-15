// src/app/deploy/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { FaServer, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

// Types et interfaces
interface Instance {
  path: string;
  name: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ServerConfig {
  ip: string;
  username: string;
  password?: string;
}

interface DeploymentStatus {
  isDeploying: boolean;
  success: boolean;
  error: string | null;
}

// Composant Terminal
const Terminal = ({ logs }: { logs: string[] }) => (
  <div className="p-6 bg-black text-green-400 rounded-lg font-mono overflow-auto max-h-96">
    <h2 className="text-xl font-semibold mb-4 text-white">Terminal</h2>
    {logs.map((log, index) => (
      <div key={index} className="mb-1 font-mono">
        <span className="text-gray-500">{`[${new Date().toLocaleTimeString()}]`}</span>{' '}
        {log}
      </div>
    ))}
  </div>
);

// Composant StatusBadge
const StatusBadge = ({ status, text }: { status: 'success' | 'error' | 'loading' | 'idle'; text: string }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'loading':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses()}`}>
      <span className="flex items-center gap-2">
        {status === 'loading' && <FaSpinner className="animate-spin" />}
        {status === 'success' && <FaCheck />}
        {status === 'error' && <FaTimes />}
        {text}
      </span>
    </span>
  );
};

export default function DeployPage() {
  // États pour le serveur source
  const [sourceIP, setSourceIP] = useState<string>('');
  const [sourceStatus, setSourceStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: false,
    error: null,
  });
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [isLoadingInstances, setIsLoadingInstances] = useState<boolean>(false);

  // États pour le serveur cible
  const [targetConfig, setTargetConfig] = useState<ServerConfig>({
    ip: '',
    username: 'root',
    password: '',
  });
  const [domain, setDomain] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // État pour le déploiement
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    isDeploying: false,
    success: false,
    error: null,
  });
  const [logs, setLogs] = useState<string[]>([]);

  // Validation des formulaires
  const isValidIP = (ip: string) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(ip);
  };

  const isValidDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Fonction pour se connecter au serveur source
  const connectToSourceServer = async () => {
    if (!isValidIP(sourceIP)) {
      setSourceStatus({ ...sourceStatus, error: 'Adresse IP invalide' });
      return;
    }

    setSourceStatus({ isConnected: false, isLoading: true, error: null });
    setLogs([...logs, `Tentative de connexion au serveur source ${sourceIP}...`]);

    try {
      const response = await fetch('/api/connectToSource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: sourceIP }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSourceStatus({ isConnected: true, isLoading: false, error: null });
        setLogs([...logs, `Connexion établie avec ${sourceIP}`]);
        fetchInstances();
      } else {
        setSourceStatus({ isConnected: false, isLoading: false, error: data.message });
        setLogs([...logs, `Erreur de connexion: ${data.message}`]);
      }
    } catch (error: any) {
      setSourceStatus({ isConnected: false, isLoading: false, error: error.message });
      setLogs([...logs, `Erreur: ${error.message}`]);
    }
  };

  // Fonction pour récupérer les instances
  const fetchInstances = async () => {
    setIsLoadingInstances(true);
    setLogs([...logs, 'Recherche des instances Strapi...']);

    try {
      const response = await fetch('/api/listInstances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: sourceIP }),
      });
      
      const data = await response.json();
      if (data.success) {
        setInstances(data.instances);
        setLogs([...logs, `${data.instances.length} instances trouvées`]);
      } else {
        setLogs([...logs, `Erreur: ${data.message}`]);
      }
    } catch (error: any) {
      setLogs([...logs, `Erreur: ${error.message}`]);
    } finally {
      setIsLoadingInstances(false);
    }
  };

  // Fonction pour démarrer le déploiement
  const startDeployment = async () => {
    if (!isValidIP(targetConfig.ip) || !targetConfig.password || !isValidDomain(domain) || !isValidEmail(email)) {
      setDeploymentStatus({
        isDeploying: false,
        success: false,
        error: 'Veuillez vérifier les informations saisies',
      });
      return;
    }

    setDeploymentStatus({ isDeploying: true, success: false, error: null });
    setLogs([...logs, 'Démarrage du déploiement...']);

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceServer: {
            ip: sourceIP,
            username: 'root',
          },
          targetIP: targetConfig.ip,
          targetPassword: targetConfig.password,
          installPath: '/root',
          domain,
          email,
          sourceInstancePath: selectedInstance,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setDeploymentStatus({ isDeploying: false, success: true, error: null });
        setLogs([...logs, ...data.logs, 'Déploiement terminé avec succès !']);
      } else {
        setDeploymentStatus({ isDeploying: false, success: false, error: data.message });
        setLogs([...logs, ...data.logs, `Erreur lors du déploiement: ${data.message}`]);
      }
    } catch (error: any) {
      setDeploymentStatus({ isDeploying: false, success: false, error: error.message });
      setLogs([...logs, `Erreur: ${error.message}`]);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Déploiement Strapi</h1>

        {/* Étape 1: Connexion au serveur source */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">1. Connexion au serveur source</h2>
            <StatusBadge
              status={
                sourceStatus.isLoading ? 'loading' :
                sourceStatus.isConnected ? 'success' :
                sourceStatus.error ? 'error' : 'idle'
              }
              text={
                sourceStatus.isLoading ? 'Connexion...' :
                sourceStatus.isConnected ? 'Connecté' :
                sourceStatus.error ? 'Erreur' : 'Non connecté'
              }
            />
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">IP du serveur source</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaServer className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={sourceIP}
                  onChange={(e) => setSourceIP(e.target.value)}
                  disabled={sourceStatus.isConnected || sourceStatus.isLoading}
                  className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: 163.172.140.154"
                />
              </div>
              {sourceStatus.error && (
                <p className="mt-1 text-sm text-red-600">{sourceStatus.error}</p>
              )}
            </div>
            <button
              onClick={connectToSourceServer}
              disabled={sourceStatus.isConnected || sourceStatus.isLoading || !sourceIP}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sourceStatus.isLoading && <FaSpinner className="animate-spin" />}
              {sourceStatus.isConnected ? 'Connecté' : 'Connecter'}
            </button>
          </div>
        </div>

        {/* Étape 2: Sélection de l'instance */}
        {sourceStatus.isConnected && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">2. Sélection de l'instance</h2>
              {isLoadingInstances && (
                <StatusBadge status="loading" text="Chargement des instances..." />
              )}
            </div>
            <select
              value={selectedInstance}
              onChange={(e) => setSelectedInstance(e.target.value)}
              disabled={isLoadingInstances}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionnez une instance</option>
              {instances.map((instance) => (
                <option key={instance.path} value={instance.path}>
                  {instance.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Étape 3: Configuration du serveur cible */}
        {selectedInstance && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">3. Configuration du serveur cible</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">IP du serveur cible</label>
                <input
                  type="text"
                  value={targetConfig.ip}
                  onChange={(e) => setTargetConfig({ ...targetConfig, ip: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: 192.168.1.10"
                />
                {!isValidIP(targetConfig.ip) && targetConfig.ip && (
                  <p className="mt-1 text-sm text-red-600">Adresse IP invalide</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={targetConfig.password}
                  onChange={(e) => setTargetConfig({ ...targetConfig, password: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Domaine</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: mon-site.com"
                />
                {!isValidDomain(domain) && domain && (
                  <p className="mt-1 text-sm text-red-600">Domaine invalide</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (pour SSL)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@example.com"
                />
                {!isValidEmail(email) && email && (
                  <p className="mt-1 text-sm text-red-600">Email invalide</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bouton de déploiement */}
        {selectedInstance && targetConfig.ip && targetConfig.password && domain && email && (
          <div className="mb-8">
            <button
              onClick={startDeployment}
              disabled={deploymentStatus.isDeploying}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deploymentStatus.isDeploying && <FaSpinner className="animate-spin" />}
              {deploymentStatus.isDeploying ? 'Déploiement en cours...' : 'Démarrer le déploiement'}
            </button>
            {deploymentStatus.error && (
              <p className="mt-2 text-sm text-red-600">{deploymentStatus.error}</p>
            )}
          </div>
        )}

        {/* Terminal avec logs */}
        {logs.length > 0 && <Terminal logs={logs} />}
      </div>
    </div>
  );
}