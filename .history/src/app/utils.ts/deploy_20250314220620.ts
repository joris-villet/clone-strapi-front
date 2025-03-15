// app/utils/deploy.ts

import { NodeSSH } from 'node-ssh';
import { CommandResult } from '../types/deploy';

export async function executeCommand(
  ssh: NodeSSH, 
  command: string, 
  cwd?: string
): Promise<CommandResult> {
  try {
    const result = await ssh.execCommand(command, { cwd });
    return {
      stdout: result.stdout,
      stderr: result.stderr
    };
  } catch (error: any) {
    throw new Error(`Command execution failed: ${error.message}`);
  }
}

export async function connectToServer(
  host: string,
  username: string,
  auth: { password?: string; privateKey?: string; passphrase?: string },
  timeout: number = 30000
): Promise<NodeSSH> {
  const ssh = new NodeSSH();
  try {
    await ssh.connect({
      host,
      username,
      ...auth,
      readyTimeout: timeout
    });
    return ssh;
  } catch (error: any) {
    throw new Error(`SSH connection failed: ${error.message}`);
  }
}

export function generatePM2Config(domain: string, nodeOptions: string) {
  return `module.exports = {
    apps: [{
      name: "${domain}",
      script: "bash",
      args: "-c \\"export NODE_OPTIONS='${nodeOptions}' && yarn build && yarn develop\\"",
      env: {
        NODE_ENV: "development"
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "2G"
    }]
  };`;
}