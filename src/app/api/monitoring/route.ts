// import axios from 'axios'

// export async function POST(req: Request) {
//   try {
//     const { id, url } = await req.json();

//     // Effectuer une requête POST vers votre backend à la route /api/monitoring
//     const response = await axios.post('/api/monitoring', { id, url });

//     // Retourner la réponse du backend
//     return new Response(JSON.stringify(response.data), {
//       status: response.status,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error: any) {
//     console.error('Erreur lors de la requête vers /api/monitoring:', error);

//     // Gérer les erreurs et retourner une réponse appropriée
//     if (error.response) {
//       // Erreur côté serveur (backend)
//       return new Response(
//         JSON.stringify({ message: 'Erreur côté backend', error: error.response.data }),
//         { status: error.response.status, headers: { 'Content-Type': 'application/json' } }
//       );
//     } else if (error.request) {
//       // Aucune réponse reçue
//       return new Response(
//         JSON.stringify({ message: 'Aucune réponse reçue du backend', error: error.message }),
//         { status: 500, headers: { 'Content-Type': 'application/json' } }
//       );
//     } else {
//       // Erreur lors de la configuration de la requête
//       return new Response(
//         JSON.stringify({ message: 'Erreur lors de la configuration de la requête', error: error.message }),
//         { status: 500, headers: { 'Content-Type': 'application/json' } }
//       );
//     }
//   }
// }


import axios from 'axios';
import { NextResponse } from 'next/server';

// URL de base pour les requêtes API
const API_BASE_URL = 'http://localhost:4000/api';

export async function POST(req: Request) {
  try {
    const { id, url } = await req.json();

    // Étape 1: Vérifier le statut de l'URL
    let status = 'offline';
    let color = 'red';
    let statusCode = 0;
    let statusText = "";
    let date = "";

    try {
      // Cette partie reste inchangée car nous voulons vérifier l'URL directement
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);
      
      statusCode = response.status;
      statusText = response.statusText;
      date = response.headers.get('date') ?? '';
      
      if (response.ok) {
        status = 'online';
        color = '#4ff554';
      } else {
        status = 'offline';
        
        if (statusCode >= 400 && statusCode < 500) {
          color = '#fa9921'; // Orange pour les erreurs client
        } else if (statusCode >= 500) {
          color = '#fa4521'; 
        } else if (statusCode >= 300 && statusCode < 400) {
          color = '#21b4fa'; 
        }
      }
    } catch (error) {
      console.error('Erreur lors de la requête vers l\'instance:', error);
      statusText = error instanceof Error ? error.message : 'Erreur de connexion';
    }

    // Étape 2: Récupérer l'historique des statuts depuis le backend
    let statusHistory = [];
    try {
      const historyResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/instances/${id}`);
      if (historyResponse.data && historyResponse.data.statusHistory) {
        try {
          statusHistory = JSON.parse(historyResponse.data.statusHistory);
        } catch (e) {
          console.error('Erreur parsing statusHistory:', e);
          statusHistory = [];
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      // Continuer avec un historique vide si la récupération échoue
    }

    // Étape 3: Ajouter le nouveau statut à l'historique
    statusHistory.push({
      color,
      status,
      statusCode,
      statusText,
      date,
      timestamp: new Date().toISOString()
    });

    // Limiter l'historique aux 10 dernières entrées
    if (statusHistory.length > 10) {
      statusHistory = statusHistory.slice(-10);
    }

    // Étape 4: Mettre à jour l'instance via le backend
    try {
      const updateResponse = await axios.put(`${API_BASE_URL}/instances/${id}`, {
        status,
        statusHistory,
        statusCode,
        statusText,
        date
      });
      
      // Retourner la réponse
      return NextResponse.json({
        message: 'Status mis à jour',
        status,
        statusHistory,
        statusCode,
        statusText,
        date,
        color
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'instance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      return NextResponse.json(
        { message: 'Erreur lors de la mise à jour de l\'instance', error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur monitoring:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    return NextResponse.json(
      { message: 'Erreur lors du monitoring', error: errorMessage },
      { status: 500 }
    );
  }
}