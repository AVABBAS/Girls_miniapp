/**
 * Shared HTTP API contract types. The backend implements these handlers and the
 * frontend consumes them; both compile against the same shapes so the API
 * boundary cannot drift.
 */

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

export interface AuthTelegramRequest {
  /** Raw `initData` query string from `window.Telegram.WebApp.initData`. */
  initData: string;
}

export interface AuthTelegramResponse {
  accessToken: string;
  /** Lifetime in seconds; the client refreshes by re-authenticating. */
  expiresIn: number;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  telegramId: number;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  locale: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  time: string;
  db: 'ok' | 'unavailable';
}
