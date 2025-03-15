// app/middleware/deploy.ts

import { NextRequest, NextResponse } from 'next/server';
import { DeploymentRequestBody } from '../types/deploy';

export async function validateDeploymentRequest(
  request: NextRequest
): Promise<{ isValid: boolean; error?: string; body?: DeploymentRequestBody }> {
  try {
    const body: DeploymentRequestBody = await request.json();

    if (!body.sourceServer?.ip || !body.sourceServer?.username) {
      return { isValid: false, error: 'Invalid source server configuration' };
    }

    if (!body.targetIP || !body.targetPassword) {
      return { isValid: false, error: 'Invalid target server configuration' };
    }

    if (!body.domain || !body.email) {
      return { isValid: false, error: 'Domain and email are required' };
    }

    return { isValid: true, body };
  } catch (error: any) {
    return { isValid: false, error: 'Invalid request body' };
  }
}