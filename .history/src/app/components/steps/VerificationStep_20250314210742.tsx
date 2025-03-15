// app/components/steps/VerificationStep.tsx
import { FaArrowLeft, FaRocket } from 'react-icons/fa';
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
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-bold">Informations de déploiement</h4>
      <p><strong>Instance source :</strong> {formData.sourceInstance}</p>
      <p><strong>IP du serveur cible :</strong> {formData.targetIP}</p>
      <p><strong>Nom de domaine :</strong> {formData.domain}</p>
      <p><strong>Email administrateur :</strong> {formData.email}</p>
    </div>
    <div className="flex justify-between mt-6">
      <button
        onClick={() => setStep(2)}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <FaArrowLeft />
        Retour
      </button>
      <button
        onClick={deploy}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Déployer
        <FaRocket />
      </button>
    </div>
  </div>
);