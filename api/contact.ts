type ApiResponseBody = {
  message: string;
};

type ServerlessRequest = {
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  method?: string;
  socket?: {
    remoteAddress?: string;
  };
};

type ServerlessResponse = {
  json: (body: ApiResponseBody) => void;
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => ServerlessResponse;
};

type ContactRequestBody = {
  email?: unknown;
  message?: unknown;
  name?: unknown;
  subject?: unknown;
  website?: unknown;
};

type ContactPayload = {
  email: string;
  message: string;
  name: string;
  subject: string;
  website: string;
};

type RequiredConfig = {
  contactFromEmail: string;
  contactToEmail: string;
  resendApiKey: string;
  supabaseServiceRoleKey: string;
  supabaseTable: string;
  supabaseUrl: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 320;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_NAME_LENGTH = 100;
const MAX_SUBJECT_LENGTH = 150;
const MAX_WEBSITE_LENGTH = 200;
const MIN_MESSAGE_LENGTH = 10;
const RATE_LIMIT_MAX = Number(process.env.CONTACT_RATE_LIMIT_MAX ?? '8');
const RATE_LIMIT_WINDOW_MS = Number(
  process.env.CONTACT_RATE_LIMIT_WINDOW_MS ?? '60000'
);
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const SUCCESS_MESSAGE = 'Message sent successfully. I will reply soon.';

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const respondWithMessage = (
  response: ServerlessResponse,
  statusCode: number,
  message: string
) => {
  response.status(statusCode).json({ message });
};

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

const parseRequestBody = (body: unknown): ContactRequestBody | null => {
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as unknown;
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as ContactRequestBody;
      }
      return null;
    } catch {
      return null;
    }
  }

  if (typeof body === 'object' && body !== null) {
    return body as ContactRequestBody;
  }

  return null;
};

const toTrimmedString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const validatePayload = (
  body: ContactRequestBody
): { error?: string; payload?: ContactPayload } => {
  const payload: ContactPayload = {
    email: toTrimmedString(body.email),
    message: toTrimmedString(body.message),
    name: toTrimmedString(body.name),
    subject: toTrimmedString(body.subject),
    website: toTrimmedString(body.website),
  };

  if (!payload.name || !payload.email || !payload.subject || !payload.message) {
    return { error: 'Please complete all fields before sending.' };
  }

  if (!EMAIL_PATTERN.test(payload.email)) {
    return { error: 'Please enter a valid email address.' };
  }

  if (payload.message.length < MIN_MESSAGE_LENGTH) {
    return {
      error: `Your message should be at least ${MIN_MESSAGE_LENGTH} characters.`,
    };
  }

  if (
    payload.name.length > MAX_NAME_LENGTH ||
    payload.email.length > MAX_EMAIL_LENGTH ||
    payload.subject.length > MAX_SUBJECT_LENGTH ||
    payload.message.length > MAX_MESSAGE_LENGTH ||
    payload.website.length > MAX_WEBSITE_LENGTH
  ) {
    return { error: 'One or more fields exceed the allowed length.' };
  }

  return { payload };
};

const getRequiredConfig = (): { config?: RequiredConfig; error?: string } => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() ?? '';
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  const resendApiKey = process.env.RESEND_API_KEY?.trim() ?? '';
  const contactFromEmail = process.env.CONTACT_FROM_EMAIL?.trim() ?? '';
  const contactToEmail = process.env.CONTACT_TO_EMAIL?.trim() ?? '';
  const supabaseTable =
    process.env.SUPABASE_CONTACT_TABLE?.trim() ?? 'contact_messages';

  const missing: string[] = [];

  if (!supabaseUrl) {
    missing.push('SUPABASE_URL');
  }

  if (!supabaseServiceRoleKey) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  if (!resendApiKey) {
    missing.push('RESEND_API_KEY');
  }

  if (!contactFromEmail) {
    missing.push('CONTACT_FROM_EMAIL');
  }

  if (!contactToEmail) {
    missing.push('CONTACT_TO_EMAIL');
  }

  if (missing.length > 0) {
    return {
      error: `Server is missing required environment variables: ${missing.join(', ')}`,
    };
  }

  return {
    config: {
      contactFromEmail,
      contactToEmail,
      resendApiKey,
      supabaseServiceRoleKey,
      supabaseTable,
      supabaseUrl,
    },
  };
};

const extractErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as {
      details?: string;
      error?: string;
      message?: string;
    };

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }

    if (typeof data.details === 'string' && data.details.trim()) {
      return data.details;
    }
  } catch {
    // Ignore malformed or non-JSON payloads.
  }

  return fallback;
};

const saveMessageToSupabase = async (
  payload: ContactPayload,
  config: RequiredConfig
) => {
  const response = await fetch(
    `${config.supabaseUrl}/rest/v1/${config.supabaseTable}`,
    {
      body: JSON.stringify([
        {
          email: payload.email,
          message: payload.message,
          name: payload.name,
          subject: payload.subject,
        },
      ]),
      headers: {
        Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
        apikey: config.supabaseServiceRoleKey,
      },
      method: 'POST',
    }
  );

  if (!response.ok) {
    const message = await extractErrorMessage(
      response,
      'Unable to store your message right now.'
    );
    throw new Error(message);
  }
};

const sendEmailNotification = async (
  payload: ContactPayload,
  config: RequiredConfig
) => {
  const emailBody = [
    'New message from portfolio contact form.',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Subject: ${payload.subject}`,
    '',
    payload.message,
  ].join('\n');

  const response = await fetch(RESEND_ENDPOINT, {
    body: JSON.stringify({
      from: config.contactFromEmail,
      reply_to: payload.email,
      subject: `Portfolio Contact: ${payload.subject}`,
      text: emailBody,
      to: [config.contactToEmail],
    }),
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const message = await extractErrorMessage(
      response,
      'Unable to send email notification right now.'
    );
    throw new Error(message);
  }
};

export default async function handler(
  request: ServerlessRequest,
  response: ServerlessResponse
) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    respondWithMessage(response, 405, 'Method not allowed.');
    return;
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    respondWithMessage(
      response,
      429,
      'Too many requests. Please wait a moment and try again.'
    );
    return;
  }

  const parsedBody = parseRequestBody(request.body);
  if (!parsedBody) {
    respondWithMessage(response, 400, 'Invalid request payload.');
    return;
  }

  const { error: validationError, payload } = validatePayload(parsedBody);
  if (validationError || !payload) {
    respondWithMessage(response, 400, validationError ?? 'Invalid payload.');
    return;
  }

  if (payload.website) {
    respondWithMessage(response, 200, SUCCESS_MESSAGE);
    return;
  }

  const { config, error: configError } = getRequiredConfig();
  if (configError || !config) {
    respondWithMessage(
      response,
      500,
      'Contact service is not configured yet. Please try again later.'
    );
    return;
  }

  try {
    await saveMessageToSupabase(payload, config);
    await sendEmailNotification(payload, config);

    respondWithMessage(response, 200, SUCCESS_MESSAGE);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to send your message at the moment.';

    respondWithMessage(response, 500, message);
  }
}