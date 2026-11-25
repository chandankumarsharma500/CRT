import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, type GenerateContentResponse } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_GEMINI_MODEL = 'gemini-4-hydrogen';
const ALLOWED_GEMINI_MODELS = new Set([
  'gemini-4-hydrogen',
  'gemini-3.1-flash-lite',
]);

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || !apiKey.trim()) {
    const err = new Error('GEMINI_API_KEY is not configured on the server.');
    (err as Error & { status?: number; code?: string }).status = 500;
    (err as Error & { status?: number; code?: string }).code = 'MISSING_API_KEY';
    throw err;
  }

  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractErrorDetails(err: unknown): { status: number; message: string; code: string } {
  const anyErr = err as {
    status?: number;
    statusCode?: number;
    code?: string;
    message?: string;
    error?: { code?: number; status?: string; message?: string };
  };

  const status =
    typeof anyErr?.status === 'number'
      ? anyErr.status
      : typeof anyErr?.statusCode === 'number'
        ? anyErr.statusCode
        : typeof anyErr?.error?.code === 'number'
          ? anyErr.error.code
          : 500;

  const code =
    typeof anyErr?.code === 'string'
      ? anyErr.code
      : typeof anyErr?.error?.status === 'string'
        ? anyErr.error.status
        : 'GEMINI_API_ERROR';

  const message =
    anyErr?.error?.message ||
    anyErr?.message ||
    'An unexpected error occurred while calling the Gemini API.';

  return {
    status: status >= 400 && status <= 599 ? status : 500,
    message,
    code,
  };
}

