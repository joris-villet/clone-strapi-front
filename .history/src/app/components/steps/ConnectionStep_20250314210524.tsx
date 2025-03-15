// app/components/steps/ConnectionStep.tsx
import { FaServer, FaTerminal, FaArrowRight, FaWifi, FaInfoCircle } from 'react-icons/fa';

interface ConnectionStepProps {
  sourceIP: string;
  setSourceIP: (ip: string) => void;
  sourceServerConnected: boolean;
  connectionInProgress: boolean;
  connectToSourceServer: () => Promise<void>;
  setIsTerminalOpen: (isOpen: boolean) => void;
  setStep: (step: number) => void;
  SOURCE_SERVER: { ip: string; username: string };
}

export const ConnectionStep = ({
  sourceIP,
  setSourceIP,
  sourceServerConnected,
  connectionInProgress,
  connectToSourceServer,
  setIsTerminalOpen,
  setStep,
  SOURCE_SERVER
}: ConnectionStepProps) => (
  <div className="flex flex-col gap-6">
    <h3 className="text-xl font-bold text-blue-600">Connexion au serveur source</h3>
    {/* ... reste du code de l'étape de connexion ... */}
  </div>
);