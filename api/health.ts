import type { Request, Response } from 'express';

/**
 * Serverless Health Check Endpoint
 * Path: /api/health
 */
export default async function handler(req: Request, res: Response) {
  // CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isMasKeyConfigured = Boolean(
    process.env.MAS_KEY_ID &&
    process.env.MAS_KEY_ID !== 'MY_MAS_KEY_ID' &&
    process.env.MAS_KEY_ID.trim().length > 0
  );

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Monetary Authority of Singapore (MAS) SORA Data Gateway',
    masKeyConfigured: isMasKeyConfigured,
    masKeyHeaderRequired: 'KeyId',
    endpoints: {
      health: '/api/health',
      sora: '/api/sora',
    },
  });
}
