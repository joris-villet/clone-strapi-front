// src/app/deploy/page.tsx

'use client';

import { useState } from 'react';
import { FaServer } from 'react-icons/fa';

interface Instance {
  path: string;
  name: string;
}

export default function DeployPage() {
  // États pour le serveur source
  const [sourceIP, setSourceIP] = useState<string>('');
  const [sourceServerConnected, setSourceServerConnected] = useState<boolean>(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  
  // États pour le serveur cible
  const [targetIP, setTargetIP] = useState<string>('');
  const [targetPassword, setTargetPassword] = useState<string>('');
  const [domain, setDomain] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  
  // État pour les logs
  const [logs, setLogs] = useState<string[]>([]);
  
  // Fonction pour se connecter au serveur source
  const connectToSourceServer = async () => {
    try {
      const response = await fetch('/api/connectToSource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: sourceIP }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSourceServerConnected(true);
        // Lister les instances après la connexion
        fetchInstances();
      } else {
        alert('Erreur de connexion: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion au serveur source');
    }
  };

  // Fonction pour récupérer les instances
  const fetchInstances = async () => {
    try {
      const response = await fetch('/api/listInstances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: sourceIP }),
      });
      
      const data = await response.json();
      if (data.success) {
        setInstances(data.instances);
      } else {
        alert('Erreur lors de la récupération des instances: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la récupération des instances');
    }
  };

  // Fonction pour démarrer le déploiement
  const startDeployment = async () => {
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceServer: {
            ip: sourceIP,
            username: 'root'
          },
          targetIP,
          targetPassword,
          installPath: '/root',
          domain,
          email,
          sourceInstancePath: selectedInstance
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
        alert('Déploiement réussi !');
      } else {
        setLogs(data.logs);
        alert('Erreur lors du déploiement: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du déploiement');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Déploiement Strapi</h1>

        {/* Étape 1: Connexion au serveur source */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">1. Connexion au serveur source</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">IP du serveur source</label>
              <input
                type="text"
                value={sourceIP}
                onChange={(e) => setSourceIP(e.target.value)}
                disabled={sourceServerConnected}
                className="w-full p-2 border rounded"
                placeholder="ex: 163.172.140.154"
              />
            </div>
            <button
              onClick={connectToSourceServer}
              disabled={sourceServerConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Connecter
            </button>
          </div>
        </div>

        {/* Étape 2: Sélection de l'instance */}
        {sourceServerConnected && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">2. Sélection de l'instance</h2>
            <select
              value={selectedInstance}
              onChange={(e) => setSelectedInstance(e.target.value)}
              className="w-full p-2 border rounded"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">IP du serveur cible</label>
                <input
                  type="text"
                  value={targetIP}
                  onChange={(e) => setTargetIP(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="ex: 192.168.1.10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={targetPassword}
                  onChange={(e) => setTargetPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Domaine</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="ex: mon-site.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (pour SSL)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bouton de déploiement */}
        {selectedInstance && targetIP && targetPassword && domain && email && (
          <div className="mb-8">
            <button
              onClick={startDeployment}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Démarrer le déploiement
            </button>
          </div>
        )}

        {/* Logs de déploiement */}
        {logs.length > 0 && (
          <div className="p-6 bg-black text-green-400 rounded-lg font-mono">
            <h2 className="text-xl font-semibold mb-4 text-white">Logs de déploiement</h2>
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}