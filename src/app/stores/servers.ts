import { create } from 'zustand';
import axios from 'axios';
import type { IServer } from '../../interfaces'
// Définition de l'interface du serveur


// Interface du store
interface ServerStore {
  servers: IServer[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchServers: () => Promise<void>;
  addServer: (server: Omit<IServer, 'id'>) => Promise<boolean>;
  deleteServer: (id: string) => Promise<boolean>;
  updateServer: (id: string, data: Partial<IServer>) => Promise<boolean>;
}

export const useServerStore = create<ServerStore>((set, get) => ({
  // État initial
  servers: [],
  isLoading: false,
  error: null,
  
  // Actions
  fetchServers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/servers`);
      set({ servers: response.data, isLoading: false });
    } catch (error) {
      console.error('Erreur lors du chargement des serveurs:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        isLoading: false 
      });
    }
  },
  
  addServer: async (serverData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/servers`, serverData);
      set(state => ({ 
        servers: [...state.servers, response.data],
        isLoading: false 
      }));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du serveur:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        isLoading: false 
      });
      return false;
    }
  },
  
  deleteServer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/servers/${id}`);
      set(state => ({ 
        servers: state.servers.filter(server => server.id !== id),
        isLoading: false 
      }));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du serveur:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        isLoading: false 
      });
      return false;
    }
  },
  
  updateServer: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/servers/${id}`, data);
      set(state => ({ 
        servers: state.servers.map(server => 
          server.id === id ? { ...server, ...response.data } : server
        ),
        isLoading: false 
      }));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du serveur:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        isLoading: false 
      });
      return false;
    }
  }
}));