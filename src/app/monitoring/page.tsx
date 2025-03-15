'use client';

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import axios from 'axios';
// import ErrorModal from '../components/ErrorModal';

// URL de base pour toutes les requêtes API
// const API_BASE_URL = 'http://localhost:3000/api';

// Types pour les instances
interface Instance {
  id: string;
  name: string;
  url: string;
  interval: number;
  status: string;
  statusHistory: string; // JSON stringified array
  color?: string; // Optionnel, pour la gestion des couleurs
  statusCode?: number;
  statusText?: string;
  date?: string;
}

interface ErrorData {
  statusCode: number;
  statusText: string;
  url: string;
  date: string;
  status: string;
}

interface Toast {
  title: string;
  description: string;
  status: 'success' | 'error' | 'info';
}

export default function Monitoring() {
  // État pour stocker la liste des instances
  const [instances, setInstances] = useState<Instance[]>([]);

  // État pour le formulaire de nouvelle instance
  const [newInstance, setNewInstance] = useState<Partial<Instance>>({
    name: '',
    url: '',
    interval: 60,
  });

  // États pour la gestion des chargements et erreurs
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
  const [currentError, setCurrentError] = useState<ErrorData | null>(null);

  // Gestion monitoring color status
  const [statusLabelColor, setStatusLabelColor] = useState<string>('');

  // État pour les toasts
  const [toast, setToast] = useState<Toast | null>(null);
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fonction pour afficher un toast
  const showToast = (title: string, description: string, status: 'success' | 'error' | 'info', duration = 3000) => {
    if (toastTimeout) clearTimeout(toastTimeout);

    setToast({ title, description, status });

    const timeout = setTimeout(() => {
      setToast(null);
    }, duration);

    setToastTimeout(timeout);
  };

  const fetchInstances = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
  
    try {
      const { data } = await axios.get<Instance[]>(`/api/instances`);
  
      setInstances((prev) => {
        const updatedInstances = data.map((newInstance) => {
          const existingInstance = prev.find((instance) => instance.id === newInstance.id);
          return existingInstance
            ? { ...existingInstance, ...newInstance }
            : {
                ...newInstance,
                status: "pending", // Initialiser le statut à "pending"
                statusHistory: JSON.stringify([]), // Initialiser l'historique
              };
        });
  
        return updatedInstances;
      });
    } catch (error: any) {
      console.error('Erreur lors de la récupération des instances:', error);
      setError('Impossible de récupérer les instances. Vérifiez que le serveur est en cours d\'exécution.');
      showToast(
        'Erreur de connexion',
        'Impossible de récupérer les instances. Vérifiez que le serveur est en cours d\'exécution sur le port 3002.',
        'error',
        5000
      );
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const addInstance = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
  
    setIsLoading(true);
    setError(null);
  
    try {
      const instanceToSend = {
        ...newInstance,
        status: "pending", // Initialiser le statut à "pending"
        statusHistory: JSON.stringify([]),
      };
  
      const { data } = await axios.post(`/api/instances`, instanceToSend);
  
      // Ajouter la nouvelle instance à l'état local
      setInstances((prev) => [
        ...prev,
        {
          ...data, // Les données renvoyées par le backend
          status: "pending", // Initialiser le statut à "pending"
          statusHistory: JSON.stringify([]), // Initialiser l'historique
        },
      ]);
  
      setNewInstance({ name: "", url: "", interval: 60 });
  
      showToast("Succès", "Instance ajoutée avec succès", "success");
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de l'instance:", error);
      setError(`Erreur lors de l'ajout de l'instance: ${error.message}`);
      showToast("Erreur", error.message || "Erreur lors de l'ajout de l'instance", "error", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInstance = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.delete(`/api/instances`, {
        params: { id },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      await fetchInstances();
      showToast('Succès', response.data.message || 'Instance supprimée avec succès', 'success');
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'instance:', error);
      setError(`Erreur lors de la suppression de l'instance: ${error.response?.data?.message || error.message}`);
      showToast('Erreur', error.response?.data?.message || 'Erreur lors de la suppression de l\'instance', 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  };



  const monitorInstance = async (id: string, url: string) => {
    try {
      const { data } = await axios.post(`/api/monitoring`, { id, url });

      // Mettre à jour l'instance spécifique avec sa couleur et son historique
      setInstances((prev) =>
        prev.map((instance) =>
          instance.id === id
            ? {
              ...instance,
              color: data.color,
              status: data.status,
              statusHistory: JSON.stringify([
                ...(JSON.parse(instance.statusHistory || "[]") || []), // Conserver l'historique existant
                { color: data.color }, // Ajouter la nouvelle couleur
              ].slice(-10)), // Limiter à 10 éléments
            }
            : instance
        )
      );
    } catch (error: any) {
      console.error("Erreur de monitoring:", error);
    }
  };




  const handleStatus = (currentInstance: Instance) => {
    const errorData: ErrorData = {
      statusCode: currentInstance.statusCode || 0,
      statusText: currentInstance.statusText || '',
      url: currentInstance.url,
      date: currentInstance.date || new Date().toISOString(),
      status: currentInstance.status,
    };

    setCurrentError(errorData);
    setErrorModalOpen(true);

    showToast(
      currentInstance.name,
      `${currentInstance.statusText} ${currentInstance.statusCode}`,
      currentInstance.status === 'offline' ? 'error' : 'success',
      currentInstance.status === 'offline' ? 5000 : 2000
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewInstance({
      ...newInstance,
      [name]: name === 'interval' ? Number(value) : value,
    });
  };


  const renderStatusHistory = (history: string, instance: Instance) => {
    let parsedHistory = [];
    try {
      parsedHistory = JSON.parse(history || "[]");
    } catch (error) {
      console.error("Erreur lors du parsing de l'historique :", error);
      return null;
    }

    // Limiter à 10 éléments
    const limitedHistory = parsedHistory.slice(-10); // Prend les 10 derniers éléments

    return (
      <div className="flex space-x-1">
        {limitedHistory.map((key: { color: string }, index: number) => (
          <div
            key={index}
            className="w-[10px] h-[20px] rounded-full cursor-pointer"
            style={{ backgroundColor: key.color }}
            onClick={() => handleStatus(instance)}
          />
        ))}
      </div>
    );
  };



  const monitoringTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    fetchInstances().then(() => {
      instances.forEach((instance) => {
        const timer = setInterval(() => {
          monitorInstance(instance.id, instance.url);
        }, instance.interval * 1000);

        monitoringTimers.current[instance.id] = timer;
      });
    });

    return () => {
      Object.values(monitoringTimers.current).forEach(clearInterval);
    };
  }, []);

  useEffect(() => {
    Object.values(monitoringTimers.current).forEach(clearInterval);
    monitoringTimers.current = {};

    if (instances.length === 0) return;

    instances.forEach((instance) => {
      const timer = setInterval(() => {
        monitorInstance(instance.id, instance.url);
      }, instance.interval * 1000);

      monitoringTimers.current[instance.id] = timer;
    });

    return () => {
      Object.values(monitoringTimers.current).forEach(clearInterval);
    };
  }, [instances]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl relative">
      <div className="container mx-auto px-4 py-6 max-w-7xl relative">
        {/* <div className='bg-image'></div> */}
        <div className='absolute -z-10 bg-blue-800 blur-3xl h-[200px] w-[1200px] opacity-50'></div>
        <div className='fixed bottom-0 left-0 -z-10 bg-cyan-300 blur-3xl h-[100px] w-full opacity-10 -rotate-12'></div>
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-300">Gestion des Instances</h1>

            <div className="flex gap-2">
              {/* <a href="/deploy" className="text-blue-500">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Déployer Strapi
              </button>
            </a> */}

              {/* <Link
                href="/deploy"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
              >
                Déployer Strapi
              </Link> */}

              <button
                className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white cursor-pointer px-4 py-2 rounded flex items-center gap-2"
                onClick={fetchInstances}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rafraîchir
              </button>
            </div>
          </div>

          {/* Toast notification */}
          {toast && (
            <div className={`fixed top-4 right-4 p-4 rounded shadow-lg z-50 ${toast.status === 'error' ? 'bg-red-100 border-red-500' :
              toast.status === 'success' ? 'bg-green-100 border-green-500' :
                'bg-blue-100 border-blue-500'
              } border-l-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {toast.status === 'error' && (
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {toast.status === 'success' && (
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{toast.description}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setToast(null)}
                      className="inline-flex rounded-md p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Affichage des erreurs de connexion */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire d'ajout */}

          <div className="rounded-lg shadow-sm bg-[#2C3E50]/40 backdrop-blur-sm border border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-bold text-gray-300 text-xl">Ajouter une nouvelle instance</h2>
              <button
                type="button"
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="text-gray-300 hover:text-white transition-colors bg-blue-500 cursor-pointer rounded-md shadow-2xl p-1"
                aria-expanded={isFormVisible}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 transition-transform duration-300 ${isFormVisible ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Formulaire qui s'affiche/se masque */}

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${isFormVisible
                ? 'max-h-[500px] opacity-100 transform translate-y-0'
                : 'max-h-0 opacity-0 transform -translate-y-4'
                }`}
            >
              <div className="p-4">
                <form onSubmit={addInstance}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                        Nom
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={newInstance.name}
                        onChange={handleInputChange}
                        placeholder="Nom de l'instance"
                        className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="url" className="text-gray-300 block text-sm font-medium mb-1">
                        URL
                      </label>
                      <input
                        id="url"
                        name="url"
                        type="url"
                        value={newInstance.url}
                        onChange={handleInputChange}
                        placeholder="https://exemple.com/api"
                        className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="interval" className="block text-sm font-medium text-gray-300 mb-1">
                        Intervalle (sec)
                      </label>
                      <input
                        id="interval"
                        name="interval"
                        type="number"
                        min="10"
                        value={newInstance.interval}
                        onChange={handleInputChange}
                        className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter l'instance
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Liste des instances */}
          <div className="rounded-lg shadow-sm bg-[#2C3E50]/40 backdrop-blur-sm border border-white/10">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="font-medium mb-4 text-gray-300 text-xl">Instances existantes</h2>
                {isInitialLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                )}
              </div>
            </div>
            <div className="p-4 ">
              {isInitialLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4">Chargement des instances...</p>
                </div>
              ) : instances.length === 0 ? (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">Aucune instance disponible</p>
                    </div>
                  </div>
                </div>
              ) : (

                <div className="grid grid-cols-12 gap-4">
                  {instances.map((instance) => (
                    <div key={instance.id} className="overflow-hidden bg-[#3A6A9B]/30 backdrop-blur-sm border border-[#3A6A9B]/40 col-span-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col h-full relative">

                        <div className='absolute bottom-0 -right-4 -z-10 bg-purple-500 blur-3xl h-[40px] w-[150px] opacity-60'></div>

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold truncate text-white">{instance.name}</span>
                          </div>

                          {/* <span
                            className="text-xs px-2 py-1 rounded-full shadow-2xs text-gray-800 font-bold"
                            style={{ backgroundColor: instance.color || '#cccccc' }}
                          >
                            {instance.status}
                          </span> */}

                          <span
                            className="text-xs px-2 py-1 rounded-full shadow-2xs font-bold"
                            style={{
                              backgroundColor: instance.status === "pending" ? "#f0ad4e" : instance.color || "#cccccc", // Couleur orange pour "pending"
                              color: instance.status === "pending" ? "#ffffff" : "#000000", // Texte blanc pour "pending"
                            }}
                          >
                            {instance.status === "pending" ? "pending..." : instance.status}
                          </span>

                        </div>

                        <div className="text-gray-600 text-sm mb-2 truncate">
                          <a href={instance.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {instance.url}
                          </a>
                        </div>

                        <div className="flex items-center mt-1 space-x-1">
                          <span className="text-xs text-gray-100">Historique:</span>
                          <div className="relative group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                              Derniers statuts (de gauche à droite)
                            </div>
                          </div>
                        </div>

                        {/* <div className="mb-4">
                          {renderStatusHistory(instance.statusHistory, instance)}
                        </div> */}

                        <div className="mb-4">
                          {instance.statusHistory ? renderStatusHistory(instance.statusHistory, instance) : null}
                        </div>

                        <div className="flex gap-2 mt-auto">
                          <button
                            className="cursor-pointer p-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded flex-1 flex justify-center"
                            onClick={() => monitorInstance(instance.id, instance.url)}
                            disabled={isLoading}
                            aria-label="Vérifier le status"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>

                          <button
                            className="cursor-pointer p-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded flex-1 flex justify-center"
                            onClick={() => deleteInstance(instance.id)}
                            disabled={isLoading}
                            aria-label="Supprimer l'instance"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* <ErrorModal 
        isOpen={errorModalOpen} 
        onClose={() => setErrorModalOpen(false)} 
        error={currentError} 
      /> */}
      </div>
    </div>
  );
};

