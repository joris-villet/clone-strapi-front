

  // export const fetchInstances = async (): Promise<void> => {
  //   setIsLoading(true);
  //   setError(null);
  
  //   try {
  //     const { data } = await axios.get<Instance[]>(`/api/instances`);
  
  //     setInstances((prev) => {
  //       const updatedInstances = data.map((newInstance) => {
  //         const existingInstance = prev.find((instance) => instance.id === newInstance.id);
  //         return existingInstance
  //           ? { ...existingInstance, ...newInstance }
  //           : {
  //               ...newInstance,
  //               status: "pending", // Initialiser le statut à "pending"
  //               statusHistory: JSON.stringify([]), // Initialiser l'historique
  //             };
  //       });
  
  //       return updatedInstances;
  //     });
  //   } catch (error: any) {
  //     console.error('Erreur lors de la récupération des instances:', error);
  //     setError('Impossible de récupérer les instances. Vérifiez que le serveur est en cours d\'exécution.');
  //     showToast(
  //       'Erreur de connexion',
  //       'Impossible de récupérer les instances. Vérifiez que le serveur est en cours d\'exécution sur le port 3002.',
  //       'error',
  //       5000
  //     );
  //   } finally {
  //     setIsLoading(false);
  //     setIsInitialLoading(false);
  //   }
  // };