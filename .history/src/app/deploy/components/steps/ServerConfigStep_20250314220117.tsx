// app/deploy/components/steps/ServerConfigStep.tsx
"use client";
import React, { useState } from 'react';
import { FaServer } from 'react-icons/fa';
import { FormData } from '@/app/types';

interface ServerConfigStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  showTargetPassword: boolean;
  setShowTargetPassword: (show: boolean) => void;
  validateIP: (ip: string) => boolean;
  validateDomain: (domain: string) => boolean;
  validateEmail: (email: string) => boolean;
  setStep: (step: number) => void;
}

interface ConnectionStatus {
  sshConnection: boolean;
  rootAccess: boolean;
  diskSpace: string;
  systemInfo: string;
}

function ServerConfigStep({
  formData,
  setFormData,
  showTargetPassword,
  setShowTargetPassword,
  validateIP,
  validateDomain,
  validateEmail,
  setStep,
}: ServerConfigStepProps) {
  const [targetConnectionInProgress, setTargetConnectionInProgress] = useState(false);
  const [targetServerConnected, setTargetServerConnected] = useState(false);
  const [targetConnectionStatus, setTargetConnectionStatus] = useState<ConnectionStatus | null>(null);

  const formatDiskSpace = (diskSpace: string) => {
    const lines = diskSpace.split('\n');
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded-md font-mono text-xs overflow-x-auto">
        <table className="min-w-full">
          <tbody>
            {lines.map((line, index) => {
              const cells = line.split(/\s+/).filter(Boolean);
              return (
                <tr key={index} className={index === 0 ? "text-gray-600" : ""}>
                  {cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="pr-4 py-1">
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const formatSystemInfo = (systemInfo: string) => {
    return systemInfo.replace('PRETTY_NAME=', '').replace(/"/g, '');
  };

  const connectToTargetServer = async () => {
    setTargetConnectionInProgress(true);
    try {
      const response = await fetch('/api/connectToTarget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetIP: formData.targetIP,
          username: 'root',
          password: formData.targetPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTargetServerConnected(true);
        setTargetConnectionStatus(data.connectionStatus);
        alert('Connexion réussie au serveur cible');
      } else {
        throw new Error(data.message || 'Échec de la connexion au serveur cible');
      }
    } catch (error: any) {
      console.error('Target connection error:', error);
      alert(`Erreur de connexion : ${error.message}`);
    } finally {
      setTargetConnectionInProgress(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-bold text-blue-600">Configuration du serveur cible</h3>

      {/* Formulaire de configuration */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">IP du serveur cible</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaServer className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.targetIP}
              onChange={(e) => setFormData({ ...formData, targetIP: e.target.value })}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Entrez l'IP du serveur cible"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type={showTargetPassword ? 'text' : 'password'}
            value={formData.targetPassword}
            onChange={(e) => setFormData({ ...formData, targetPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            title="Mot de passe"
            placeholder="Entrez le mot de passe"
          />
          <button
            type="button"
            onClick={() => setShowTargetPassword(!showTargetPassword)}
            className="text-sm text-blue-500 hover:underline mt-1"
          >
            {showTargetPassword ? 'Masquer' : 'Afficher'} le mot de passe
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Domaine</label>
          <input
            type="text"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            title="Domaine"
            placeholder="Entrez le domaine"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            title="Email"
            placeholder="Entrez votre email"
          />
        </div>
      </div>

      {/* Bouton de connexion */}
      <button
        onClick={connectToTargetServer}
        disabled={targetConnectionInProgress}
        className={`px-4 py-2 rounded-md text-white transition-colors ${
          targetConnectionInProgress ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {targetConnectionInProgress ? 'Connexion en cours...' : 'Tester la connexion'}
      </button>

      {/* Affichage des informations du serveur */}
{targetServerConnected && targetConnectionStatus && (
  <div className="mt-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
    <h4 className="text-lg font-semibold text-blue-600 mb-4">État du serveur cible</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Connexion SSH */}
      <div className="flex items-center">
        <span className="font-medium text-gray-700">Connexion SSH :</span>
        <span
          className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
            targetConnectionStatus.sshConnection
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {targetConnectionStatus.sshConnection ? 'Établie' : 'Non établie'}
        </span>
      </div>

      {/* Accès root */}
      <div className="flex items-center">
        <span className="font-medium text-gray-700">Accès root :</span>
        <span
          className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
            targetConnectionStatus.rootAccess
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {targetConnectionStatus.rootAccess ? 'Disponible' : 'Non disponible'}
        </span>
      </div>

      {/* Espace disque */}
      <div className="col-span-1 md:col-span-2">
        <span className="font-medium text-gray-700">Espace disque :</span>
        <div className="mt-2 p-2 bg-gray-50 rounded-md font-mono text-xs overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-gray-600">
                <th className="pr-4 py-1">Filesystem</th>
                <th className="pr-4 py-1">Size</th>
                <th className="pr-4 py-1">Used</th>
                <th className="pr-4 py-1">Avail</th>
                <th className="pr-4 py-1">Use%</th>
                <th className="pr-4 py-1">Mounted on</th>
              </tr>
            </thead>
            <tbody>
              {targetConnectionStatus.diskSpace.split('\n').map((line, index) => {
                const cells = line.split(/\s+/).filter(Boolean);
                return (
                  <tr key={index} className={index === 0 ? 'text-gray-600' : ''}>
                    {cells.map((cell, cellIndex) => (
                      <td key={cellIndex} className="pr-4 py-1">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Système */}
      <div className="flex items-center">
        <span className="font-medium text-gray-700">Système :</span>
        <span className="ml-2 px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">
          {formatSystemInfo(targetConnectionStatus.systemInfo)}
        </span>
      </div>
    </div>
  </div>
)}

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Précédent
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!targetServerConnected}
          className={`px-4 py-2 rounded-md text-white ${
            targetServerConnected ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

// Pour la démo
function App() {
  const [formData, setFormData] = React.useState({
    targetIP: '91.108.113.59',
    targetPassword: 'password123',
    domain: 'example.com',
    email: 'test@example.com',
    sourceInstance: '',
    installPath: ''
  });
  const [showTargetPassword, setShowTargetPassword] = React.useState(false);

  return (
    <ServerConfigStep
      formData={formData}
      setFormData={setFormData}
      showTargetPassword={showTargetPassword}
      setShowTargetPassword={setShowTargetPassword}
      validateIP={() => true}
      validateDomain={() => true}
      validateEmail={() => true}
      setStep={() => {}}
    />
  );
}

export default ServerConfigStep;