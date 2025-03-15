interface TerminalDisplayProps {
  logs: string[];
  isLoading: boolean;
}

export const TerminalDisplay: React.FC<TerminalDisplayProps> = ({ logs, isLoading }) => {
  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm h-96 overflow-auto">
      {logs.map((log, index) => (
        <div key={index} className="whitespace-pre-wrap">
          {log.startsWith('Error:') ? (
            <span className="text-red-400">{log}</span>
          ) : log.startsWith('Success:') ? (
            <span className="text-green-400">{log}</span>
          ) : (
            <span>{log}</span>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="animate-pulse">
          <span className="text-green-400">▋</span>
        </div>
      )}
    </div>
  );
};