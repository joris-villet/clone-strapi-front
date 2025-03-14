// 'use client';

// import React, { useEffect, useRef, useState } from 'react';
// import dynamic from 'next/dynamic';
// import type { Terminal as XTermType } from 'xterm';
// import type { FitAddon as FitAddonType } from 'xterm-addon-fit';

// interface Server {
//   id: string;
//   name: string;      // Ajout du champ name
//   username: string;
//   ip: string;
//   port: string;
// }

// interface TerminalProps {
//   servers: Server[];
// }

// const Terminal: React.FC<TerminalProps> = ({ servers }) => {
//   const [selectedServer, setSelectedServer] = useState<string | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const terminalRef = useRef<HTMLDivElement>(null);
//   const xtermRef = useRef<XTermType | null>(null);
//   const fitAddonRef = useRef<FitAddonType | null>(null);
//   const [isClientSide, setIsClientSide] = useState(false);
//   const [terminalReady, setTerminalReady] = useState(false);

//   // Vérifier si nous sommes côté client
//   useEffect(() => {
//     setIsClientSide(true);
//   }, []);

//   // Initialiser le terminal uniquement côté client
//   useEffect(() => {
//     if (!isClientSide || !terminalRef.current) return;

//     let cleanupFunction: (() => void) | undefined;

//     // Import dynamique des modules xterm
//     const initTerminal = async () => {
//       try {
//         // Importer les styles en premier
        
        
//         // Puis les modules
//         const xtermModule = await import('xterm');
//         const fitAddonModule = await import('xterm-addon-fit');

//         const XTerm = xtermModule.Terminal;
//         const FitAddon = fitAddonModule.FitAddon;

//         // Créer une nouvelle instance de terminal
//         const term = new XTerm({
//           cursorBlink: true,
//           theme: {
//             background: '#1e1e1e',
//             foreground: '#f0f0f0',
//             cursor: '#ffffff',
//             selectionBackground: 'rgba(255, 255, 255, 0.3)',
//             black: '#000000',
//             red: '#e06c75',
//             green: '#98c379',
//             yellow: '#e5c07b',
//             blue: '#61afef',
//             magenta: '#c678dd',
//             cyan: '#56b6c2',
//             white: '#d0d0d0',
//           },
//           fontFamily: 'Menlo, Monaco, "Courier New", monospace',
//           fontSize: 14,
//           lineHeight: 1.2,
//           cols: 80,  // Définir une largeur fixe initiale
//           rows: 24,  // Définir une hauteur fixe initiale
//         });

//         // Ajouter l'addon pour ajuster la taille
//         const fitAddon = new FitAddon();
//         term.loadAddon(fitAddon);

//         // Ouvrir le terminal dans le conteneur
//         term.open(terminalRef.current!);
        
//         // Attendre que le DOM soit complètement rendu
//         requestAnimationFrame(() => {
//           fitAddon.fit();
          
//           // Stocker les références
//           xtermRef.current = term;
//           fitAddonRef.current = fitAddon;
//           setTerminalReady(true);
          
//           // Gérer le redimensionnement
//           const handleResize = () => {
//             if (fitAddonRef.current) {
//               fitAddonRef.current.fit();
//             }
//           };

//           window.addEventListener('resize', handleResize);
          
//           // Définir la fonction de nettoyage
//           cleanupFunction = () => {
//             window.removeEventListener('resize', handleResize);
//             term.dispose();
//           };
//         });
//       } catch (error) {
//         console.error('Erreur lors de l\'initialisation du terminal:', error);
//       }
//     };

//     initTerminal();

//     // Nettoyage
//     return () => {
//       if (cleanupFunction) cleanupFunction();
//     };
//   }, [isClientSide]);

//   // Écrire le message d'accueil une fois que le terminal est prêt
//   useEffect(() => {
//     if (!terminalReady || !xtermRef.current) return;
    
//     // Attendre un peu pour s'assurer que le terminal est bien rendu
//     const timer = setTimeout(() => {
//       if (xtermRef.current) {
//         xtermRef.current.clear();
//         xtermRef.current.writeln('\x1b[1;34m=== Terminal SSH ===\x1b[0m');
//         xtermRef.current.writeln('\x1b[33mSélectionnez un serveur pour commencer.\x1b[0m');
//         xtermRef.current.writeln('');
//       }
//     }, 100);
    
//     return () => clearTimeout(timer);
//   }, [terminalReady]);

//   // Connecter au serveur sélectionné
//   const connectToServer = () => {
//     if (!selectedServer || !xtermRef.current) return;

//     const server = servers.find(s => s.id === selectedServer);
//     if (!server) return;

//     xtermRef.current.clear();
//     xtermRef.current.writeln(`\x1b[1;32mConnexion à ${server.username}@${server.ip}:${server.port}...\x1b[0m`);

//     // Simuler une connexion (à remplacer par une vraie connexion WebSocket)
//     setTimeout(() => {
//       if (xtermRef.current) {
//         xtermRef.current.writeln('\x1b[1;32mConnecté!\x1b[0m');
//         xtermRef.current.writeln('');
//         xtermRef.current.write(`${server.username}@${server.ip}:~$ `);
//         setIsConnected(true);

