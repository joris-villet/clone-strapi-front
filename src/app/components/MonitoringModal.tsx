'use client'

import { FaWindowClose } from "react-icons/fa";
import type { Instance } from "../../interfaces";

interface Props {
  instance: Instance;
  historyItem?: {
    instance: Instance;
    item: any;  // ou définissez un type plus précis
    index: number;
  };
  onClick: () => void;
}

// export default function MonitoringModal({ instance,  onClick }: Props) {


//   return (
//     <div className="absolute top-1/2 left-1/2 -translate-1/2 shadow-2xl  w-[600px] h-[400px] p-4 border-b bg-[#3A6A9B]/30 backdrop-blur-sm border border-[#3A6A9B]/40 rounded-lg">
//       <div className="relative">
//         <button onClick={onClick} className="absolute top-2 right-2 cursor-pointer">
//           <FaWindowClose color="red" size={25}/>
//         </button>
//         <div>
//           content
//         </div>
//       </div>
//     </div>
//   )
// }

export default function MonitoringModal({ instance, historyItem, onClick }: Props) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-1/2 shadow-2xl w-[600px] h-[400px] p-4 border-b bg-[#3A6A9B]/30 backdrop-blur-sm border border-[#3A6A9B]/40 rounded-lg">
      <div className="relative">
        <button onClick={onClick} className="absolute top-2 right-2 cursor-pointer">
          <FaWindowClose color="red" size={25}/>
        </button>
        <div className="text-center">
          <h2 className="text-[2rem]">{instance.name}</h2>
          <a href={instance.url} target="_blank" className="text-blue-500">{instance.url}</a>
          {historyItem && (
            <div>
              <p>Élément d'historique #{historyItem.index + 1}</p>
              <div 
                className="w-[20px] h-[20px] rounded-full" 
                style={{ backgroundColor: historyItem.item.color }}
              />
              <h3>{historyItem.item.status}</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}