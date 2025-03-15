// /lib/api/servers-client.ts
import axios from 'axios';

// Type pour un serveur
interface Server {
  id: string;
  name: string;
  username: string;
  ip: string;
  port: string;
  rsaKey?: string;
}

// URL de base de l'API
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function addServer(newServer: Omit<Server, 'id'>): Promise<Server> {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/servers`, newServer);
  return response.data;
}


export async function testServer(newServer: Omit<Server, 'id'>) {
  try {
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ssh/test-connection`, newServer);
    return data;
  }
  catch(err) {
    console.log(err)
    return err;
  }
}