function buildGenerateParams(body: Record<string, unknown>) {
  const rawContents = body.contents ?? body.prompt;
  const isValidString = typeof rawContents === 'string' && rawContents.trim().length > 0;
  const isValidObject =
    typeof rawContents === 'object' &&
    rawContents !== null &&
    (Array.isArray(rawContents) ? rawContents.length > 0 : Object.keys(rawContents).length > 0);

  if (!isValidString && !isValidObject) {
    const err = new Error('Request must include non-empty "contents" or "prompt".');
    (err as Error & { status?: number; code?: string }).status = 400;
    (err as Error & { status?: number; code?: string }).code = 'INVALID_REQUEST';
    throw err;
  }

  const requestedModel = typeof body.model === 'string' ? body.model.trim() : '';
  const model = ALLOWED_GEMINI_MODELS.has(requestedModel) ? requestedModel : DEFAULT_GEMINI_MODEL;

  const config: Record<string, unknown> = {};
  if (typeof body.systemInstruction === 'string' && body.systemInstruction.trim().length > 0) {
    config.systemInstruction = body.systemInstruction.trim();
  }
  if (typeof body.responseMimeType === 'string' && body.responseMimeType.trim().length > 0) {
    config.responseMimeType = body.responseMimeType.trim();
  }
  if (body.responseSchema && typeof body.responseSchema === 'object') {
    config.responseSchema = body.responseSchema;
  }
  if (typeof body.maxOutputTokens === 'number' && Number.isFinite(body.maxOutputTokens) && body.maxOutputTokens > 0) {
    config.maxOutputTokens = Math.min(8192, Math.floor(body.maxOutputTokens));
  }

  return {
    model,
    contents: rawContents,
    ...(Object.keys(config).length > 0 ? { config } : {}),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // --- Server-Side Gemini API Routes ---
  app.post('/api/gemini/generate', async (req: Request, res: Response) => {
    try {
      const ai = getGeminiClient();
      const params = buildGenerateParams((req.body ?? {}) as Record<string, unknown>);
      const response: GenerateContentResponse = await ai.models.generateContent(params as never);
      res.json({
        text: response.text ?? '',
        model: params.model,
      });
    } catch (err) {
      const { status, message, code } = extractErrorDetails(err);
      console.error('[Gemini Generate Error]', code, message);
      res.status(status).json({ error: message, code });
    }
  });

  app.post('/api/gemini/stream', async (req: Request, res: Response) => {
    let headersSent = false;
    try {
      const ai = getGeminiClient();
      const params = buildGenerateParams((req.body ?? {}) as Record<string, unknown>);
      const stream = await ai.models.generateContentStream(params as never);

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();
      headersSent = true;

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          res.write(`data: ${JSON.stringify({ text: c.text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      const { status, message, code } = extractErrorDetails(err);
      console.error('[Gemini Stream Error]', code, message);
      if (!headersSent) {
        res.status(status).json({ error: message, code });
      } else {
        res.write(`data: ${JSON.stringify({ error: message, code })}\n\n`);
        res.end();
      }
    }
  });

  // --- Server-Side DhanHQ v2 Bridge Routes (CORS-free) ---
  const resolveDhanHeaders = (req: Request) => {
    const accessToken =
      (req.headers['access-token'] as string) ||
      (typeof req.body?.accessToken === 'string' ? req.body.accessToken : '') ||
      process.env.DHAN_ACCESS_TOKEN ||
      '';
    const clientId =
      (req.headers['client-id'] as string) ||
      (typeof req.body?.clientId === 'string' ? req.body.clientId : '') ||
      process.env.DHAN_CLIENT_ID ||
      '';
    return { accessToken: accessToken.trim(), clientId: clientId.trim() };
  };

  app.post('/api/dhan/profile', async (req: Request, res: Response) => {
    try {
      const { accessToken } = resolveDhanHeaders(req);
      if (!accessToken) {
        res.status(400).json({ error: 'Dhan Access Token is required.' });
        return;
      }
      const upstream = await fetch('https://api.dhan.co/v2/profile', {
        method: 'GET',
        headers: {
          'access-token': accessToken,
          Accept: 'application/json',
        },
      });
      const data = await upstream.json().catch(() => ({}));
      res.status(upstream.status).json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(502).json({ error: `Dhan profile request failed: ${message}` });
    }
  });

  app.post('/api/dhan/marketfeed', async (req: Request, res: Response) => {
    try {
      const { accessToken, clientId } = resolveDhanHeaders(req);
      if (!accessToken || !clientId) {
        res.status(400).json({ error: 'Dhan Client ID and Access Token are required.' });
        return;
      }
      const mode = req.body?.mode === 'ltp' ? 'ltp' : req.body?.mode === 'quote' ? 'quote' : 'ohlc';
      const instruments =
        req.body?.instruments && typeof req.body.instruments === 'object'
          ? req.body.instruments
          : { IDX_I: [13, 25, 27, 43, 51] };

      const upstream = await fetch(`https://api.dhan.co/v2/marketfeed/${mode}`, {
        method: 'POST',
        headers: {
          'access-token': accessToken,
          'client-id': clientId,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(instruments),
      });
      const data = await upstream.json().catch(() => ({}));
      res.status(upstream.status).json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(502).json({ error: `Dhan marketfeed request failed: ${message}` });
    }
  });

  app.post('/api/dhan/holdings', async (req: Request, res: Response) => {
    try {
      const { accessToken } = resolveDhanHeaders(req);
      if (!accessToken) {
        res.status(400).json({ error: 'Dhan Access Token is required.' });
        return;
      }
      const upstream = await fetch('https://api.dhan.co/v2/holdings', {
        method: 'GET',
        headers: {
          'access-token': accessToken,
          Accept: 'application/json',
        },
      });
      const data = await upstream.json().catch(() => ([]));
      res.status(upstream.status).json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(502).json({ error: `Dhan holdings request failed: ${message}` });
    }
  });

  app.post('/api/dhan/positions', async (req: Request, res: Response) => {
    try {
      const { accessToken } = resolveDhanHeaders(req);
      if (!accessToken) {
        res.status(400).json({ error: 'Dhan Access Token is required.' });
        return;
      }
      const upstream = await fetch('https://api.dhan.co/v2/positions', {
        method: 'GET',
        headers: {
          'access-token': accessToken,
          Accept: 'application/json',
        },
      });
      const data = await upstream.json().catch(() => ([]));
      res.status(upstream.status).json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(502).json({ error: `Dhan positions request failed: ${message}` });
    }
  });

  app.post('/api/dhan/orders', async (req: Request, res: Response) => {
    try {
      const { accessToken, clientId } = resolveDhanHeaders(req);
      if (!accessToken || !clientId) {
        res.status(400).json({ error: 'Dhan Client ID and Access Token are required.' });
        return;
      }
      const orderPayload = { ...(req.body?.order ?? {}), dhanClientId: clientId };
      const upstream = await fetch('https://api.dhan.co/v2/orders', {
        method: 'POST',
        headers: {
          'access-token': accessToken,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });
      const data = await upstream.json().catch(() => ({}));
      res.status(upstream.status).json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(502).json({ error: `Dhan order request failed: ${message}` });
    }
  });

  // --- Server-Side Claude Messages Bridge ---
  app.post('/api/claude/messages', async (req: Request, res: Response) => {
    try {
      const apiKey =
        (req.headers['x-api-key'] as string) ||
        process.env.ANTHROPIC_API_KEY ||
        '';
      if (!apiKey.trim()) {
        res.status(400).json({ error: 'Anthropic Claude API key is not configured.' });
        return;
      }
      const { model, max_tokens, system, messages } = req.body ?? {};
      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'messages array is required.' });
        return;
      }
      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: typeof model === 'string' && model ? model : 'claude-3-5-sonnet-20241022',
          max_tokens: typeof max_tokens === 'number' ? Math.min(4096, max_tokens) : 700,
          ...(typeof system === 'string' && system ? { system } : {}),
          messages,
        }),
      });
      const data = await upstream.json().catch(() => ({}));
      res.status(upstream.status).json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(502).json({ error: `Claude API request failed: ${message}` });
    }
  });

  // --- Server-Side OpenAI / ChatGPT Bridge ---
  app.post('/api/openai/chat', async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY || '';
      if (!apiKey.trim()) {
        res.status(503).json({ error: 'OpenAI API key is not configured on the server.' });
        return;
      }
      const { model, max_tokens, messages } = req.body ?? {};
      if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
        res.status(400).json({ error: 'Valid messages array (1-20 items) is required.' });
        return;
      }

      const allowedRoles = new Set(['system', 'user', 'assistant']);
      const sanitizedMessages = messages
        .filter((m: unknown): m is { role: string; content: string } =>
          Boolean(
            m &&
              typeof m === 'object' &&
              typeof (m as { role?: unknown }).role === 'string' &&
              allowedRoles.has((m as { role: string }).role) &&
              typeof (m as { content?: unknown }).content === 'string'
          )
        )
        .map((m) => ({
          role: m.role,
          content: m.content.slice(0, 8000),
        }));

      if (sanitizedMessages.length === 0) {
        res.status(400).json({ error: 'At least one valid message is required.' });
        return;
      }

      const allowedModels = new Set(['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1']);
      const chosenModel =
        typeof model === 'string' && allowedModels.has(model) ? model : 'gpt-4o-mini';

      const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model: chosenModel,
          max_tokens: typeof max_tokens === 'number' ? Math.min(2048, Math.max(64, max_tokens)) : 800,
          messages: sanitizedMessages,
        }),
      });
      const data = await upstream.json().catch(() => ({}));
      res.status(upstream.status).json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(502).json({ error: `OpenAI ChatGPT request failed: ${message}` });
    }
  });

  // --- Dedicated Yahoo Finance Live Quotes Endpoint (v8/finance/chart) ---
  const YAHOO_QUOTE_SYMBOLS: Array<{ id: string; symbol: string; name: string }> = [
    { id: 'nifty', symbol: '^NSEI', name: 'NIFTY 50' },
    { id: 'bank_nifty', symbol: '^NSEBANK', name: 'BANK NIFTY' },
    { id: 'fin_nifty', symbol: 'NIFTY_FIN_SERVICE.NS', name: 'FIN NIFTY' },
    { id: 'sensex', symbol: '^BSESN', name: 'BSE SENSEX' },
    { id: 'midcap', symbol: '^NSEMDCP50', name: 'MIDCAP 50' },
    { id: 'next_50', symbol: '^NSMIDCP', name: 'NIFTY NEXT 50' },
    { id: 'bankex', symbol: 'BSE-BANK.BO', name: 'BSE BANKEX' },
    { id: 'nifty_it', symbol: '^CNXIT', name: 'NIFTY IT' },
    { id: 'nifty_auto', symbol: '^CNXAUTO', name: 'NIFTY AUTO' },
    { id: 'nifty_fmcg', symbol: '^CNXFMCG', name: 'NIFTY FMCG' },
    { id: 'nifty_pharma', symbol: '^CNXPHARMA', name: 'NIFTY PHARMA' },
    { id: 'nifty_metal', symbol: '^CNXMETAL', name: 'NIFTY METAL' },
    { id: 'reliance', symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { id: 'hdfc_bank', symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { id: 'icici_bank', symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { id: 'tcs', symbol: 'TCS.NS', name: 'Tata Consultancy' },
    { id: 'infy', symbol: 'INFY.NS', name: 'Infosys' },
    { id: 'crude', symbol: 'CL=F', name: 'CRUDE OIL' },
    { id: 'gold', symbol: 'GC=F', name: 'GOLD' },
  ];

  let yahooQuotesCache: { timestamp: number; quotes: Record<string, unknown> } | null = null;

  app.get('/api/yahoo-quotes', async (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
      const now = Date.now();
      const force = req.query.force === '1' || req.query.force === 'true';
      if (!force && yahooQuotesCache && now - yahooQuotesCache.timestamp < 3000) {
        res.json({ status: 'YAHOO_LIVE', cached: true, ...yahooQuotesCache });
        return;
      }

      const results = await Promise.all(
        YAHOO_QUOTE_SYMBOLS.map(async (item) => {
          try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}?interval=1d&range=1d&_=${now}`;
            const resp = await fetch(url, {
              headers: { 'User-Agent': BROWSER_USER_AGENT },
              signal: AbortSignal.timeout(4500),
            });
            if (!resp.ok) return null;
            const data = (await resp.json()) as {
              chart?: {
                result?: Array<{
                  meta?: {
                    regularMarketPrice?: number;
                    chartPreviousClose?: number;
                    previousClose?: number;
                    regularMarketChange?: number;
                    regularMarketChangePercent?: number;
                    regularMarketDayHigh?: number;
                    regularMarketDayLow?: number;
                    regularMarketOpen?: number;
                    regularMarketVolume?: number;
                    regularMarketTime?: number;
                  };
                }>;
              };
            };
            const meta = data?.chart?.result?.[0]?.meta;
            if (!meta || typeof meta.regularMarketPrice !== 'number' || meta.regularMarketPrice <= 0) {
              return null;
            }
            const price = meta.regularMarketPrice;
            const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
            const change = meta.regularMarketChange ?? price - prev;
            const changePercent = meta.regularMarketChangePercent ?? (prev > 0 ? (change / prev) * 100 : 0);

            return {
              id: item.id,
              symbol: item.symbol,
              name: item.name,
              price: Number(price.toFixed(2)),
              previousClose: Number(prev.toFixed(2)),
              change: Number(change.toFixed(2)),
              changePercent: Number(changePercent.toFixed(2)),
              high: Number((meta.regularMarketDayHigh ?? price).toFixed(2)),
              low: Number((meta.regularMarketDayLow ?? price).toFixed(2)),
              open: Number((meta.regularMarketOpen ?? prev).toFixed(2)),
              volume: meta.regularMarketVolume ?? 0,
              marketTime: meta.regularMarketTime ? meta.regularMarketTime * 1000 : now,
              source: 'YAHOO_FINANCE_LIVE',
            };
          } catch {
            return null;
          }
        })
      );

      const quotesMap: Record<string, unknown> = {};
      for (const q of results) {
        if (q) quotesMap[q.id] = q;
      }

      if (Object.keys(quotesMap).length === 0) {
        res.status(502).json({ status: 'ERROR', error: 'Unable to fetch live quotes from Yahoo Finance.' });
        return;
      }

      yahooQuotesCache = { timestamp: now, quotes: quotesMap };
      res.json({ status: 'YAHOO_LIVE', cached: false, timestamp: now, quotes: quotesMap });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ status: 'ERROR', error: message });
    }
  });

  // --- Live Global Indices & Crypto Quotes via Yahoo Finance ---
  const GLOBAL_YAHOO_SYMBOLS: Array<{ id: string; symbol: string; displaySymbol: string; name: string; category: 'INDEX' | 'CRYPTO' }> = [
    { id: 'spx', symbol: '^GSPC', displaySymbol: 'SPX', name: 'S&P 500', category: 'INDEX' },
    { id: 'ndx', symbol: '^IXIC', displaySymbol: 'IXIC', name: 'Nasdaq Composite', category: 'INDEX' },
    { id: 'dxy', symbol: 'DX-Y.NYB', displaySymbol: 'DXY', name: 'US Dollar Index', category: 'INDEX' },
    { id: 'us10y', symbol: '^TNX', displaySymbol: 'US10Y', name: 'US 10Y Yield', category: 'INDEX' },
    { id: 'vix', symbol: '^VIX', displaySymbol: 'VIX', name: 'Volatility Index', category: 'INDEX' },
    { id: 'btc', symbol: 'BTC-USD', displaySymbol: 'BTC/USD', name: 'Bitcoin', category: 'CRYPTO' },
    { id: 'eth', symbol: 'ETH-USD', displaySymbol: 'ETH/USD', name: 'Ethereum', category: 'CRYPTO' },
    { id: 'sol', symbol: 'SOL-USD', displaySymbol: 'SOL/USD', name: 'Solana', category: 'CRYPTO' },
  ];

  app.get('/api/global-quotes', async (_req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    try {
      const now = Date.now();
      const settled = await Promise.all(
        GLOBAL_YAHOO_SYMBOLS.map(async (item) => {
          try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}?interval=1d&range=1d&_=${now}`;
            const resp = await fetch(url, {
              headers: { 'User-Agent': BROWSER_USER_AGENT },
              signal: AbortSignal.timeout(4500),
            });
            if (!resp.ok) return null;
            const data = (await resp.json()) as {
              chart?: {
                result?: Array<{
                  meta?: {
                    regularMarketPrice?: number;
                    chartPreviousClose?: number;
                    previousClose?: number;
                    regularMarketChange?: number;
                    regularMarketChangePercent?: number;
                  };
                }>;
              };
            };
            const meta = data?.chart?.result?.[0]?.meta;
            if (!meta || typeof meta.regularMarketPrice !== 'number' || meta.regularMarketPrice <= 0) {
              return null;
            }
            const price = meta.regularMarketPrice;
            const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
            const change = meta.regularMarketChange ?? price - prev;
            const percentChange = meta.regularMarketChangePercent ?? (prev > 0 ? (change / prev) * 100 : 0);
            return {
              id: item.id,
              symbol: item.displaySymbol,
              name: item.name,
              category: item.category,
              price: Number(price.toFixed(2)),
              change: Number(change.toFixed(2)),
              percentChange: Number(percentChange.toFixed(2)),
              trend: percentChange >= 0 ? 'Bullish' : 'Bearish',
            };
          } catch {
            return null;
          }
        })
      );
      const assets = settled.filter((x): x is NonNullable<typeof x> => x !== null);
      res.json({ status: 'GLOBAL_YAHOO_LIVE', timestamp: now, assets });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ status: 'ERROR', error: message, assets: [] });
    }
  });

  // --- Existing Market Data Endpoints & Proxies ---
  app.get('/api/live-stream', async (_req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try {
      const tvTickers = [
        'NSE:NIFTY',
        'NSE:BANKNIFTY',
        'NSE:CNXFINANCE',
        'BSE:SENSEX',
        'NSE:CNXMIDCAP',
        'NSE:RELIANCE',
        'NSE:HDFCBANK',
        'NSE:ICICIBANK',
        'NSE:TCS',
        'NSE:INFY',
      ];
      const tvPromise = fetch('https://scanner.tradingview.com/india/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': BROWSER_USER_AGENT,
        },
        body: JSON.stringify({
          symbols: { tickers: tvTickers },
          columns: ['close', 'change', 'change_abs', 'high', 'low', 'open', 'volume'],
        }),
      })
        .then((r) => r.json())
        .catch(() => null);

      const yahooSymbols = ['%5ENSEI', '%5ENSEBANK', '%5EBSESN'];
      const yahooPromises = yahooSymbols.map((sym) =>
        fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, {
          headers: { 'User-Agent': BROWSER_USER_AGENT },
        })
          .then((r) => r.json())
          .catch(() => null)
      );

      const [tvData, ...yahooData] = await Promise.all([tvPromise, ...yahooPromises]);

      res.json({
        status: 'LIVE_OK',
        timestamp: Date.now(),
        tvData,
        yahooData,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ status: 'ERROR', error: message });
    }
  });

  app.get('/api/historical-candles', async (req: Request, res: Response) => {
    try {
      const symbol = typeof req.query.symbol === 'string' ? req.query.symbol : '^NSEI';
      const range = typeof req.query.range === 'string' ? req.query.range : '3mo';
      const interval = typeof req.query.interval === 'string' ? req.query.interval : '1d';

      const target = new URL(
        `/v8/finance/chart/${encodeURIComponent(symbol)}`,
        'https://query1.finance.yahoo.com'
      );
      target.searchParams.set('interval', interval);
      target.searchParams.set('range', range);

      const response = await fetch(target.toString(), {
        headers: { 'User-Agent': BROWSER_USER_AGENT },
      });
      const json = await response.json();
      res.json(json);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ status: 'ERROR', error: message });
    }
  });

  // --- Batch Yahoo Finance OHLCV Scanner Endpoint (India CRT + Scanner 5.0) ---
  interface ScannerBar {
    time: string;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }

  const ALLOWED_SCANNER_INTERVALS = new Set(['5m', '15m', '1h', '60m', '1d', '1wk']);
  const ALLOWED_SCANNER_RANGES = new Set(['5d', '1mo', '2mo', '3mo', '6mo', '1y', '2y', '3y', '5y']);
  const SYMBOL_REGEX = /^[A-Z0-9^._=&-]{1,24}$/;
  const scannerCandleCache = new Map<string, { timestamp: number; bars: ScannerBar[] }>();
  const SCANNER_CACHE_TTL_MS = 60_000;

  async function fetchSingleYahooCandles(
    symbol: string,
    interval: string,
    range: string
  ): Promise<{ bars: ScannerBar[]; cached: boolean }> {
    const cacheKey = `${symbol}|${interval}|${range}`;
    const now = Date.now();
    const hit = scannerCandleCache.get(cacheKey);
    if (hit && now - hit.timestamp < SCANNER_CACHE_TTL_MS) {
      return { bars: hit.bars, cached: true };
    }

    const target = new URL(
      `/v8/finance/chart/${encodeURIComponent(symbol)}`,
      'https://query1.finance.yahoo.com'
    );
    target.searchParams.set('interval', interval);
    target.searchParams.set('range', range);
    target.searchParams.set('events', 'div,splits');

    const resp = await fetch(target.toString(), {
      headers: { 'User-Agent': BROWSER_USER_AGENT },
      signal: AbortSignal.timeout(7000),
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} for ${symbol}`);
    }

    const payload = (await resp.json()) as {
      chart?: {
        error?: { description?: string };
        result?: Array<{
          timestamp?: number[];
          indicators?: {
            quote?: Array<{
              open?: Array<number | null>;
              high?: Array<number | null>;
              low?: Array<number | null>;
              close?: Array<number | null>;
              volume?: Array<number | null>;
            }>;
          };
        }>;
      };
    };

    if (payload?.chart?.error) {
      throw new Error(payload.chart.error.description || `Yahoo chart error for ${symbol}`);
    }

    const result = payload?.chart?.result?.[0];
    const timestamps = result?.timestamp ?? [];
    const q = result?.indicators?.quote?.[0] ?? {};
    const opens = q.open ?? [];
    const highs = q.high ?? [];
    const lows = q.low ?? [];
    const closes = q.close ?? [];
    const volumes = q.volume ?? [];

    const bars: ScannerBar[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i];
      const o = opens[i];
      const h = highs[i];
      const l = lows[i];
      const c = closes[i];
      const v = volumes[i];
      if (
        typeof ts !== 'number' ||
        typeof o !== 'number' ||
        typeof h !== 'number' ||
        typeof l !== 'number' ||
        typeof c !== 'number' ||
        !Number.isFinite(o) ||
        !Number.isFinite(h) ||
        !Number.isFinite(l) ||
        !Number.isFinite(c)
      ) {
        continue;
      }
      const ms = ts * 1000;
      bars.push({
        time: new Date(ms).toISOString(),
        timestamp: ms,
        open: Number(o.toFixed(4)),
        high: Number(h.toFixed(4)),
        low: Number(l.toFixed(4)),
        close: Number(c.toFixed(4)),
        volume: typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0,
      });
    }

    scannerCandleCache.set(cacheKey, { timestamp: now, bars });
    if (scannerCandleCache.size > 250) {
      const oldestKey = scannerCandleCache.keys().next().value;
      if (oldestKey) scannerCandleCache.delete(oldestKey);
    }

    return { bars, cached: false };
  }

  app.post('/api/scanner/candles', async (req: Request, res: Response) => {
    try {
      const rawSymbols = req.body?.symbols;
      if (!Array.isArray(rawSymbols) || rawSymbols.length === 0 || rawSymbols.length > 45) {
        res.status(400).json({ error: 'Provide between 1 and 45 valid symbols.' });
        return;
      }

      const interval =
        typeof req.body?.interval === 'string' && ALLOWED_SCANNER_INTERVALS.has(req.body.interval)
          ? req.body.interval
          : '1d';
      const range =
        typeof req.body?.range === 'string' && ALLOWED_SCANNER_RANGES.has(req.body.range)
          ? req.body.range
          : '3mo';

      const cleanSymbols: string[] = [];
      const seen = new Set<string>();
      for (const s of rawSymbols) {
        if (typeof s !== 'string') continue;
        const norm = s.trim().toUpperCase();
        if (SYMBOL_REGEX.test(norm) && !seen.has(norm)) {
          seen.add(norm);
          cleanSymbols.push(norm);
        }
      }

      if (cleanSymbols.length === 0) {
        res.status(400).json({ error: 'No valid ticker symbols provided.' });
        return;
      }

      const candlesBySymbol: Record<string, ScannerBar[]> = {};
      const errors: Array<{ symbol: string; error: string }> = [];
      let cachedCount = 0;

      // Batch in chunks of 6 to stay friendly to upstream Yahoo Finance
      const CHUNK_SIZE = 6;
      for (let i = 0; i < cleanSymbols.length; i += CHUNK_SIZE) {
        const chunk = cleanSymbols.slice(i, i + CHUNK_SIZE);
        const settled = await Promise.allSettled(
          chunk.map(async (sym) => {
            const out = await fetchSingleYahooCandles(sym, interval, range);
            return { sym, ...out };
          })
        );
        for (let idx = 0; idx < settled.length; idx++) {
          const item = settled[idx];
          const sym = chunk[idx];
          if (item.status === 'fulfilled') {
            candlesBySymbol[sym] = item.value.bars;
            if (item.value.cached) cachedCount++;
          } else {
            errors.push({
              symbol: sym,
              error: item.reason instanceof Error ? item.reason.message : String(item.reason),
            });
          }
        }
      }

      res.json({
        status: 'SCANNER_OK',
        interval,
        range,
        requested: cleanSymbols.length,
        returned: Object.keys(candlesBySymbol).length,
        cachedCount,
        fetchedAt: Date.now(),
        candlesBySymbol,
        errors,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ status: 'ERROR', error: message });
    }
  });

  app.use('/api/tv-scan', async (req: Request, res: Response) => {
    try {
      const safePath = req.url.startsWith('/') ? req.url : `/${req.url}`;
      const targetUrl = new URL(safePath, 'https://scanner.tradingview.com');
      if (targetUrl.origin !== 'https://scanner.tradingview.com') {
        res.status(400).json({ error: 'Invalid proxy target' });
        return;
      }

      const hasBody = !['GET', 'HEAD'].includes(req.method.toUpperCase());
      const upstream = await fetch(targetUrl.toString(), {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': BROWSER_USER_AGENT,
          Accept: 'application/json, text/plain, */*',
        },
        body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
      });

      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
      res.send(text);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(502).json({ error: message });
    }
  });

  app.use('/api/yahoo-chart', async (req: Request, res: Response) => {
    try {
      const safePath = req.url.startsWith('/') ? req.url : `/${req.url}`;
      const targetUrl = new URL(safePath, 'https://query1.finance.yahoo.com');
      if (targetUrl.origin !== 'https://query1.finance.yahoo.com') {
        res.status(400).json({ error: 'Invalid proxy target' });
        return;
      }

      const upstream = await fetch(targetUrl.toString(), {
        method: req.method,
        headers: {
          'User-Agent': BROWSER_USER_AGENT,
          Accept: '*/*',
        },
      });

      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
      res.send(text);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(502).json({ error: message });
    }
  });

  // --- Vite Middleware (Dev) or Static Dist (Prod) ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SMC Intelligence server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
