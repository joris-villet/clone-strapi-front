// app/types/deploy.ts

export interface SourceServer {
    ip: string;
    username: string;
  }
  
  export interface DeploymentRequestBody {
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
  
  export interface CommandResult {
    stdout: string;
    stderr: string;
  }
  
  export interface DeploymentResponse {
    success: boolean;
    logs?: string[];
    message: string;
    error?: string;
  }