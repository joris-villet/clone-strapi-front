'use client';

import React, { useState } from 'react';

const DeployForm = () => {
  const [sourceServerIP, setSourceServerIP] = useState('');
  const [sourceServerUsername, setSourceServerUsername] = useState('');
  const [targetIP, setTargetIP] = useState('');
  const [targetPassword, setTargetPassword] = useState('');
  const [installPath, setInstallPath] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [sourceInstancePath, setSourceInstancePath] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setIsLoading(true);
    setError(null);
    setLogs([]);

    const deployData = {
      sourceServer: {
        ip: sourceServerIP,
        username: sourceServerUsername,
      },
      targetIP,
      targetPassword,
      installPath,
      domain,
      email,
      sourceInstancePath,
    };

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deployData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Deployment failed');
      }

      setLogs(result.logs || []);
      if (result.success) {
        alert('Deployment successful!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during deployment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Deploy Strapi Instance</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Source Server IP</label>
          <input
            type="text"
            value={sourceServerIP}
            onChange={(e) => setSourceServerIP(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Source Server Username</label>
          <input
            type="text"
            value={sourceServerUsername}
            onChange={(e) => setSourceServerUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Server IP</label>
          <input
            type="text"
            value={targetIP}
            onChange={(e) => setTargetIP(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Server Password</label>
          <input
            type="password"
            value={targetPassword}
            onChange={(e) => setTargetPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Install Path</label>
          <input
            type="text"
            value={installPath}
            onChange={(e) => setInstallPath(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Domain</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Source Instance Path</label>
          <input
            type="text"
            value={sourceInstancePath}
            onChange={(e) => setSourceInstancePath(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <button
          onClick={handleDeploy}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Deploying...' : 'Deploy'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {logs.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-md shadow-md">
            <h3 className="text-lg font-bold mb-2">Deployment Logs</h3>
            <pre className="text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap">
              {logs.join('\n')}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeployForm;