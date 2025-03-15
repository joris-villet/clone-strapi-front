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
  SOURCE_SERVER,
}: ConnectionStepProps) => (
  <div className="flex flex-col gap-6">
    <h3 className="text-xl font-bold text-blue-600">Connexion au serveur source</h3>

    {/* Formulaire pour l'adresse IP du serveur source */}
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        Adresse IP du serveur source
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaServer className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="163.172.140.154"
          value={sourceIP}
          onChange={(e) => setSourceIP(e.target.value)}
          disabled={sourceServerConnected}
          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
      </div>
      <p className="text-sm text-gray-500">
        L'adresse IP du serveur contenant les instances Strapi
      </p>
    </div>

    {/* Carte d'état de connexion */}
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="font-bold">Serveur source</span>
            <span>{SOURCE_SERVER.ip}</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              sourceServerConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {sourceServerConnected ? 'Connecté' : 'Non connecté'}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Ce serveur contient les instances Strapi à utiliser comme source.
        </p>
        {sourceServerConnected ? (
          <div className="flex gap-4">
            <button
              onClick={() => setIsTerminalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FaTerminal />
              Voir les logs
            </button>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Continuer
              <FaArrowRight />
            </button>
          </div>
        ) : (
          <button
            onClick={connectToSourceServer}
            disabled={connectionInProgress}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            <FaWifi />
            {connectionInProgress ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                Connexion en cours...
              </>
            ) : (
              'Se connecter au serveur'
            )}
          </button>
        )}
      </div>
    </div>

    {/* Message d'information */}
    {!sourceServerConnected && (
      <div className="flex gap-3 p-4 border-l-4 border-blue-500 rounded-md">
        <FaInfoCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
        <p className="text-sm">
          Vous devez d'abord vous connecter au serveur source pour récupérer les instances.
        </p>
      </div>
    )}
  </div>
);