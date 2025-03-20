// 'use client';

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import TerminalForm from '../components/TerminalForm';
// import Terminal from '../components/Terminal';
// import { useServerStore } from '../stores/servers';

// import type { IServer } from '../../interfaces';


// export default function TerminalPage() {

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const useServer = useServerStore();

//   useEffect(() => {
//     const fetchServers = async () => {
//       try {

//         useServer.fetchServers();
//       } catch (err) {
//         console.error('Erreur lors du chargement des serveurs:', err);
//       } finally {
//       }
//     };

//     fetchServers();
//   }, []);


//   const addServer = async (newServer: Omit<IServer, 'id'>) => {
    
//     try {
//       useServer.addServer(newServer);
//     } catch(err) {
//       console.error('Erreur lors de l\'ajout du serveur:', err);
//     }

//   };

//   return (
//     <div className="mt-[4rem] container mx-auto max-w-7xl relative">
//       <h1 className="text-2xl font-bold mb-4 text-gray-300">Terminal SSH</h1>
//       <TerminalForm onAddServer={addServer} />
//       <Terminal servers={useServer.servers} />
//     </div>
//   );
// }


import TerminalForm from '../components/TerminalForm';
import Terminal from '../components/Terminal';
import { useServerStore } from '../stores/servers';

// import type { IServer } from '../../interfaces';


export default function TerminalPage() {

  // const useServer = useServerStore();

  // useEffect(() => {
  //   const fetchServers = async () => {
  //     try {

  //       useServer.fetchServers();
  //     } catch (err) {
  //       console.error('Erreur lors du chargement des serveurs:', err);
  //     } finally {
  //     }
  //   };

  //   fetchServers();
  // }, []);


  // const addServer = async (newServer: Omit<IServer, 'id'>) => {
    
  //   try {
  //     useServer.addServer(newServer);
  //   } catch(err) {
  //     console.error('Erreur lors de l\'ajout du serveur:', err);
  //   }

  // };

  return (
    <div className="mt-[4rem] container mx-auto max-w-7xl relative">
      <h1 className="text-2xl font-bold mb-4 text-gray-300">Terminal SSH</h1>
      <TerminalForm />
      <Terminal />
    </div>
  );
}





