// app/api/connectToSource/route.tsx
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';

// Définition des interfaces
interface ConnectRequest {
  ip: string;
  username: string;
  privateKeyPath?: string;
  passphrase?: string;
}

interface CommandResult {
  stdout: string;
  stderr: string;
}

interface ConnectResponse {
  logs: string[];
  instances?: string[];
}

interface ErrorResponse {
  message: string;
  logs?: string[];
}

// Validation de l'adresse IP
const isValidIP = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

export async function POST(req: Request): Promise<NextResponse<ConnectResponse | ErrorResponse>> {
  const logs: string[] = [];
  
  try {
    // Import dynamique de node-ssh
    const { NodeSSH } = await import('node-ssh');
    const ssh = new NodeSSH();

    const body = await req.json() as ConnectRequest;
    const { ip, username } = body;

    // Validation des entrées
    if (!ip || !username) {
      throw new Error("Les propriétés 'ip' et 'username' sont requises");
    }

    if (!isValidIP(ip)) {
      throw new Error("Format d'adresse IP invalide");
    }

    // Récupération des variables d'environnement
    const rawPrivateKey = process.env.SSH_PRIVATE_KEY;
    const passphrase = process.env.SSH_PASSPHRASE;

    if (!rawPrivateKey) {
      throw new Error("La variable d'environnement SSH_PRIVATE_KEY n'est pas définie");
    }

    // Préparation de la clé privée
    const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

    logs.push(`Command: Initializing connection to source server ${ip}...`);

    try {
      // Connexion SSH
      await ssh.connect({
        host: ip,
        username,
        privateKey,
        passphrase,
        readyTimeout: 10000, // 10 secondes timeout
        keepaliveInterval: 10000,
      });

      logs.push(`Output: Connection established successfully`);

      // Test de connexion
      const connectResult = await ssh.execCommand('echo "Connected"') as CommandResult;
      logs.push(`Output: ${connectResult.stdout}`);

      // Vérification de l'espace disque
      logs.push(`Command: Checking disk space...`);
      const diskResult = await ssh.execCommand('df -h /') as CommandResult;
      if (diskResult.stderr) {
        logs.push(`Error: ${diskResult.stderr}`);
      } else {
        logs.push(`Output: ${diskResult.stdout}`);
      }

      // Vérification de la mémoire
      logs.push(`Command: Checking memory...`);
      const memoryResult = await ssh.execCommand('free -h') as CommandResult;
      if (memoryResult.stderr) {
        logs.push(`Error: ${memoryResult.stderr}`);
      } else {
        logs.push(`Output: ${memoryResult.stdout}`);
      }

      // Liste des instances Strapi
      logs.push(`Command: Checking Strapi instances...`);
      const listResult = await ssh.execCommand('ls /root/strapi-project/') as CommandResult;
      if (listResult.stderr) {
        logs.push(`Error: ${listResult.stderr}`);
      } else {
        logs.push(`Output: ${listResult.stdout}`);
        // Conversion de la sortie en tableau d'instances
        const instances = listResult.stdout
          .split('\n')
          .filter(line => line.trim().length > 0);

        return NextResponse.json({ 
          logs,
          instances 
        }, { status: 200 });
      }

    } catch (sshError: any) {
      throw new Error(`SSH Connection Error: ${sshError.message}`);
    } finally {
      if (ssh.isConnected()) {
        ssh.dispose();
        logs.push('Connection closed');
      }
    }

  } catch (error: any) {
    console.error('Connection error:', error);
    return NextResponse.json(
      { 
        message: error.message,
        logs 
      }, 
      { status: 500 }
    );
  }

  // Retour par défaut si aucune condition précédente n'est remplie
  return NextResponse.json({ logs }, { status: 200 });
}