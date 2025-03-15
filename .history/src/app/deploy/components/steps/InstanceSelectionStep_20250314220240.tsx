// app/components/steps/InstanceSelectionStep.tsx
import { FaFolder, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Instance, FormData } from '../../../types';

interface InstanceSelectionStepProps {
  instances: Instance[];
  formData: FormData;
  setFormData: (data: FormData) => void;
  setStep: (step: number) => void;
}

export const InstanceSelectionStep = ({
  instances,
  formData,
  setFormData,
  setStep,
}: InstanceSelectionStepProps) => (
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
            <FaFolder
              className={`h-6 w-6 ${
                formData.sourceInstance === instance.path ? 'text-blue-500' : 'text-gray-400'
              }`}
            />
            <div>
              <h4 className="font-medium">{instance.name}</h4>
              <p className="text-sm text-gray-500">{instance.path}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
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
);