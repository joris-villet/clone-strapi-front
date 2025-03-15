'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import TerminalForm from '../components/TerminalForm';
import Terminal from '../components/Terminal';

// Type pour un serveur
interface Server {
  id: string;
  name: string;
  username: string;
  ip: string;
  port: string;
  rsaKey?: string;
}

// URL de base de l'API
const API_URL = 'http://localhost:4000/api';

export default function TerminalPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les serveurs depuis l'API
  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/servers`);
        setServers(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des serveurs:', err);
        setError('Impossible de charger les serveurs. Vérifiez que le backend est en cours d\'exécution.');
        // En mode développement, utilisez des données fictives si le backend n'est pas disponible
        if (process.env.NODE_ENV === 'development') {
          setServers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  // Fonction pour ajouter un nouveau serveur
  const addServer = async (newServer: Omit<Server, 'id'>) => {
    
    console.log('new server => ', newServer);
    
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/servers`, newServer);
      setServers((prev) => [...prev, response.data]);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de l\'ajout du serveur:', err);
      setError('Impossible d\'ajouter le serveur. Vérifiez que le backend est en cours d\'exécution.');
      
      // En mode développement, simuler l'ajout si le backend n'est pas disponible
      // if (process.env.NODE_ENV === 'development') {
      //   const mockServer = {
      //     ...newServer,
      //     id: Date.now().toString(),
      //   };
      //   setServers((prev) => [...prev, mockServer]);
      // }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
      {loading && (
        <div className="my-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-300">Chargement des serveurs...</span>
        </div>
      )}
      
      {/* Liste des serveurs et terminal */}
      <Terminal servers={servers} />
    </div>
  );
}



