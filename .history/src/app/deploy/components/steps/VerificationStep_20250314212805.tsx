// app/components/steps/VerificationStep.tsx
import { FaArrowLeft, FaRocket, FaServer, FaGlobe, FaEnvelope, FaFolder } from 'react-icons/fa';
import { FormData } from '@/types';

interface VerificationStepProps {
  formData: FormData;
  setStep: (step: number) => void;
  deploy: () => Promise<void>;
  isLoading: boolean;
}

export const VerificationStep = ({
  formData,
  setStep,
  deploy,
  isLoading,
}: VerificationStepProps) => (
  <div className="flex flex-col gap-6">
    <h3 className="text-xl font-bold text-blue-600">Vérification et déploiement</h3>
    
    {/* Instance Source */}
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <FaServer className="text-blue-500" />
        <h4 className="font-bold text-gray-800">Instance Source</h4>
      </div>
      <div className="pl-6 text-gray-600">
        <p className="mb-2">
          <span className="font-medium">Chemin de l'instance :</span>{' '}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {formData.sourceInstance}
          </span>
        </p>
      </div>
    </div>

    {/* Serveur Cible */}
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <FaServer className="text-green-500" />
        <h4 className="font-bold text-gray-800">Serveur Cible</h4>
      </div>
      <div className="pl-6 text-gray-600">
        <p className="mb-2">
          <span className="font-medium">Adresse IP :</span>{' '}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {formData.targetIP}
          </span>
        </p>
        <p className="mb-2">
          <span className="font-medium">Chemin d'installation :</span>{' '}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {formData.installPath}
          </span>
        </p>
      </div>
    </div>

    {/* Configuration */}
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <FaGlobe className="text-purple-500" />
        <h4 className="font-bold text-gray-800">Configuration</h4>
      </div>
      <div className="pl-6 text-gray-600">
        <p className="mb-2">
          <span className="font-medium">Nom de domaine :</span>{' '}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {formData.domain}
          </span>
        </p>
        <p className="mb-2">
          <span className="font-medium">Email administrateur :</span>{' '}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {formData.email}
          </span>
        </p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex justify-between mt-6">
      <button
        onClick={() => setStep(2)}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        <FaArrowLeft className="text-gray-500" />
        Retour
      </button>
      <button
        onClick={deploy}
        disabled={isLoading}
        className={`flex items-center gap-2 px-6 py-2 rounded-md text-white transition-colors
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none" 
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
              />
            </svg>
            Déploiement en cours...
          </>
        ) : (
          <>
            Déployer
            <FaRocket className="text-white" />
          </>
        )}
      </button>
    </div>

    {/* Note d'information */}
    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
      <p className="text-sm text-blue-700">
        <strong>Note :</strong> Le déploiement peut prendre plusieurs minutes. 
        Vous pourrez suivre la progression dans le terminal une fois le processus lancé.
      </p>
    </div>
  </div>
);