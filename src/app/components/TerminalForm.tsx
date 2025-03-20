// 'use client';

// import React, { useState } from 'react';
// import { testServer } from '../api/servers';
// import { TiInputChecked } from "react-icons/ti";
// import { ImCross } from "react-icons/im";

// interface ServerFormData {
//   name: string;      // Nouveau champ pour le nom du serveur
//   username: string;
//   password: string;
//   ip: string;
//   port: string;
//   connexionVerified: boolean;
//   rsaKey: string;
// }

// interface TerminalFormProps {
//   onAddServer: (server: ServerFormData, connexionVerified: boolean) => void;
// }

// const TerminalForm: React.FC<TerminalFormProps> = ({ onAddServer }) => {
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [serverIsVerified, setServerIsVerified] = useState(false);
//   const [serverWrong, setServerWrong] = useState(false);
//   const [newInstance, setNewInstance] = useState<ServerFormData>({
//     name: '',        // Initialisation du nom
//     username: '',
//     password: '',
//     ip: '',
//     port: '',
//     connexionVerified: false,
//     rsaKey: '',
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setNewInstance((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const addInstance = async (e: React.FormEvent) => {
//     e.preventDefault();

//     setLoading(true)

//     const result = await testServer(newInstance)

//     console.log('result => ', result)

//     if (!!result.success) {

//       setServerIsVerified(true);

//       onAddServer(newInstance, true);
      
//       setLoading(false);
      
//       setTimeout(() => {
//         setServerIsVerified(false);
//         setIsFormVisible(false);
//       }, 2000);

//     } else {
//       setLoading(false);
//       setServerWrong(true);

//       setTimeout(() => {
//         setServerWrong(false);
//         // setIsFormVisible(false);
//       }, 2000);
//       return;
//     }

//     setNewInstance({
//       name: '',
//       username: '',
//       password: '',
//       ip: '',
//       port: '',
//       connexionVerified: false,
//       rsaKey: '',
//     });
//   };

//   return (
//     <div className="rounded-lg shadow-sm bg-[#11111666]/40 backdrop-blur-sm border border-white/10">
//       <div className="p-4 border-b border-white/10 flex justify-between items-center">
//         <h2 className="font-bold text-gray-300 text-xl">Ajouter un serveur distant</h2>
//         <button
//           type="button"
//           onClick={() => setIsFormVisible(!isFormVisible)}
//           className="text-gray-300 hover:text-white transition-colors bg-blue-500 rounded-md shadow-2xl p-0.5 cursor-pointer"
//           aria-expanded={isFormVisible}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className={`h-6 w-6 transition-transform duration-300 ${isFormVisible ? 'rotate-180' : ''}`}
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//           </svg>
//         </button>
//       </div>

//       {/* Formulaire qui s'affiche/se masque */}
//       <div
//         className={`overflow-hidden transition-all duration-500 ease-in-out ${isFormVisible ? 'max-h-[500px] opacity-100 transform translate-y-0' : 'max-h-0 opacity-0 transform -translate-y-4'
//           }`}
//       >
//         <div className="p-4">
//           <form onSubmit={addInstance}>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//               {/* Nom du serveur */}
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
//                   Nom du serveur
//                 </label>
//                 <input
//                   id="name"
//                   name="name"
//                   value={newInstance.name}
//                   onChange={handleInputChange}
//                   placeholder="Production DB"
//                   className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>

//               {/* Username */}
//               <div>
//                 <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
//                   Nom d'utilisateur
//                 </label>
//                 <input
//                   id="username"
//                   name="username"
//                   value={newInstance.username}
//                   onChange={handleInputChange}
//                   placeholder="root"
//                   className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>

//               {/* Password */}
//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
//                   Mot de passe
//                 </label>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   value={newInstance.password}
//                   onChange={handleInputChange}
//                   placeholder="Mot de passe"
//                   className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>

//               {/* IP Address */}
//               <div>
//                 <label htmlFor="ip" className="block text-sm font-medium text-gray-300 mb-1">
//                   Adresse IP
//                 </label>
//                 <input
//                   id="ip"
//                   name="ip"
//                   type="text"
//                   value={newInstance.ip}
//                   onChange={handleInputChange}
//                   placeholder="192.168.1.1"
//                   className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>

//               {/* Port */}
//               <div>
//                 <label htmlFor="port" className="block text-sm font-medium text-gray-300 mb-1">
//                   Port SSH
//                 </label>
//                 <input
//                   id="port"
//                   name="port"
//                   type="text"
//                   value={newInstance.port}
//                   onChange={handleInputChange}
//                   placeholder="22"
//                   className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>

//               {/* RSA Key (optionnel) */}
//               <div>
//                 <label htmlFor="rsaKey" className="block text-sm font-medium text-gray-300 mb-1">
//                   Clé RSA (optionnel)
//                 </label>
//                 <input
//                   id="rsaKey"
//                   name="rsaKey"
//                   type="text"
//                   value={newInstance.rsaKey}
//                   onChange={handleInputChange}
//                   placeholder="Chemin ou contenu de la clé RSA"
//                   className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//               </svg>
//               Ajouter le serveur
//             </button>
//           </form>
//         </div>
//         {loading && (
//           <div className="my-4 flex items-center justify-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//             <span className="ml-2 text-gray-300">Vérification du serveur...</span>
//           </div>
//         )}
//         {serverIsVerified && (
//           <div className="my-4 flex items-center justify-center">
//             <TiInputChecked color='#4ff554' size={30} />
//             <span className="ml-2 text-gray-300">Serveur vérifié</span>
//           </div>
//         )}
//         {serverWrong && (
//           <div className="my-4 flex items-center justify-center">
//             <ImCross color='red' size={30} />
//             <span className="ml-2 text-gray-300">Serveur non trouvé</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TerminalForm;


'use client';

import React, { useState } from 'react';
import { testServer } from '../api/servers';
import { TiInputChecked } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { useServerStore } from '../stores/servers';
import type { IServer } from '../../interfaces';

interface ServerFormData {
  name: string;      // Nouveau champ pour le nom du serveur
  username: string;
  password: string;
  ip: string;
  port: string;
  connexionVerified: boolean;
  rsaKey: string;
}

// interface TerminalFormProps {
//   onAddServer: (server: ServerFormData, connexionVerified: boolean) => void;
// }

const TerminalForm: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverIsVerified, setServerIsVerified] = useState(false);
  const [serverWrong, setServerWrong] = useState(false);
  const useServer = useServerStore();
  const [newInstance, setNewInstance] = useState<ServerFormData>({
    name: '',        // Initialisation du nom
    username: '',
    password: '',
    ip: '',
    port: '',
    connexionVerified: false,
    rsaKey: '',
  });

  const addServer = async (newServer: Omit<IServer, 'id'>) => {
    
    try {
      useServer.addServer(newServer);
    } catch(err) {
      console.error('Erreur lors de l\'ajout du serveur:', err);
    }

  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewInstance((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addInstance = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true)

    const result = await testServer(newInstance)

    console.log('result => ', result)

    if (!!result.success) {

      setServerIsVerified(true);

      addServer(newInstance);
      
      setLoading(false);
      
      setTimeout(() => {
        setServerIsVerified(false);
        setIsFormVisible(false);
      }, 2000);

    } else {
      setLoading(false);
      setServerWrong(true);

      setTimeout(() => {
        setServerWrong(false);
        // setIsFormVisible(false);
      }, 2000);
      return;
    }

    setNewInstance({
      name: '',
      username: '',
      password: '',
      ip: '',
      port: '',
      connexionVerified: false,
      rsaKey: '',
    });
  };

  return (
    <div className="rounded-lg shadow-sm bg-[#11111666]/40 backdrop-blur-sm border border-white/10">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="font-bold text-gray-300 text-xl">Ajouter un serveur distant</h2>
        <button
          type="button"
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="text-gray-300 hover:text-white transition-colors bg-blue-500 rounded-md shadow-2xl p-0.5 cursor-pointer"
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
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isFormVisible ? 'max-h-[500px] opacity-100 transform translate-y-0' : 'max-h-0 opacity-0 transform -translate-y-4'
          }`}
      >
        <div className="p-4">
          <form onSubmit={addInstance}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Nom du serveur */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nom du serveur
                </label>
                <input
                  id="name"
                  name="name"
                  value={newInstance.name}
                  onChange={handleInputChange}
                  placeholder="Production DB"
                  className="bg-[#1D2C42]/70 text-white w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

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

              {/* Port */}
              <div>
                <label htmlFor="port" className="block text-sm font-medium text-gray-300 mb-1">
                  Port SSH
                </label>
                <input
                  id="port"
                  name="port"
                  type="text"
                  value={newInstance.port}
                  onChange={handleInputChange}
                  placeholder="22"
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
              Ajouter le serveur
            </button>
          </form>
        </div>
        {loading && (
          <div className="my-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-300">Vérification du serveur...</span>
          </div>
        )}
        {serverIsVerified && (
          <div className="my-4 flex items-center justify-center">
            <TiInputChecked color='#4ff554' size={30} />
            <span className="ml-2 text-gray-300">Serveur vérifié</span>
          </div>
        )}
        {serverWrong && (
          <div className="my-4 flex items-center justify-center">
            <ImCross color='red' size={30} />
            <span className="ml-2 text-gray-300">Serveur non trouvé</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalForm;

