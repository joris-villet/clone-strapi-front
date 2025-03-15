import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Type pour une instance
interface Instance {
  id?: number; // Peut être optionnel si généré automatiquement
  name: string;
  url: string;
  interval: number;
  statusHistory: string; // JSON stringifié
  status: string;
}



export async function GET() {
  try {

    console.log(API_BASE_URL)
    // Effectuer une requête GET vers votre route Express
    const response = await axios.get(`${API_BASE_URL}/instances`);

    // Retourner les données récupérées
    return NextResponse.json(response.data);
  } catch (err: any) {
    console.error('Erreur lors de la récupération des instances via API:', err);

    // Retourner une erreur si la requête échoue
    return NextResponse.json(
      { message: 'Impossible de récupérer les instances via l\'API' },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    // Récupérer le corps de la requête
    const body: Instance = await req.json();
    console.log('body =>', body);

    // Effectuer une requête POST vers votre backend Express
    const response = await axios.post(`${API_BASE_URL}/instances`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Retourner la réponse du backend Express
    return NextResponse.json(response.data, { status: response.status });
  } catch (err: any) {
    console.error('Erreur lors de l\'ajout de l\'instance via API:', err);

    // Retourner une erreur si la requête échoue
    return NextResponse.json(
      { message: 'Erreur lors de l\'ajout de l\'instance via l\'API' },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer une instance par ID
export async function DELETE(request: Request) {
  try {
    // Récupérer l'ID depuis les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'ID non spécifié' },
        { status: 400 }
      );
    }

    // Effectuer une requête DELETE vers votre backend Express
    const response = await axios.delete(`${API_BASE_URL}/instances`, {
      params: { id },
    });

    // Retourner la réponse du backend Express
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'instance via API:', error);

    // Retourner une erreur si la requête échoue
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de l\'instance via l\'API' },
      { status: 500 }
    );
  }
}