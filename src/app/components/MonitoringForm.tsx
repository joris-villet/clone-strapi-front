// 'use client'

// import { useState } from "react";


// export default function MonitoringForm() {

//   const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

//   return (
//     <div className="p-4 border-b border-white/10 flex justify-between items-center">
//       <h2 className="font-bold text-gray-300 text-xl">Ajouter une nouvelle instance</h2>
//       <button
//         type="button"
//         onClick={() => setIsFormVisible(!isFormVisible)}
//         className="text-gray-300 hover:text-white transition-colors bg-blue-500 cursor-pointer rounded-md shadow-2xl p-1"
//         aria-expanded={isFormVisible}
//       >
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           className={`h-6 w-6 transition-transform duration-300 ${isFormVisible ? 'rotate-180' : ''}`}
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>
//     </div>
//   )

// }