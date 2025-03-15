// app/api/listInstances/route.tsx
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';

// Définition des interfaces
interface ListInstancesRequest {
  ip: string;
  username: string;
  passphrase?: string;
  privateKeyPath?: string;
}

interface Instance {
  id: string;
  name: string;
  path: string;
}

interface ListInstancesResponse {
  instances: Instance[];
  message?: string;
}

interface ErrorResponse {
  message: string;
}

// Validation de l'adresse IP
const isValidIP = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

// Fonction pour nettoyer et valider le chemin
const sanitizePath = (path: string): string => {
  return path.replace(/[^a-zA-Z0-9-_/]/g, '').replace(/\/+/g, '/');
};

export async function POST(req: Request): Promise<NextResponse<ListInstancesResponse | ErrorResponse>> {
  try {
    // Import dynamique de NodeSSH
    const { NodeSSH } = await import('node-ssh');
    const ssh = new NodeSSH();

    // Récupération et validation des données de la requête
    const body = await req.json() as ListInstancesRequest;
    const { ip, username, passphrase } = body;

    // Validation des entrées
    if (!ip || !username) {
      throw new Error("Les propriétés 'ip' et 'username' sont requises");
    }

    if (!isValidIP(ip)) {
      throw new Error("Format d'adresse IP invalide");
    }

    // Récupération de la clé privée depuis les variables d'environnement
    const rawPrivateKey = process.env.SSH_PRIVATE_KEY;
    if (!rawPrivateKey) {
      throw new Error("La variable d'environnement SSH_PRIVATE_KEY n'est pas définie");
    }

    // Préparation de la clé privée
    const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

    try {
      // Connexion SSH avec timeout et keepalive
      await ssh.connect({
        host: ip,
        username,
        privateKey,
        passphrase: passphrase || "Oskarek",
        readyTimeout: 10000,
        keepaliveInterval: 10000,
      });

      // Recherche des instances dans le répertoire principal
      let listResult = await ssh.execCommand('ls /root/strapi-project/');
      let instances: Instance[] = [];

      if (listResult.stdout.trim()) {
        // Instances trouvées dans /root/strapi-project/
        instances = listResult.stdout
          .trim()
          .split('\n')
          .filter(dir => dir.length > 0)
          .map(dir => ({
            id: dir,
            name: dir,
            path: sanitizePath(`/root/strapi-project/${dir}`)
          }));
      } else {
        // Recherche dans /root/ si rien n'est trouvé dans /root/strapi-project/
        listResult = await ssh.execCommand('ls /root/');
        instances = listResult.stdout
          .trim()
          .split('\n')
          .filter(dir => dir.toLowerCase().includes('strapi'))
          .map(dir => ({
            id: dir,
            name: dir,
            path: sanitizePath(`/root/${dir}`)
          }));
      }

      return NextResponse.json({
        instances,
        message: instances.length > 0 
          ? `${instances.length} instance(s) trouvée(s)`
          : "Aucune instance Strapi trouvée"
      }, { status: 200 });

    } catch (sshError: any) {
      throw new Error(`Erreur SSH : ${sshError.message}`);
    } finally {
      // Fermeture de la connexion SSH
      if (ssh.isConnected()) {
        ssh.dispose();
      }
    }

  } catch (error: any) {
    console.error('Error listing instances:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}