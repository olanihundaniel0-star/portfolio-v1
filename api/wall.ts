type ServerlessRequest = {
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  method?: string;
  socket?: {
    remoteAddress?: string;
  };
};

type ServerlessResponse = {
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => ServerlessResponse;
};

type WallRequestBody = {
  name?: unknown;
  sig?: unknown;
  text?: unknown;
  website?: unknown;
};

type WallPayload = {
  name: string;
  sig: string | null;
  text: string;
};

type RequiredConfig = {
  supabaseServiceRoleKey: string;
  supabaseTable: string;
  supabaseUrl: string;
};

type WallRow = {
  created_at: string;
  id: string;
  name: string;
  sig: string | null;
  text: string;
};

const MAX_NAME_LENGTH = 40;
const MAX_SIG_LENGTH = 150000;
const MAX_TEXT_LENGTH = 280;
const LIST_LIMIT = 50;
const RATE_LIMIT_MAX = Number(process.env.WALL_RATE_LIMIT_MAX ?? '6');
const RATE_LIMIT_WINDOW_MS = Number(
  process.env.WALL_RATE_LIMIT_WINDOW_MS ?? '60000'
);
const SIG_PATTERN = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const firstHeaderValue = (
  value: string | string[] | undefined
): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }

  return undefined;
};

const getClientIp = (request: ServerlessRequest) => {
  const forwarded = firstHeaderValue(request.headers['x-forwarded-for']);
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = firstHeaderValue(request.headers['x-real-ip']);
  if (realIp?.trim()) {
    return realIp.trim();
  }

  return request.socket?.remoteAddress ?? 'unknown';
};

const isRateLimited = (ip: string) => {
  const now = Date.now();

  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore) {
      if (value.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }

  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return false;
};

const parseRequestBody = (body: unknown): WallRequestBody | null => {
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as unknown;
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as WallRequestBody;
      }
      return null;
    } catch {
      return null;
    }
  }

  if (typeof body === 'object' && body !== null) {
    return body as WallRequestBody;
  }

  return null;
};

const toTrimmedString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const validatePayload = (
  body: WallRequestBody
): { error?: string; payload?: WallPayload } => {
  const name = toTrimmedString(body.name);
  const text = toTrimmedString(body.text);
  const sig = typeof body.sig === 'string' && body.sig ? body.sig : null;

  if (!name || !text) {
    return { error: 'Please add your name and message before pinning.' };
  }

  if (name.length > MAX_NAME_LENGTH || text.length > MAX_TEXT_LENGTH) {
    return { error: 'Name or message is too long.' };
  }

  if (sig && (sig.length > MAX_SIG_LENGTH || !SIG_PATTERN.test(sig))) {
    return { error: 'That signature could not be saved. Try a smaller one.' };
  }

  return { payload: { name, sig, text } };
};

const getRequiredConfig = (): { config?: RequiredConfig; error?: string } => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() ?? '';
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  const supabaseTable =
    process.env.SUPABASE_WALL_TABLE?.trim() ?? 'wall_messages';

  const missing: string[] = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    return {
      error: `Server is missing required environment variables: ${missing.join(', ')}`
    };
  }

  return { config: { supabaseServiceRoleKey, supabaseTable, supabaseUrl } };
};

const supabaseHeaders = (config: RequiredConfig) => ({
  Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
  'Content-Type': 'application/json',
  apikey: config.supabaseServiceRoleKey
});

const handleGet = async (
  response: ServerlessResponse,
  config: RequiredConfig
) => {
  const url =
    `${config.supabaseUrl}/rest/v1/${config.supabaseTable}` +
    `?select=id,name,text,sig,created_at&order=created_at.desc&limit=${LIST_LIMIT}`;
  const res = await fetch(url, { headers: supabaseHeaders(config) });

  if (!res.ok) {
    response
      .status(502)
      .json({ message: 'Unable to load the wall right now.' });
    return;
  }

  const rows = (await res.json()) as WallRow[];
  response.status(200).json({ messages: rows });
};

const handlePost = async (
  request: ServerlessRequest,
  response: ServerlessResponse,
  config: RequiredConfig
) => {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    response
      .status(429)
      .json({ message: 'Too many pins. Please wait a moment and try again.' });
    return;
  }

  const parsedBody = parseRequestBody(request.body);
  if (!parsedBody) {
    response.status(400).json({ message: 'Invalid request payload.' });
    return;
  }

  const { error: validationError, payload } = validatePayload(parsedBody);
  if (validationError || !payload) {
    response.status(400).json({ message: validationError ?? 'Invalid payload.' });
    return;
  }

  if (toTrimmedString(parsedBody.website)) {
    response.status(200).json({ message: { ...payload, id: `spam-${Date.now()}` } });
    return;
  }

  const res = await fetch(
    `${config.supabaseUrl}/rest/v1/${config.supabaseTable}`,
    {
      body: JSON.stringify([
        { name: payload.name, sig: payload.sig, text: payload.text }
      ]),
      headers: { ...supabaseHeaders(config), Prefer: 'return=representation' },
      method: 'POST'
    }
  );

  if (!res.ok) {
    response
      .status(502)
      .json({ message: 'Unable to pin your message right now.' });
    return;
  }

  const rows = (await res.json()) as WallRow[];
  response.status(200).json({ message: rows[0] ?? null });
};

export default async function handler(
  request: ServerlessRequest,
  response: ServerlessResponse
) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    response.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  const { config, error: configError } = getRequiredConfig();
  if (configError || !config) {
    response.status(500).json({
      message: 'Wall service is not configured yet. Please try again later.'
    });
    return;
  }

  try {
    if (request.method === 'GET') {
      await handleGet(response, config);
    } else {
      await handlePost(request, response, config);
    }
  } catch {
    response.status(500).json({ message: 'Wall service is unavailable.' });
  }
}
