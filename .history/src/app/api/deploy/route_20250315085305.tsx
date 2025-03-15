import { NodeSSH } from 'node-ssh';
import path from 'path';
import os from 'os';
import { NextRequest, NextResponse } from 'next/server';

// Définition des interfaces
interface SourceServer {
  ip: string;
  username: string;
}

interface DeploymentRequestBody {
  sourceServer: SourceServer;
  targetIP: string;
  targetPassword: string;
  installPath: string;
  domain: string;
  email: string;
  databaseType?: string;
  databaseConfig?: any;
  sourceInstancePath: string;
}

interface CommandResult {
  stdout: string;
  stderr: string;
}

export async function POST(req: NextRequest) {
  const logs: string[] = [];
  try {
    const body: DeploymentRequestBody = await req.json();
    const { 
      sourceServer,
      targetIP,
      targetPassword,
      installPath,
      domain,
      email,
      databaseType,
      databaseConfig,
      sourceInstancePath,
    } = body;

    // Validation des données
    if (!sourceServer || !sourceServer.ip || !sourceServer.username) {
      throw new Error('Invalid source server configuration');
    }
    if (!targetIP || !targetPassword || !installPath || !domain || !email || !sourceInstancePath) {
      throw new Error('Missing required deployment parameters');
    }

    // Port fixe pour Strapi sur le serveur cible
    const deployedPort: number = 1337;
    logs.push(`[Info] Deployed port set to ${deployedPort}`);

    // --- ETAPE 1 : Connexion au serveur source ---
    logs.push(`[Step 1] Connecting to source server ${sourceServer.ip}...`);
    const sshSource = new NodeSSH();
    await sshSource.connect({
      host: sourceServer.ip,
      username: sourceServer.username,
      privateKey: process.env.SSH_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      passphrase: process.env.SSH_PASSPHRASE,
      readyTimeout: 30000,
    });
    logs.push(`[Step 1] Connected to source server.`);

    // Création de l'archive
    const remoteTarPath: string = '/tmp/instance.tar.gz';
    logs.push(`[Step 2] Creating tar archive of instance at ${sourceInstancePath}...`);
    const tarCmd: string = `tar -czf ${remoteTarPath} -C $(dirname ${sourceInstancePath}) $(basename ${sourceInstancePath})`;
    const tarResult: CommandResult = await sshSource.execCommand(tarCmd);
    logs.push(`[Step 2] Archive creation result: ${tarResult.stdout || tarResult.stderr}`);

    // Téléchargement de l'archive
    const localTarPath: string = path.join(os.tmpdir(), 'instance.tar.gz');
    logs.push(`[Step 3] Downloading archive from source server to ${localTarPath}...`);
    await sshSource.getFile(localTarPath, remoteTarPath);
    logs.push(`[Step 3] Archive downloaded successfully.`);
    sshSource.dispose();

    // --- ETAPE 2 : Connexion au serveur cible ---
    logs.push(`[Step 4] Connecting to target server ${targetIP}...`);
    const sshTarget = new NodeSSH();
    await sshTarget.connect({
      host: targetIP,
      username: 'root',
      password: targetPassword,
      readyTimeout: 30000,
    });
    logs.push(`[Step 4] Connected to target server.`);

    // Configuration du chemin d'installation
    const fullInstallPath: string = `${installPath}/${domain}`;
    logs.push(`[Step 5] Full installation path set to ${fullInstallPath}.`);

    // Suppression de l'ancienne instance
    logs.push(`[Step 6] Removing old instance at ${fullInstallPath}...`);
    const cleanResult: CommandResult = await sshTarget.execCommand(`rm -rf ${fullInstallPath}`);
    logs.push(`[Step 6] Clean result: ${cleanResult.stdout || cleanResult.stderr || "Old instance removed."}`);

    // Création du répertoire d'installation
    logs.push(`[Step 7] Creating installation directory ${fullInstallPath}...`);
    const mkdirResult: CommandResult = await sshTarget.execCommand(`mkdir -p ${fullInstallPath}`);
    logs.push(`[Step 7] Directory creation result: ${mkdirResult.stdout || mkdirResult.stderr || "Directory created."}`);

    // Transfert de l'archive
    const remoteTargetTarPath: string = `${fullInstallPath}/instance.tar.gz`;
    logs.push(`[Step 8] Uploading archive to target server at ${remoteTargetTarPath}...`);
    await sshTarget.putFile(localTarPath, remoteTargetTarPath);
    logs.push(`[Step 8] Archive uploaded successfully.`);

    // Extraction de l'archive
    logs.push(`[Step 9] Extracting archive on target server with --strip-components=1...`);
    const extractCmd: string = `tar -xzf ${remoteTargetTarPath} --strip-components=1 -C ${fullInstallPath}`;
    const extractResult: CommandResult = await sshTarget.execCommand(extractCmd);
    logs.push(`[Step 9] Extraction result: ${extractResult.stdout || extractResult.stderr || "Archive extracted."}`);

    // Suppression de l'archive transférée
    await sshTarget.execCommand(`rm -f ${remoteTargetTarPath}`);
    logs.push(`[Step 9] Transferred archive removed.`);

    // --- ETAPE 3 : Configuration de l'environnement ---
    logs.push(`[Step 10] Generating .env file in ${fullInstallPath}...`);
    const envContent: string = `HOST=0.0.0.0
PORT=${deployedPort}
APP_KEYS=GiOWmlgPX0Xp+Nw+Mye6Tw==,5KzoTo1GLuErKXJgQ2TziA==,J9Red0VbsVWjMVcwDGR0Kg==,d3W2jk44qvGzNlWtQBmiAg==
API_TOKEN_SALT=CGfHUMK++5xuT7sOLlb+fg==
ADMIN_JWT_SECRET=1zRF5PVuxtht2EoVhIK0DA==
TRANSFER_TOKEN_SALT=g7dq2YK9ieTLvPj0SAe8mA==
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=srv/app/data.db
JWT_SECRET=rRxSgBV0qoukVoccn3rpUw==`;

    const createEnvCmd: string = `cat > ${fullInstallPath}/.env << 'EOF'
${envContent}
EOF`;
    const envResult: CommandResult = await sshTarget.execCommand(createEnvCmd);
    logs.push(`[Step 10] .env generation result: ${envResult.stdout || envResult.stderr || ".env file created."}`);

    // Installation des dépendances
    logs.push(`[Step 11] Installing project dependencies in ${fullInstallPath}...`);
    const installCmd: string = `cd ${fullInstallPath} && yarn install`;
    const installResult: CommandResult = await sshTarget.execCommand(installCmd);
    logs.push(`[Step 11] Installation result: ${installResult.stdout || installResult.stderr || "Dependencies installed."}`);

    // Construction du projet
    logs.push(`[Step 12] Building the project in ${fullInstallPath}...`);
    const buildCmd: string = `cd ${fullInstallPath} && yarn build`;
    const buildResult: CommandResult = await sshTarget.execCommand(buildCmd);
    logs.push(`[Step 12] Build result: ${buildResult.stdout || buildResult.stderr || "Project built."}`);

    // --- Finalisation ---
    logs.push(`[Final] Deployment completed successfully!`);
    sshTarget.dispose();

    return NextResponse.json({ 
      success: true, 
      logs,
      message: 'Deployment completed successfully'
    });

  } catch (error: any) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message, 
        logs 
      }, 
      { status: 500 }
    );
  }
}