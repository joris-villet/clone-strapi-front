


import axios from 'axios';
import { NextResponse } from 'next/server';


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
      //console.log(`${process.env.NEXT_PUBLIC_API_URL}/instance/${id}`);

      const historyResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/instance/${id}`);

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
      const updateResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/instance/${id}`, {
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