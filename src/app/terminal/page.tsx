'use client';

import { useState } from 'react';
import TerminalForm from '../components/TerminalForm';
import Terminal from '../components/Terminal';

// Type pour un serveur - assurez-vous qu'il correspond à celui dans Terminal.tsx
interface Server {
  id: string;
  name: string;       // Ajout du champ name manquant
  username: string;
  password: string;
  ip: string;
  port: string;
  rsaKey?: string;
}

export default function TerminalPage() {
  const [servers, setServers] = useState<Server[]>([]);

  // Fonction pour ajouter un nouveau serveur
  const addServer = (newServer: Omit<Server, 'id'>) => {
    const server = {
      ...newServer,
      id: Date.now().toString(), // Générer un ID unique
    };
    setServers((prev) => [...prev, server]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-300">Terminal SSH</h1>
      
      {/* Formulaire pour ajouter un serveur */}
      <TerminalForm onAddServer={addServer} />
      
      {/* Liste des serveurs et terminal */}
      <Terminal servers={servers} />
    </div>
  );
}