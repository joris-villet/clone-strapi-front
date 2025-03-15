interface ConnectionStepProps extends StepProps {
  sourceIP: string;
  setSourceIP: (ip: string) => void;
  sourceServerConnected: boolean;
  connectionInProgress: boolean;
  connectToSourceServer: () => Promise<void>;
  setIsTerminalOpen: (isOpen: boolean) => void;
  SOURCE_SERVER: { ip: string; username: string };
}

export const ConnectionStep: React.FC<ConnectionStepProps> = ({
  sourceIP,
  setSourceIP,
  sourceServerConnected,
  connectionInProgress,
  connectToSourceServer,
  setIsTerminalOpen,
  setStep,
  SOURCE_SERVER,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Connexion au serveur source</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">IP du serveur</label>
            <input
              type="text"
              value={sourceIP}
              onChange={(e) => setSourceIP(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={connectToSourceServer}
              disabled={connectionInProgress || sourceServerConnected}
              className={`px-4 py-2 rounded-md ${
                sourceServerConnected
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {connectionInProgress
                ? 'Connexion en cours...'
                : sourceServerConnected
                ? 'Connecté'
                : 'Se connecter'}
            </button>
            <button
              onClick={() => setIsTerminalOpen(true)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Voir les logs
            </button>
          </div>
        </div>
      </div>
      {sourceServerConnected && (
        <div className="flex justify-end">
          <button
            onClick={() => setStep(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};