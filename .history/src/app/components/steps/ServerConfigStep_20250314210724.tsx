// app/components/steps/ServerConfigStep.tsx
import { FaServer, FaLock, FaGlobe, FaEnvelope, FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FormData } from '@/types';

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

export const ServerConfigStep = ({
  formData,
  setFormData,
  showTargetPassword,
  setShowTargetPassword,
  validateIP,
  validateDomain,
  validateEmail,
  setStep,
}: ServerConfigStepProps) => (
  <div className="flex flex-col gap-6">
    <h3 className="text-xl font-bold text-blue-600">Configuration du serveur cible</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* IP du serveur cible */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Adresse IP du serveur cible</label>
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
      </div>
      {/* Mot de passe */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Mot de passe root</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showTargetPassword ? 'text' : 'password'}
            value={formData.targetPassword}
            onChange={(e) => setFormData({ ...formData, targetPassword: e.target.value })}
            className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowTargetPassword(!showTargetPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showTargetPassword ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
          </button>
        </div>
      </div>
      {/* Nom de domaine */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Nom de domaine</label>
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
      </div>
      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Email administrateur</label>
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
      </div>
    </div>
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
);