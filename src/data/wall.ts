export interface WallMessage {
  id: string;
  name: string;
  text: string;
  at: number;
  sig?: string;
  local?: boolean;
}

interface WallRow {
  created_at: string;
  id: string;
  name: string;
  sig: string | null;
  text: string;
}

const STORAGE_KEY = 'nife-wall-messages';
const ENDPOINT =
  import.meta.env.VITE_WALL_ENDPOINT?.trim() || '/api/wall';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function toWallMessage(row: WallRow): WallMessage {
  return {
    at: Date.parse(row.created_at) || Date.now(),
    id: String(row.id),
    name: String(row.name),
    sig: row.sig ?? undefined,
    text: String(row.text)
  };
}

export function loadLocalMessages(): WallMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isRecord)
      .filter(
        (m) => typeof m['name'] === 'string' && typeof m['text'] === 'string'
      )
      .map((m) => ({
        at: typeof m['at'] === 'number' ? m['at'] : Date.now(),
        id: typeof m['id'] === 'string' ? m['id'] : `${Date.now()}`,
        local: true,
        name: m['name'] as string,
        sig: typeof m['sig'] === 'string' ? (m['sig'] as string) : undefined,
        text: m['text'] as string
      }));
  } catch {
    return [];
  }
}

export function saveLocalMessages(messages: WallMessage[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.filter((m) => m.local))
    );
  } catch {
    /* storage unavailable or full */
  }
}

export async function fetchWallMessages(): Promise<WallMessage[]> {
  const res = await fetch(ENDPOINT, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Wall unavailable');
  const data = (await res.json()) as { messages?: WallRow[] };
  if (!Array.isArray(data.messages)) throw new Error('Wall unavailable');
  return data.messages.map(toWallMessage);
}

export async function postWallMessage(input: {
  name: string;
  text: string;
  sig?: string;
}): Promise<WallMessage> {
  const res = await fetch(ENDPOINT, {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST'
  });
  const data = (await res.json()) as { message?: unknown };
  if (!res.ok || typeof data.message === 'string') {
    throw new Error(
      typeof data.message === 'string' && data.message
        ? data.message
        : 'Unable to pin.'
    );
  }
  if (!isRecord(data.message)) {
    throw new Error('Unable to pin.');
  }
  const row = data.message as unknown as WallRow;
  if (typeof row.id !== 'string' || typeof row.text !== 'string') {
    throw new Error('Unable to pin.');
  }
  return toWallMessage(row);
}