//         // Simuler l'entrée utilisateur
//         xtermRef.current.onData(data => {
//           // Gérer les touches spéciales
//           if (data === '\r') { // Entrée
//             xtermRef.current?.writeln('');
//             xtermRef.current?.write(`${server.username}@${server.ip}:~$ `);
//           } else if (data === '\u007F') { // Backspace
//             // Supprimer un caractère
//             xtermRef.current?.write('\b \b');
//           } else {
//             // Afficher le caractère tapé
//             xtermRef.current?.write(data);
//           }
//         });
//       }
//     }, 1000);
//   };

//   // Déconnecter du serveur
//   const disconnectFromServer = () => {
//     if (!xtermRef.current) return;

//     xtermRef.current.clear();
//     xtermRef.current.writeln('\x1b[1;31mDéconnecté du serveur.\x1b[0m');
//     xtermRef.current.writeln('\x1b[33mSélectionnez un serveur pour commencer.\x1b[0m');
//     xtermRef.current.writeln('');
//     setIsConnected(false);
//     setSelectedServer(null);
//   };

//   return (
//     <div className="mt-6">
//       <div className="bg-[#2C3E50]/40 backdrop-blur-sm border border-white/10 rounded-lg shadow-sm">
//         <div className="p-4 border-b border-white/10 flex justify-between items-center">
//           <h2 className="font-bold text-gray-300 text-xl">Terminal SSH</h2>

//           <div className="flex items-center gap-3">
//             {/* Sélecteur de serveur */}
//             <select
//               value={selectedServer || ''}
//               onChange={(e) => setSelectedServer(e.target.value || null)}
//               className="bg-[#1D2C42]/70 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//               disabled={isConnected}
//             >
//               <option value="">Sélectionner un serveur</option>
//               {servers.map((server) => (
//                 <option key={server.id} value={server.id}>
//                   {server.name} ({server.username}@{server.ip}:{server.port})
//                 </option>
//               ))}
//             </select>

//             {/* Boutons de connexion/déconnexion */}
//             {!isConnected ? (
//               <button
//                 onClick={connectToServer}
//                 disabled={!selectedServer}
//                 className={`px-4 py-2 rounded-md ${!selectedServer
//                   ? 'bg-gray-500 cursor-not-allowed'
//                   : 'bg-green-500 hover:bg-green-600'
//                 } text-white`}
//               >
//                 Connecter
//               </button>
//             ) : (
//               <button
//                 onClick={disconnectFromServer}
//                 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
//               >
//                 Déconnecter
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Terminal */}
//         <div className="p-4 relative">
//           <div
//             ref={terminalRef}
//             className={`h-96 w-full rounded-md overflow-hidden ${
//               servers.length === 0 ? 'opacity-50 pointer-events-none' : ''
//             }`}
//             style={{ minWidth: '300px' }}
//           />

//           {servers.length === 0 && (
//             <div className="absolute inset-0 flex items-center justify-center">
//               <p className="text-gray-400 text-lg">
//                 Ajoutez un serveur pour utiliser le terminal
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Terminal;


'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Terminal as XTermType } from 'xterm';
import type { FitAddon as FitAddonType } from 'xterm-addon-fit';

interface Server {
  id: string;
  name: string;
  username: string;
  ip: string;
  port: string;
}

interface TerminalProps {
  servers: Server[];
}

