'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import TerminalForm from '../components/TerminalForm';
import Terminal from '../components/Terminal';
import { useServerStore } from '../stores/servers';

import type { IServer } from '../../interfaces';




// URL de base de l'API
// const API_URL = 'http://localhost:4000/api';

export default function TerminalPage() {
  // const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const useServer = useServerStore();

  // Charger les serveurs depuis l'API
  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/servers`);
        useServer.fetchServers();
        //setServers(response.data);
        //useServer.servers(response.data)
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des serveurs:', err);
        setError('Impossible de charger les serveurs. Vérifiez que le backend est en cours d\'exécution.');
        // En mode développement, utilisez des données fictives si le backend n'est pas disponible
        // if (process.env.NODE_ENV === 'development') {
        //   setServers([]);
        // }
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  // Fonction pour ajouter un nouveau serveur
  const addServer = async (newServer: Omit<IServer, 'id'>) => {
    
    try {
      // setLoading(true);
      useServer.addServer(newServer);
      // const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/servers`, {
      //   ...newServer,
      //   connexionVerified
      // });
      //setServers((prev) => [...prev, response.data]);
    } catch(err) {
      console.error('Erreur lors de l\'ajout du serveur:', err);
    }

  };

  return (
    <div className="mt-[4rem] container mx-auto max-w-7xl relative">
      <h1 className="text-2xl font-bold mb-4 text-gray-300">Terminal SSH</h1>
      
      {/* Afficher les erreurs */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300">
          <p>{error}</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-sm mt-1">
              Mode développement : les fonctionnalités sont simulées localement.
            </p>
          )}
        </div>
      )}
      
      {/* Formulaire pour ajouter un serveur */}
      <TerminalForm onAddServer={addServer} />
      
      {/* Afficher un indicateur de chargement */}
      {/* {loading && (
        <div className="my-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-300">Chargement des serveurs...</span>
        </div>
      )} */}
      
      {/* Liste des serveurs et terminal */}
      <Terminal servers={useServer.servers} />
    </div>
  );
}



