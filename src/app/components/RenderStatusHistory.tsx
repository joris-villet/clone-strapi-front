// interface Instance {
//   id: string;
//   name: string;
//   url: string;
//   interval: number;
//   status: string;
//   statusHistory: string; // JSON stringified array
//   color?: string; // Optionnel, pour la gestion des couleurs
//   statusCode?: number;
//   statusText?: string;
//   date?: string;
// }



// const RenderStatusHistory = (history: string, instance: Instance, openModal: any) => {
//   let parsedHistory = [];
//   try {
//     parsedHistory = JSON.parse(history || "[]");
//   } catch (error) {
//     console.error("Erreur lors du parsing de l'historique :", error);
//     return null;
//   }

//   // Limiter à 10 éléments
//   const limitedHistory = parsedHistory.slice(-10); // Prend les 10 derniers éléments

//   return (
//     <div className="flex space-x-1">
//       {limitedHistory.map((key: { color: string }, index: number) => (
//         <div
//           key={index}
//           className="w-[10px] h-[20px] rounded-full cursor-pointer"
//           style={{ backgroundColor: key.color }}
//           onClick={() => openModal(instance)}
//         />
//       ))}
//     </div>
//   );
// };


// export default RenderStatusHistory;
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

interface HistoryItem {
  color: string;
  // Ajoutez d'autres propriétés si nécessaire
}

interface RenderStatusHistoryProps {
  history: string;
  instance: Instance;
  onHistoryItemClick: (instance: Instance, historyItem: HistoryItem, index: number) => void;
}

const RenderStatusHistory = ({ history, instance, onHistoryItemClick }: RenderStatusHistoryProps) => {
  let parsedHistory: HistoryItem[] = [];
  try {
    parsedHistory = JSON.parse(history || "[]");
  } catch (error) {
    console.error("Erreur lors du parsing de l'historique :", error);
    return null;
  }

  // Limiter à 10 éléments
  const limitedHistory = parsedHistory.slice(-10);

  return (
    <div className="flex space-x-1">
      {limitedHistory.map((historyItem: HistoryItem, index: number) => (
        <div
          key={index}
          className="w-[10px] h-[20px] rounded-full cursor-pointer"
          style={{ backgroundColor: historyItem.color }}
          onClick={() => onHistoryItemClick(instance, historyItem, index)}
        />
      ))}
    </div>
  );
};

export default RenderStatusHistory;