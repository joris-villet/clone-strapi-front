// app/api/connectToTarget/route.tsx
import { NextResponse } from 'next/server';
import { NodeSSH } from 'node-ssh';

interface ConnectRequest {
  targetIP: string;
  username: string;
  password: string;
}

interface ConnectResponse {
  success: boolean;
  logs: string[];
  connectionStatus?: {
    sshConnection: boolean;
    rootAccess: boolean;
    diskSpace: string;
    systemInfo: string;
  };
}

interface ErrorResponse {
  success: boolean;
  message: string;
  logs: string[];
}

const isValidIP = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

export async function POST(req: Request): Promise<NextResponse<ConnectResponse | ErrorResponse>> {
  const ssh = new NodeSSH();
  const logs: string[] = [];
  const connectionStatus = {
    sshConnection: false,
    rootAccess: false,
    diskSpace: '',
    systemInfo: ''
  };

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

    logs.push(`[Info] Initializing connection to target server ${targetIP}...`);

    try {
      // Test de connexion SSH
      await ssh.connect({
        host: targetIP,
        username,
        password,
        readyTimeout: 10000,
        keepaliveInterval: 10000,
      });

      connectionStatus.sshConnection = true;
      logs.push(`[Success] SSH connection established successfully`);

      // Vérification des droits root
      logs.push(`[Info] Checking root access...`);
      const whoamiResult = await ssh.execCommand('whoami');
      if (whoamiResult.stdout.trim() === 'root') {
        connectionStatus.rootAccess = true;
        logs.push(`[Success] Root access confirmed`);
      } else {
        logs.push(`[Warning] Not running as root user (current user: ${whoamiResult.stdout.trim()})`);
      }

      // Vérification de l'espace disque
      logs.push(`[Info] Checking disk space...`);
      const dfResult = await ssh.execCommand('df -h /');
      connectionStatus.diskSpace = dfResult.stdout;
      logs.push(`[Info] Disk space information:\n${dfResult.stdout}`);

      // Vérification des informations système
      logs.push(`[Info] Checking system information...`);
      const systemInfoResult = await ssh.execCommand('cat /etc/os-release | grep PRETTY_NAME');
      connectionStatus.systemInfo = systemInfoResult.stdout;
      logs.push(`[Info] System information: ${systemInfoResult.stdout}`);

      // Vérification des ports utilisés
      logs.push(`[Info] Checking used ports...`);
      const portsResult = await ssh.execCommand('netstat -tulpn | grep LISTEN');
      logs.push(`[Info] Used ports:\n${portsResult.stdout}`);

      // Vérification de la mémoire disponible
      logs.push(`[Info] Checking available memory...`);
      const memoryResult = await ssh.execCommand('free -h');
      logs.push(`[Info] Memory information:\n${memoryResult.stdout}`);

      // Vérification des processus Node.js en cours
      logs.push(`[Info] Checking running Node.js processes...`);
      const nodeProcessesResult = await ssh.execCommand('ps aux | grep node');
      logs.push(`[Info] Node.js processes:\n${nodeProcessesResult.stdout}`);

      return NextResponse.json({
        success: true,
        logs,
        connectionStatus
      }, { status: 200 });

    } catch (sshError: any) {
      throw new Error(`SSH Connection Error: ${sshError.message}`);
    }

  } catch (error: any) {
    console.error('Connection error:', error);
    return NextResponse.json({
      success: false,
      message: error.message,
      logs
    }, { status: 500 });

  } finally {
    if (ssh.isConnected()) {
      ssh.dispose();
      logs.push('[Info] Connection closed');
    }
  }
}