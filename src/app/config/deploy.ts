// app/config/deploy.ts

export const DEPLOYMENT_CONFIG = {
    DEFAULT_PORT: 1337,
    SSH_TIMEOUT: 30000,
    TEMP_FILE_NAME: 'instance.tar.gz',
    PM2_APP_MEMORY: '2G',
    NODE_OPTIONS: '--max-old-space-size=4096'
  };
  
  export const NGINX_TEMPLATE = (domain: string, port: number) => `
  server {
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
          proxy_pass http://localhost:${port};
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
  
  export const ENV_TEMPLATE = (port: number) => `
  HOST=0.0.0.0
  PORT=${port}
  APP_KEYS=GiOWmlgPX0Xp+Nw+Mye6Tw==,5KzoTo1GLuErKXJgQ2TziA==,J9Red0VbsVWjMVcwDGR0Kg==,d3W2jk44qvGzNlWtQBmiAg==
  API_TOKEN_SALT=CGfHUMK++5xuT7sOLlb+fg==
  ADMIN_JWT_SECRET=1zRF5PVuxtht2EoVhIK0DA==
  TRANSFER_TOKEN_SALT=g7dq2YK9ieTLvPj0SAe8mA==
  DATABASE_CLIENT=sqlite
  DATABASE_FILENAME=srv/app/data.db
  JWT_SECRET=rRxSgBV0qoukVoccn3rpUw==
  `;