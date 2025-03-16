
'use client';

import axios from 'axios';
import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RenderStatusHistory from '../components/RenderStatusHistory';
import MonitoringModal from '../components/MonitoringModal';
import type { Instance, ErrorData } from '../../interfaces';

export default function Monitoring() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [newInstance, setNewInstance] = useState<Partial<Instance>>({
    name: '',
    url: '',
    interval: 60,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
  const [currentError, setCurrentError] = useState<ErrorData | null>(null);
  const [statusLabelColor, setStatusLabelColor] = useState<string>('');
  const [modalIsActive, setModalIsActive] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<{ instance: Instance; item: any; index: number; } | undefined>(undefined);

  const monitoringTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const fetchInstances = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.get<Instance[]>(`/api/instances`);
      setInstances(data.map(instance => ({
        ...instance,
        status: "pending",
        statusHistory: JSON.stringify([])
      })));
    } catch (error: any) {
      console.error('Erreur lors de la récupération des instances:', error);
      setError('Impossible de récupérer les instances');
      toast.error('Impossible de récupérer les instances', {
        autoClose: 5000
      });
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
      const { data } = await axios.post(`/api/instances`, {
        ...newInstance,
        status: "pending",
        statusHistory: JSON.stringify([]),
      });

      setInstances(prev => [...prev, data]);
      setNewInstance({ name: "", url: "", interval: 60 });
      toast.success('Instance ajoutée avec succès');
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de l'instance:", error);
      setError(`Erreur lors de l'ajout de l'instance: ${error.message}`);
      toast.error(error.message || "Erreur lors de l'ajout de l'instance", {
        autoClose: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInstance = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`/api/instances`, { params: { id } });
      await fetchInstances();
      toast.success('Instance supprimée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'instance:', error);
      setError(`Erreur lors de la suppression: ${error.message}`);
      toast.error(error.message || 'Erreur lors de la suppression', {
        autoClose: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const monitorInstance = async (id: string, url: string) => {
    try {
      const { data } = await axios.post(`/api/monitoring`, { id, url });
      setInstances(prev => prev.map(instance =>
        instance.id === id ? {
          ...instance,
          ...data,
          statusHistory: JSON.stringify([
            ...JSON.parse(instance.statusHistory || "[]"),
            { color: data.color }
          ].slice(-10))
        } : instance
      ));
    } catch (error: any) {
      console.error("Erreur de monitoring:", error);
    }
  };

  const handleStatus = (currentInstance: Instance) => {
    setModalIsActive(true);
    // setCurrentError({
    //   statusCode: currentInstance.statusCode || 0,
    //   statusText: currentInstance.statusText || '',
    //   url: currentInstance.url,
    //   date: new Date().toISOString(),
    //   status: currentInstance.status,
    // });
    // setErrorModalOpen(true);

    // currentInstance.status === 'offline'
    //   ? toast.error(`${currentInstance.statusText} ${currentInstance.statusCode}`, {
    //     autoClose: 5000
    //   })
    //   : toast.success(`${currentInstance.statusText} ${currentInstance.statusCode}`, {
    //     autoClose: 2000
    //   });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewInstance(prev => ({
      ...prev,
      [name]: name === 'interval' ? Number(value) : value
    }));
  };

  useEffect(() => {
    fetchInstances();
    return () => Object.values(monitoringTimers.current).forEach(clearInterval);
  }, []);

  useEffect(() => {
    Object.values(monitoringTimers.current).forEach(clearInterval);
    monitoringTimers.current = {};

    instances.forEach(instance => {
      monitoringTimers.current[instance.id] = setInterval(
        () => monitorInstance(instance.id, instance.url),
        instance.interval * 1000
      );
    });

    return () => Object.values(monitoringTimers.current).forEach(clearInterval);
  }, [instances]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl relative">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        // transition={Bounce}
      />

      <div className="container mx-auto px-4 py-6 max-w-7xl relative">
        <div className="container mx-auto px-4 py-6 max-w-7xl relative">
          <div className="flex flex-col space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-300">Gestion des Instances</h1>

              <div className="flex gap-2">

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
                      <div key={instance.id} className="overflow-hidden bg-card-instance-custom backdrop-blur-sm border border-[#3A6A9B]/40 col-span-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col h-full relative">

                          <div className='absolute bottom-0 -right-4 -z-10 bg-purple-500 blur-3xl h-[40px] w-[150px] opacity-60'></div>

                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold truncate text-white">{instance.name}</span>
                            </div>

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
                            {instance.statusHistory ? RenderStatusHistory(instance.statusHistory, instance) : null}
                          </div> */}
                          <div className="mb-4">
                            {instance.statusHistory ?
                              <RenderStatusHistory
                                history={instance.statusHistory}
                                instance={instance}
                                onHistoryItemClick={() => handleStatus(instance)}
                              />
                              :
                              null}
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
                    {modalIsActive &&
                      <MonitoringModal
                        instance={selectedHistoryItem?.instance || instances[0]}
                        historyItem={selectedHistoryItem}
                        onClick={() => setModalIsActive(false)}
                      />
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};