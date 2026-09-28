import { createHmac, timingSafeEqual } from 'node:crypto';
import type { TelegramInitData } from '@girls/shared';

export class TelegramVerificationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'missing_hash'
      | 'missing_auth_date'
      | 'stale_auth_date'
      | 'invalid_signature'
      | 'invalid_payload',
  ) {
    super(message);
    this.name = 'TelegramVerificationError';
  }
}

/**
 * Parse a Telegram `initData` query string into a typed record. Values are
 * decoded but not trusted until `verifyInitData` succeeds.
 */
export function parseInitData(initData: string): Record<string, string> {
  const search = new URLSearchParams(initData);
  const params: Record<string, string> = {};
  for (const [key, value] of search.entries()) {
    params[key] = value;
  }
  return params;
}

/**
 * Structural checks on the payload before signature verification. Returns the
 * fields that must be present for verification to be meaningful.
 */
function assertPayloadShape(params: Record<string, string>): {
  hash: string;
  authDate: string;
  id: string;
} {
  const hash = params.hash;
  if (typeof hash !== 'string' || hash.length === 0) {
    throw new TelegramVerificationError('missing hash parameter', 'missing_hash');
  }
  const authDate = params.auth_date;
  if (typeof authDate !== 'string' || authDate.length === 0) {
    throw new TelegramVerificationError('missing auth_date parameter', 'missing_auth_date');
  }
  const id = params.id;
  if (typeof id !== 'string' || !/^\d+$/.test(id)) {
    throw new TelegramVerificationError('invalid user id in payload', 'invalid_payload');
  }
  return { hash, authDate, id };
}

/** Constant-time hex string comparison. */
function safeEqualHex(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'hex');
  const bufferB = Buffer.from(b, 'hex');
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export interface VerifyInitDataOptions {
  botToken: string;
  /** Reject payloads older than this many seconds. */
  maxAgeSeconds: number;
  /** Injected clock for deterministic tests. */
  now?: () => number;
}

/**
 * Verify a Telegram WebApp `initData` payload per the official algorithm:
 *
 * 1. `secret_key = HMAC_SHA256("WebAppData", bot_token)`
 * 2. `hash = HMAC_SHA256(secret_key, data_check_string)`
 * 3. `data_check_string` is the other fields sorted alphabetically as
 *    `key=value` joined by newlines.
 *
 * The comparison is constant-time and `auth_date` freshness is enforced to
 * prevent replay. Returns the parsed, now-trusted payload.
 */
export function verifyInitData(
  initData: string,
  { botToken, maxAgeSeconds, now = Date.now }: VerifyInitDataOptions,
): TelegramInitData {
  const params = parseInitData(initData);
  const { hash, authDate: authDateString, id: idString } = assertPayloadShape(params);

  const authDate = Number(authDateString);
  if (!Number.isSafeInteger(authDate) || authDate <= 0) {
    throw new TelegramVerificationError('invalid auth_date value', 'invalid_payload');
  }

  const ageSeconds = Math.floor(now() / 1000) - authDate;
  if (ageSeconds > maxAgeSeconds) {
    throw new TelegramVerificationError('initData is too old', 'stale_auth_date');
  }

  const entries = Object.entries(params)
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (!safeEqualHex(expectedHash, hash)) {
    throw new TelegramVerificationError('invalid initData signature', 'invalid_signature');
  }

  const verified: TelegramInitData = {
    id: Number(idString),
    auth_date: authDate,
  };
  if (params.first_name !== undefined) verified.first_name = params.first_name;
  if (params.last_name !== undefined) verified.last_name = params.last_name;
  if (params.username !== undefined) verified.username = params.username;
  if (params.photo_url !== undefined) verified.photo_url = params.photo_url;
  if (params.language_code !== undefined) verified.language_code = params.language_code;
  if (params.query_id !== undefined) verified.query_id = params.query_id;
  return verified;
}

/** Build a valid `initData` string for a given bot token (tests/local mock). */
export function buildInitData(
  payload: Partial<TelegramInitData> & { id: number; auth_date: number },
  botToken: string,
): string {
  const params = new URLSearchParams();
  params.set('id', String(payload.id));
  params.set('auth_date', String(payload.auth_date));
  if (payload.first_name) params.set('first_name', payload.first_name);
  if (payload.last_name) params.set('last_name', payload.last_name);
  if (payload.username) params.set('username', payload.username);
  if (payload.photo_url) params.set('photo_url', payload.photo_url);
  if (payload.language_code) params.set('language_code', payload.language_code);
  if (payload.query_id) params.set('query_id', payload.query_id);

  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  params.set('hash', hash);
  return params.toString();
}
