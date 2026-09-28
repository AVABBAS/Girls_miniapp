import { SignJWT, jwtVerify } from 'jose';
import type { AppConfig } from '../config.js';

export interface SessionClaims {
  sub: string;
  tg: number;
  /** Telegram display locale, surfaced to the UI. */
  loc: string;
}

const ALG = 'HS256';

function secretKey(config: AppConfig): Uint8Array {
  return new TextEncoder().encode(config.jwtSecret);
}

export async function signSession(user: { id: string; telegramId: number; locale: string }, config: AppConfig): Promise<string> {
  return new SignJWT({ tg: user.telegramId, loc: user.locale })
    .setProtectedHeader({ alg: ALG })
    .setSubject(user.id)
    .setIssuer(config.jwtIssuer)
    .setIssuedAt()
    .setExpirationTime(`${config.jwtExpiresInSeconds}s`)
    .sign(secretKey(config));
}

export async function verifySession(token: string, config: AppConfig): Promise<SessionClaims> {
  const { payload } = await jwtVerify(token, secretKey(config), {
    issuer: config.jwtIssuer,
    algorithms: [ALG],
  });
  if (typeof payload.sub !== 'string' || typeof payload.tg !== 'number' || typeof payload.loc !== 'string') {
    throw new Error('invalid session claims');
  }
  return { sub: payload.sub, tg: payload.tg, loc: payload.loc };
}
