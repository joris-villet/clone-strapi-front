'use client';

import React, { useState } from 'react';

const TerminalForm = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newInstance, setNewInstance] = useState({
    username: '',
    password: '',
    ip: '',
    rsaKey: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewInstance((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addInstance = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New instance added:', newInstance);
    // Vous pouvez ici envoyer les données au backend ou les traiter
    setNewInstance({
      username: '',
      password: '',
      ip: '',
      rsaKey: '',
    });
    setIsFormVisible(false);
  };

  return (
    <div className="rounded-lg shadow-sm bg-[#2C3E50]/40 backdrop-blur-sm border border-white/10">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="font-bold text-gray-300 text-xl">Ajouter un serveur distant</h2>
        <button
          type="button"
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="text-gray-300 hover:text-white transition-colors bg-blue-500 rounded-md shadow-2xl p-0.5"
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
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isFormVisible ? 'max-h-[500px] opacity-100 transform translate-y-0' : 'max-h-0 opacity-0 transform -translate-y-4'
        }`}
      >
        <div className="p-4">
          <form onSubmit={addInstance}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  value={newInstance.username}
                  onChange={handleInputChange}
                  placeholder="root"
                  className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={newInstance.password}
                  onChange={handleInputChange}
                  placeholder="Mot de passe"
                  className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* IP Address */}
              <div>
                <label htmlFor="ip" className="block text-sm font-medium text-gray-300 mb-1">
                  Adresse IP
                </label>
                <input
                  id="ip"
                  name="ip"
                  type="text"
                  value={newInstance.ip}
                  onChange={handleInputChange}
                  placeholder="192.168.1.1"
                  className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* RSA Key (optionnel) */}
              <div>
                <label htmlFor="rsaKey" className="block text-sm font-medium text-gray-300 mb-1">
                  Clé RSA (optionnel)
                </label>
                <input
                  id="rsaKey"
                  name="rsaKey"
                  type="text"
                  value={newInstance.rsaKey}
                  onChange={handleInputChange}
                  placeholder="Chemin ou contenu de la clé RSA"
                  className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
  );
};

export default TerminalForm;