// app/components/TerminalDisplay.tsx
interface TerminalDisplayProps {
    logs: string[];
    isLoading: boolean;
  }
  
  export const TerminalDisplay = ({ logs, isLoading }: TerminalDisplayProps) => (
    <div className="bg-gray-900 text-gray-100 font-mono p-4 rounded-md h-96 overflow-auto">
      {logs.map((log, index) => (
        <div key={index} className="py-1">
          {log}
        </div>
      ))}
      {isLoading && (
        <div className="flex items-center gap-2 text-blue-400">
          <div className="animate-spin h-4 w-4 border-2 border-blue-400 rounded-full border-t-transparent" />
          Exécution en cours...
        </div>
      )}
    </div>
  );