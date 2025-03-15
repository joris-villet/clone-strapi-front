// app/api/readSourceFile/route.tsx
import { NextResponse } from 'next/server';

// Définition des interfaces
interface ReadFileRequest {
  ip: string;
  username: string;
  filePath: string;
  passphrase?: string;
}

interface ReadFileResponse {
  logs: string[];
  content: string;
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

// Validation du chemin de fichier
const isValidFilePath = (path: string): boolean => {
  // Vérifie que le chemin ne contient pas de caractères dangereux
  const invalidChars = /[;&|"`'$\\]/;
  return !invalidChars.test(path) && path.startsWith('/') && !path.includes('..');
};

// Fonction pour nettoyer le chemin du fichier
const sanitizeFilePath = (path: string): string => {
  return path
    .replace(/[^a-zA-Z0-9-_./]/g, '') // Garde uniquement les caractères sûrs
    .replace(/\/+/g, '/'); // Évite les doubles slashes
};

export async function POST(req: Request): Promise<NextResponse<ReadFileResponse | ErrorResponse>> {
  const logs: string[] = [];
  
  try {
    // Récupération et validation des données de la requête
    const body = await req.json() as ReadFileRequest;
    const { ip, username, filePath } = body;

    // Validation des entrées
    if (!ip || !username || !filePath) {
      throw new Error("Les propriétés 'ip', 'username' et 'filePath' sont requises");
    }

    if (!isValidIP(ip)) {
      throw new Error("Format d'adresse IP invalide");
    }

    if (!isValidFilePath(filePath)) {
      throw new Error("Chemin de fichier invalide ou potentiellement dangereux");
    }

    // Nettoyage du chemin du fichier
    const sanitizedFilePath = sanitizeFilePath(filePath);

    // Import dynamique de node-ssh
    const { NodeSSH } = await import('node-ssh');
    const ssh = new NodeSSH();

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
      // Connexion SSH avec timeout et keepalive
      await ssh.connect({
        host: ip,
        username,
        privateKey,
        passphrase,
        readyTimeout: 10000,
        keepaliveInterval: 10000,
      });

      logs.push(`Output: Connection established successfully`);
      logs.push(`Command: Reading file ${sanitizedFilePath}...`);

      // Vérifier d'abord si le fichier existe
      const checkFile = await ssh.execCommand(`test -f "${sanitizedFilePath}" && echo "exists"`);
      if (!checkFile.stdout.includes('exists')) {
        throw new Error(`Le fichier ${sanitizedFilePath} n'existe pas`);
      }

      // Vérifier les permissions
      const checkPerms = await ssh.execCommand(`test -r "${sanitizedFilePath}" && echo "readable"`);
      if (!checkPerms.stdout.includes('readable')) {
        throw new Error(`Le fichier ${sanitizedFilePath} n'est pas lisible`);
      }

      // Lire le contenu du fichier
      const result = await ssh.execCommand(`cat "${sanitizedFilePath}"`);
      
      if (result.stderr) {
        throw new Error(`Erreur lors de la lecture du fichier: ${result.stderr}`);
      }

      logs.push(`Output: File content retrieved successfully`);

      return NextResponse.json({
        logs,
        content: result.stdout
      }, { status: 200 });

    } catch (sshError: any) {
      throw new Error(`Erreur SSH : ${sshError.message}`);
    } finally {
      if (ssh.isConnected()) {
        ssh.dispose();
        logs.push('Connection closed');
      }
    }

  } catch (error: any) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { 
        message: error.message,
        logs 
      }, 
      { status: 500 }
    );
  }
}