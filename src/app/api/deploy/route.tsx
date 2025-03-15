// app/api/deploy/route.tsx
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

    // Port fixe pour Strapi sur le serveur cible
    const deployedPort: number = 1337;
    logs.push(`[Info] Deployed port set to ${deployedPort}`);

    // --- ETAPE 1 : Création de l'archive sur le serveur source ---
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

    // On archive l'intégralité du dossier de l'instance
    const remoteTarPath: string = '/tmp/instance.tar.gz';
    logs.push(`[Step 2] Creating tar archive of instance at ${sourceInstancePath}...`);
    const tarCmd: string = `tar -czf ${remoteTarPath} -C $(dirname ${sourceInstancePath}) $(basename ${sourceInstancePath})`;
    const tarResult: CommandResult = await sshSource.execCommand(tarCmd);
    logs.push(`[Step 2] Archive creation result: ${tarResult.stdout || tarResult.stderr}`);

    const localTarPath: string = path.join(os.tmpdir(), 'instance.tar.gz');
    logs.push(`[Step 3] Downloading archive from source server to ${localTarPath}...`);
    await sshSource.getFile(localTarPath, remoteTarPath);
    logs.push(`[Step 3] Archive downloaded successfully.`);
    sshSource.dispose();

    // --- ETAPE 2 : Transfert et extraction sur le serveur cible ---
    logs.push(`[Step 4] Connecting to target server ${targetIP}...`);
    const sshTarget = new NodeSSH();
    await sshTarget.connect({
      host: targetIP,
      username: 'root',
      password: targetPassword,
      readyTimeout: 30000,
    });
    logs.push(`[Step 4] Connected to target server.`);

    const fullInstallPath: string = `${installPath}/${domain}`;
    logs.push(`[Step 5] Full installation path set to ${fullInstallPath}.`);

    logs.push(`[Step 6] Removing old instance at ${fullInstallPath}...`);
    const cleanResult: CommandResult = await sshTarget.execCommand(`rm -rf ${fullInstallPath}`);
    logs.push(`[Step 6] Clean result: ${cleanResult.stdout || cleanResult.stderr || "Old instance removed."}`);

    logs.push(`[Step 7] Creating installation directory ${fullInstallPath}...`);
    const mkdirResult: CommandResult = await sshTarget.execCommand(`mkdir -p ${fullInstallPath}`);
    logs.push(`[Step 7] Directory creation result: ${mkdirResult.stdout || mkdirResult.stderr || "Directory created."}`);

    const remoteTargetTarPath: string = `${fullInstallPath}/instance.tar.gz`;
    logs.push(`[Step 8] Uploading archive to target server at ${remoteTargetTarPath}...`);
    await sshTarget.putFile(localTarPath, remoteTargetTarPath);
    logs.push(`[Step 8] Archive uploaded successfully.`);

    logs.push(`[Step 9] Extracting archive on target server with --strip-components=1...`);
    const extractCmd: string = `tar -xzf ${remoteTargetTarPath} --strip-components=1 -C ${fullInstallPath}`;
    const extractResult: CommandResult = await sshTarget.execCommand(extractCmd);
    logs.push(`[Step 9] Extraction result: ${extractResult.stdout || extractResult.stderr || "Archive extracted."}`);

    await sshTarget.execCommand(`rm -f ${remoteTargetTarPath}`);
    logs.push(`[Step 9] Transferred archive removed.`);

    // --- ETAPE 9.1 : Listing content in installation directory ---
    logs.push(`[Step 9.1] Listing files in ${fullInstallPath}...`);
    const lsResult: CommandResult = await sshTarget.execCommand(`ls -la ${fullInstallPath}`);
    logs.push(`[Step 9.1] Directory listing:\n${lsResult.stdout || lsResult.stderr}`);

    // --- ETAPE 2.5 : Génération du fichier .env pour Strapi ---
    logs.push(`[Step 9.5] Generating .env file in ${fullInstallPath}...`);
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
    logs.push(`[Step 9.5] .env generation result: ${envResult.stdout || envResult.stderr || ".env file created."}`);

    // --- ETAPE 3 : Installation de l'instance clonée ---
    logs.push(`[Step 10] Checking for package.json in ${fullInstallPath}...`);
    const pkgCheck: CommandResult = await sshTarget.execCommand(
      `[ -f ${fullInstallPath}/package.json ] && echo "package.json exists" || echo "package.json not found"`
    );
    logs.push(`[Step 10] Package.json check: ${pkgCheck.stdout}`);

    logs.push(`[Step 11] Installing project dependencies in ${fullInstallPath}...`);
    const installCmd: string = `cd ${fullInstallPath} && yarn install`;
    const installResult: CommandResult = await sshTarget.execCommand(installCmd);
    logs.push(`[Step 11] Installation result: ${installResult.stdout || installResult.stderr || "Dependencies installed."}`);

    logs.push(`[Step 12] Building the project in ${fullInstallPath}...`);
    const buildCmd: string = `cd ${fullInstallPath} && yarn build`;
    const buildResult: CommandResult = await sshTarget.execCommand(buildCmd);
    logs.push(`[Step 12] Build result: ${buildResult.stdout || buildResult.stderr || "Project built."}`);

    // --- ETAPE 3.5 : Sauvegarde/restauration de la base de données ---
    logs.push(`[Step 13] Backing up SQLite database if exists...`);
    const backupCmd: string = `mkdir -p ${fullInstallPath}/database_backup && if [ -f ${fullInstallPath}/.tmp/data.db ]; then cp ${fullInstallPath}/.tmp/data.db ${fullInstallPath}/database_backup/data.db_backup; else echo "No SQLite database found"; fi`;
    const backupResult: CommandResult = await sshTarget.execCommand(backupCmd);
    logs.push(`[Step 13] Backup result: ${backupResult.stdout || backupResult.stderr}`);

    logs.push(`[Step 14] Restoring SQLite database from backup if exists...`);
    const restoreCmd: string = `if [ -f ${fullInstallPath}/database_backup/data.db_backup ]; then cp ${fullInstallPath}/database_backup/data.db_backup ${fullInstallPath}/.tmp/data.db; else echo "No backup file found"; fi`;
    const restoreResult: CommandResult = await sshTarget.execCommand(restoreCmd);
    logs.push(`[Step 14] Restore result: ${restoreResult.stdout || restoreResult.stderr}`);

    // --- ETAPE 4 : Configuration et lancement (PM2 et Nginx) ---
    logs.push(`[Step 15] Installing PM2 globally...`);
    const pm2InstallCmd: string = `npm install -g pm2`;
    const pm2InstallResult: CommandResult = await sshTarget.execCommand(pm2InstallCmd);
    logs.push(`[Step 15] PM2 install result: ${pm2InstallResult.stdout || pm2InstallResult.stderr}`);

    logs.push(`[Step 16] Stopping and deleting any existing PM2 process for ${domain}...`);
    const pm2StopCmd: string = `pm2 stop ${domain} || true && pm2 delete ${domain} || true`;
    const pm2StopResult: CommandResult = await sshTarget.execCommand(pm2StopCmd);
    logs.push(`[Step 16] PM2 stop/delete result: ${pm2StopResult.stdout || pm2StopResult.stderr}`);

    logs.push(`[Step 17] Creating ecosystem.config.js in ${fullInstallPath}...`);
    const ecosystemConfig: string = `module.exports = {
  apps: [{
    name: "${domain}",
    script: "bash",
    args: "-c \\"export NODE_OPTIONS='--max-old-space-size=4096' && yarn build && yarn develop\\"",
    env: {
      NODE_ENV: "development"
    },
    instances: 1,
    exec_mode: "fork",
    watch: false,
    max_memory_restart: "2G"
  }]
};`;

    const createEcoCmd: string = `cat > ${fullInstallPath}/ecosystem.config.js << 'EOF'
${ecosystemConfig}
EOF`;
    const createEcoResult: CommandResult = await sshTarget.execCommand(createEcoCmd);
    logs.push(`[Step 17] Ecosystem config result: ${createEcoResult.stdout || createEcoResult.stderr || "Created."}`);

    logs.push(`[Step 18] Starting PM2 process using ecosystem.config.js...`);
    const pm2StartCmd: string = `cd ${fullInstallPath} && pm2 start ecosystem.config.js`;
    const pm2StartResult: CommandResult = await sshTarget.execCommand(pm2StartCmd);
    logs.push(`[Step 18] PM2 start result: ${pm2StartResult.stdout || pm2StartResult.stderr || "Process started."}`);

    logs.push(`[Step 19] Configuring PM2 to start on boot...`);
    const pm2StartupCmd: string = `pm2 startup`;
    const pm2StartupResult: CommandResult = await sshTarget.execCommand(pm2StartupCmd);
    logs.push(`[Step 19] PM2 startup result: ${pm2StartupResult.stdout || pm2StartupResult.stderr}`);

    logs.push(`[Step 20] Saving PM2 configuration...`);
    const pm2SaveCmd: string = `pm2 save`;
    const pm2SaveResult: CommandResult = await sshTarget.execCommand(pm2SaveCmd);
    logs.push(`[Step 20] PM2 save result: ${pm2SaveResult.stdout || pm2SaveResult.stderr}`);

    // --- ETAPE 4.5 : Nettoyage des fichiers de configuration Nginx ---
    logs.push(`[Step 21] Removing default Nginx configuration files...`);
    const removeNginxDefaultResult: CommandResult = await sshTarget.execCommand(
      `rm -rf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default`
    );
    logs.push(`[Step 21] Default Nginx config files removed: ${removeNginxDefaultResult.stdout || removeNginxDefaultResult.stderr || "Completed."}`);

    // --- ETAPE 4.6 : Obtention du certificat SSL via Certbot ---
    logs.push(`[Step 22] Obtaining SSL certificate for ${domain} with Certbot...`);
    const certbotCmd: string = `certbot certonly --nginx -d ${domain} --non-interactive --agree-tos -m ${email}`;
    const certbotResult: CommandResult = await sshTarget.execCommand(certbotCmd);
    logs.push(`[Step 22] Certbot result: ${certbotResult.stdout || certbotResult.stderr || "SSL certificate obtained."}`);

    // --- ETAPE 4.7 : Configuration de Nginx pour HTTPS ---
    logs.push(`[Step 23] Configuring Nginx for ${domain} with HTTPS...`);
    const nginxConfig: string = `server {
    listen 80;
    server_name ${domain};
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name ${domain};

    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;

    location / {
        proxy_pass http://localhost:${deployedPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}`;

    const nginxConfCmd: string = `cat > /etc/nginx/sites-available/${domain} << 'EOF'
${nginxConfig}
EOF
ln -sf /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/ && systemctl restart nginx`;
    
    const nginxResult: CommandResult = await sshTarget.execCommand(nginxConfCmd);
    logs.push(`[Step 23] Nginx config result: ${nginxResult.stdout || nginxResult.stderr || "Configured."}`);

    // --- ETAPE 4.8 : Vérification finale ---
    logs.push(`[Step 24] Checking PM2 status for ${domain}...`);
    const statusResult: CommandResult = await sshTarget.execCommand(`pm2 status ${domain}`);
    logs.push(`[Step 24] PM2 status: ${statusResult.stdout || statusResult.stderr}`);

    logs.push(`[Step 25] Testing HTTPS access to ${domain}...`);
    const curlResult: CommandResult = await sshTarget.execCommand(`curl -I https://${domain}`);
    logs.push(`[Step 25] HTTPS test result: ${curlResult.stdout || curlResult.stderr}`);

    // --- Finalisation du déploiement ---
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