const Terminal: React.FC<TerminalProps> = ({ servers }) => {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTermType | null>(null);
  const fitAddonRef = useRef<FitAddonType | null>(null);
  const [isClientSide, setIsClientSide] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);

  // Vérifier si nous sommes côté client
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Initialiser le terminal uniquement côté client
  useEffect(() => {
    if (!isClientSide || !terminalRef.current) return;

    let cleanupFunction: (() => void) | undefined;

    // Import dynamique des modules xterm
    const initTerminal = async () => {
      try {
        // Puis les modules
        const xtermModule = await import('xterm');
        const fitAddonModule = await import('xterm-addon-fit');

        const XTerm = xtermModule.Terminal;
        const FitAddon = fitAddonModule.FitAddon;

        // Créer une nouvelle instance de terminal
        const term = new XTerm({
          cursorBlink: true,
          theme: {
            background: '#1e1e1e',
            foreground: '#f0f0f0',
            cursor: '#ffffff',
            selectionBackground: 'rgba(255, 255, 255, 0.3)',
            black: '#000000',
            red: '#e06c75',
            green: '#98c379',
            yellow: '#e5c07b',
            blue: '#61afef',
            magenta: '#c678dd',
            cyan: '#56b6c2',
            white: '#d0d0d0',
          },
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          fontSize: 14,
          lineHeight: 1.2,
          cols: 80,
          rows: 24,
          disableStdin: true, // Désactiver l'entrée par défaut
        });

        // Ajouter l'addon pour ajuster la taille
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        // Ouvrir le terminal dans le conteneur
        term.open(terminalRef.current!);
        
        // Attendre que le DOM soit complètement rendu
        requestAnimationFrame(() => {
          fitAddon.fit();
          
          // Stocker les références
          xtermRef.current = term;
          fitAddonRef.current = fitAddon;
          setTerminalReady(true);
          
          // Gérer le redimensionnement
          const handleResize = () => {
            if (fitAddonRef.current) {
              fitAddonRef.current.fit();
            }
          };

          window.addEventListener('resize', handleResize);
          
          // Définir la fonction de nettoyage
          cleanupFunction = () => {
            window.removeEventListener('resize', handleResize);
            term.dispose();
          };
        });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du terminal:', error);
      }
    };

    initTerminal();

    // Nettoyage
    return () => {
      if (cleanupFunction) cleanupFunction();
    };
  }, [isClientSide]);

  // Écrire le message d'accueil une fois que le terminal est prêt
  useEffect(() => {
    if (!terminalReady || !xtermRef.current) return;
    
    // Attendre un peu pour s'assurer que le terminal est bien rendu
    const timer = setTimeout(() => {
      if (xtermRef.current) {
        xtermRef.current.clear();
        xtermRef.current.writeln('\x1b[1;34m=== Terminal SSH ===\x1b[0m');
        xtermRef.current.writeln('\x1b[33mSélectionnez un serveur pour commencer.\x1b[0m');
        xtermRef.current.writeln('');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [terminalReady]);

  // Connecter au serveur sélectionné
  const connectToServer = () => {
    if (!selectedServer || !xtermRef.current) return;

    const server = servers.find(s => s.id === selectedServer);
    if (!server) return;

    xtermRef.current.clear();
    xtermRef.current.writeln(`\x1b[1;32mConnexion à ${server.username}@${server.ip}:${server.port}...\x1b[0m`);

    // Simuler une connexion (à remplacer par une vraie connexion WebSocket)
    setTimeout(() => {
      if (xtermRef.current) {
        // Activer l'entrée utilisateur
        xtermRef.current.options.disableStdin = false;
        
        xtermRef.current.writeln('\x1b[1;32mConnecté!\x1b[0m');
        xtermRef.current.writeln('');
        xtermRef.current.write(`${server.username}@${server.ip}:~$ `);
        setIsConnected(true);

        // Simuler l'entrée utilisateur
        xtermRef.current.onData(data => {
          // Gérer les touches spéciales
          if (data === '\r') { // Entrée
            xtermRef.current?.writeln('');
            xtermRef.current?.write(`${server.username}@${server.ip}:~$ `);
          } else if (data === '\u007F') { // Backspace
            // Supprimer un caractère
            xtermRef.current?.write('\b \b');
          } else {
            // Afficher le caractère tapé
            xtermRef.current?.write(data);
          }
        });
      }
    }, 1000);
  };

  // Déconnecter du serveur
  const disconnectFromServer = () => {
    if (!xtermRef.current) return;

    // Désactiver l'entrée utilisateur
    xtermRef.current.options.disableStdin = true;
    
    xtermRef.current.clear();
    xtermRef.current.writeln('\x1b[1;31mDéconnecté du serveur.\x1b[0m');
    xtermRef.current.writeln('\x1b[33mSélectionnez un serveur pour commencer.\x1b[0m');
    xtermRef.current.writeln('');
    setIsConnected(false);
    setSelectedServer(null);
  };

  return (
    <div className="mt-6">
      <div className="bg-[#2C3E50]/40 backdrop-blur-sm border border-white/10 rounded-lg shadow-sm">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-bold text-gray-300 text-xl">Terminal SSH</h2>

          <div className="flex items-center gap-3">
            {/* Sélecteur de serveur */}
            <select
              value={selectedServer || ''}
              onChange={(e) => setSelectedServer(e.target.value || null)}
              className="bg-[#1D2C42]/70 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isConnected}
            >
              <option value="">Sélectionner un serveur</option>
              {servers.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.name} ({server.username}@{server.ip}:{server.port})
                </option>
              ))}
            </select>

            {/* Boutons de connexion/déconnexion */}
            {!isConnected ? (
              <button
                onClick={connectToServer}
                disabled={!selectedServer}
                className={`px-4 py-2 rounded-md ${!selectedServer
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                Connecter
              </button>
            ) : (
              <button
                onClick={disconnectFromServer}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Déconnecter
              </button>
            )}
          </div>
        </div>

        {/* Terminal */}
        <div className="p-4 relative">
          <div
            ref={terminalRef}
            className={`h-96 w-full rounded-md overflow-hidden ${
              !isConnected ? 'opacity-70 pointer-events-none' : ''
            }`}
            style={{ minWidth: '300px' }}
          />

          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 text-lg bg-black/30 px-4 py-2 rounded">
                {servers.length === 0 
                  ? "Ajoutez un serveur pour utiliser le terminal" 
                  : "Connectez-vous à un serveur pour utiliser le terminal"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;