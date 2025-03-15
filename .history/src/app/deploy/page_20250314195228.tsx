'use client';

import { useState } from 'react';

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

const DeploymentSuccess = ({ domain, onReset }: { domain: string; onReset: () => void }) => (
  <div className="flex flex-col items-center gap-6 p-6">
    <svg
      className="w-16 h-16 text-green-500"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
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

  const resetForm = () => {
    setStep(0);
    setDeploymentSuccess(false);
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

  const handleNextStep = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setDeploymentSuccess(true);
    }
  };

  const handlePreviousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
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
                      onClick={handleNextStep}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Sélectionnez l'instance source</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Chemin de l'instance</label>
                      <input
                        type="text"
                        placeholder="Ex: /var/www/strapi"
                        value={formData.installPath}
                        onChange={(e) => setFormData({ ...formData, installPath: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={handlePreviousStep}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Configuration du serveur cible</h2>
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
                    <div>
                      <label className="block text-sm font-medium mb-1">Mot de passe du serveur cible</label>
                      <input
                        type="password"
                        placeholder="Mot de passe"
                        value={formData.targetPassword}
                        onChange={(e) => setFormData({ ...formData, targetPassword: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={handlePreviousStep}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
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
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="Ex: admin@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={handlePreviousStep}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Vérification des informations</h2>
                  <div className="flex flex-col gap-4">
                    <p>Adresse IP source : {formData.sourceIP}</p>
                    <p>Adresse IP cible : {formData.targetIP}</p>
                    <p>Nom de domaine : {formData.domain}</p>
                    <p>Email : {formData.email}</p>
                    <div className="flex justify-between">
                      <button
                        onClick={handlePreviousStep}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Déployer
                      </button>
                    </div>
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