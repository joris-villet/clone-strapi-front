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



const RenderStatusHistory = (history: string, instance: Instance) => {
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
          // onClick={() => handleStatus(instance)}
        />
      ))}
    </div>
  );
};


export default RenderStatusHistory;