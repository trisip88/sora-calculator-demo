import type { Request, Response } from 'express';

const MAS_SORA_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export interface MasNormalizedRecord {
  date: string;
  soraRate: number;
  compounded1M: number;
  compounded3M: number;
  compounded6M: number;
  aggregateVolume?: number;
  highestTransactionRate?: number;
  lowestTransactionRate?: number;
  raw?: Record<string, any>;
}

/**
 * Serverless MAS SORA Gateway
 * Path: /api/sora
 * 
 * Fetches daily SORA rates and compounded 1M/3M/6M averages from MAS API-Gateway.
 * Authenticates via required 'KeyId: <MAS_KEY_ID>' header.
 */
export default async function handler(req: Request, res: Response) {
  // CORS & Security headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-mas-key-id, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Resolve MAS_KEY_ID from environment variable or incoming header
  const headerKey = req.headers['keyid'] || req.headers['x-mas-key-id'];
  const envKey = process.env.MAS_KEY_ID && process.env.MAS_KEY_ID !== 'MY_MAS_KEY_ID'
    ? process.env.MAS_KEY_ID
    : undefined;

  const masKeyId = (typeof headerKey === 'string' && headerKey.trim()) || envKey;

  if (!masKeyId || masKeyId.trim().length === 0) {
    return res.status(401).json({
      status: 'error',
      code: 'MISSING_MAS_KEY_ID',
      message:
        'MAS_KEY_ID is not configured. Please set MAS_KEY_ID in your server environment variables or pass KeyId header.',
      tip: 'Register on the MAS API Developer Portal (https://eservices.mas.gov.sg/api) to generate your KeyId.',
      masEndpoint: MAS_SORA_ENDPOINT,
    });
  }

  try {
    // 2. Build query parameters
    const url = new URL(MAS_SORA_ENDPOINT);
    const queryParams = req.query || {};

    // Default parameters if not provided
    if (!queryParams['limit']) {
      url.searchParams.set('limit', '30');
    }
    if (!queryParams['sort']) {
      url.searchParams.set('sort', 'end_of_day desc');
    }

    // Forward any additional user query params (e.g. limit, between, sort)
    for (const [key, value] of Object.entries(queryParams)) {
      if (typeof value === 'string') {
        url.searchParams.set(key, value);
      }
    }

    // 3. Dispatch request to MAS API-Gateway
    const masResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'KeyId': masKeyId.trim(),
        'Accept': 'application/json',
        'User-Agent': 'SORA-Calculator/1.0',
      },
    });

    if (!masResponse.ok) {
      const errorText = await masResponse.text();
      return res.status(masResponse.status).json({
        status: 'error',
        code: `MAS_UPSTREAM_${masResponse.status}`,
        message: `MAS API-Gateway returned HTTP ${masResponse.status}`,
        upstreamResponse: errorText,
      });
    }

    const data = await masResponse.json();

    // 4. Extract and normalize records
    const rawRecords: any[] =
      data?.result?.records ||
      data?.data ||
      data?.records ||
      (Array.isArray(data) ? data : []);

    const normalized: MasNormalizedRecord[] = rawRecords.map((item: any) => {
      const date = item.end_of_day || item.date || item.publication_date || '';
      const sora = parseFloat(item.sora ?? item.overnight_rate ?? item.rate ?? '0');
      const comp1M = parseFloat(item.sor_1m ?? item.comp_sora_1m ?? item.comp_1m ?? '0');
      const comp3M = parseFloat(item.sor_3m ?? item.comp_sora_3m ?? item.comp_3m ?? '0');
      const comp6M = parseFloat(item.sor_6m ?? item.comp_sora_6m ?? item.comp_6m ?? '0');
      const volume = item.aggregate_volume ?? item.volume ? parseFloat(item.aggregate_volume ?? item.volume) : undefined;

      return {
        date,
        soraRate: sora,
        compounded1M: comp1M,
        compounded3M: comp3M,
        compounded6M: comp6M,
        aggregateVolume: volume ? volume / 1000 : undefined,
        highestTransactionRate: item.highest ? parseFloat(item.highest) : undefined,
        lowestTransactionRate: item.lowest ? parseFloat(item.lowest) : undefined,
        raw: item,
      };
    });

    return res.status(200).json({
      status: 'success',
      source: 'Monetary Authority of Singapore (MAS) API-Gateway',
      endpoint: MAS_SORA_ENDPOINT,
      count: normalized.length,
      records: normalized,
      rawSummary: {
        total: data?.result?.total ?? normalized.length,
        limit: url.searchParams.get('limit'),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      code: 'SERVERLESS_PROXY_ERROR',
      message: error?.message || 'Failed to connect to MAS API-Gateway',
    });
  }
}
