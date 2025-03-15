'use client';

import { useState } from 'react';
import { FaTerminal, FaCheckCircle, FaCopy } from 'react-icons/fa';
import { StepperHeader } from '@/app/deploy/components/StepperHeader';
import { TerminalDisplay } from '@/app/deploy/components/TerminalDisplay';
import { ConnectionStep } from '@/app/deploy/components/steps/ConnectionStep';
import { InstanceSelectionStep } from '@/app/deploy/components/steps/InstanceSelectionStep';
import { ServerConfigStep } from '@/app/deploy/components/steps/ServerConfigStep';
import { VerificationStep } from '@/app/deploy/components/steps/VerificationStep';
import { FormData, Instance } from '@/app/deploy/types';

export default function DeployPage() {
  // États
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [sourceServerConnected, setSourceServerConnected] = useState(false);
  const [connectionInProgress, setConnectionInProgress] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [showTargetPassword, setShowTargetPassword] = useState(false);
  const [sourceIP, setSourceIP] = useState('163.172.140.154');

  const SOURCE_SERVER = { ip: sourceIP, username: 'root' };
  const STEPS = ['Connexion', 'Instance', 'Serveur', 'Vérification'];

  const [formData, setFormData] = useState<FormData>({
    sourceInstance: '',
    targetIP: '91.108.113.59',
    targetPassword: 'Oskarek1973#',
    domain: 'fabien.strapi-pro.com',
    email: 'jc.meilland@idboats.com',
    installPath: '/root/',
  });

  // Fonctions de validation
  const validateIP = (ip: string) =>
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
  const validateDomain = (domain: string) =>
    /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/.test(domain);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  // Fonction de déploiement
  const deploy = async () => {
    setIsLoading(true);
    setTerminalLogs([]);
    try {
      setTerminalLogs((prev) => [...prev, 'Début du processus de déploiement...']);
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
    } catch (error: any) {
      console.error('Error during deployment:', error);
      setTerminalLogs((prev) => [...prev, `Erreur : ${error.message}`]);
      showNotification({
        title: 'Erreur de déploiement',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        <StepperHeader step={step} steps={STEPS} />
        <div className="shadow-md rounded-lg p-6">
          {step === 0 && (
            <ConnectionStep
              sourceIP={sourceIP}
              setSourceIP={setSourceIP}
              sourceServerConnected={sourceServerConnected}
              connectionInProgress={connectionInProgress}
              connectToSourceServer={connectToSourceServer}
              setIsTerminalOpen={setIsTerminalOpen}
              setStep={setStep}
              SOURCE_SERVER={SOURCE_SERVER}
            />
          )}
          {step === 1 && (
            <InstanceSelectionStep
              instances={instances}
              formData={formData}
              setFormData={setFormData}
              setStep={setStep}
            />
          )}
          {step === 2 && (
            <ServerConfigStep
              formData={formData}
              setFormData={setFormData}
              showTargetPassword={showTargetPassword}
              setShowTargetPassword={setShowTargetPassword}
              validateIP={validateIP}
              validateDomain={validateDomain}
              validateEmail={validateEmail}
              setStep={setStep}
            />
          )}
          {step === 3 && (
            <VerificationStep
              formData={formData}
              setStep={setStep}
              deploy={deploy}
              isLoading={isLoading}
            />
          )}
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
          {deploymentSuccess && (
            <div className="mt-6 p-4 border-l-4 border-green-500 bg-green-50 rounded-md">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <h4 className="font-bold text-green-700">Déploiement réussi</h4>
                  <p className="text-sm text-green-600">
                    L'instance a été clonée et déployée avec succès sur le serveur cible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}