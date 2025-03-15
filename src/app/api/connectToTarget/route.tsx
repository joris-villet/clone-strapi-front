// app/api/connectToTarget/route.tsx
import { NextResponse } from 'next/server';
import { NodeSSH } from 'node-ssh';

// Définition des types
interface ConnectRequest {
  targetIP: string;
  username: string;
  password: string;
}

interface ConnectResponse {
  logs: string[];
}

interface ErrorResponse {
  message: string;
}

// Validation de l'adresse IP
const isValidIP = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

export async function POST(req: Request): Promise<NextResponse<ConnectResponse | ErrorResponse>> {
  const ssh = new NodeSSH();
  const logs: string[] = [];

  try {
    const body = await req.json() as ConnectRequest;
    const { targetIP, username, password } = body;

    // Validation des données
    if (!targetIP || !username || !password) {
      throw new Error('Missing required fields: targetIP, username, or password');
    }

    if (!isValidIP(targetIP)) {
      throw new Error('Invalid IP address format');
    }

    logs.push(`Command: Initializing connection to target server ${targetIP}...`);

    try {
      // Connexion SSH au serveur cible avec les identifiants fournis
      await ssh.connect({
        host: targetIP,
        username,
        password,
        readyTimeout: 10000, // 10 secondes timeout
        keepaliveInterval: 10000,
      });

      logs.push(`Output: Connection established successfully`);

      // Exécuter "ls -la /root" pour lister les fichiers du répertoire /root
      logs.push(`Command: Listing files in /root/...`);
      const lsResult = await ssh.execCommand('ls -la /root/');

      if (lsResult.stderr) {
        logs.push(`Error: ${lsResult.stderr}`);
        throw new Error(lsResult.stderr);
      }

      logs.push(`Output: Directory listing successful`);
      logs.push(lsResult.stdout);

      return NextResponse.json({ logs }, { status: 200 });

    } catch (sshError: any) {
      throw new Error(`SSH Connection Error: ${sshError.message}`);
    }

  } catch (error: any) {
    console.error('Connection error:', error);
    return NextResponse.json(
      { message: error.message, logs }, 
      { status: 500 }
    );

  } finally {
    // Toujours fermer la connexion SSH
    if (ssh.isConnected()) {
      ssh.dispose();
      logs.push('Connection closed');
    }
  }
}