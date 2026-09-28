/**
 * Telegram WebApp `initData` payload fields that we parse server-side after the
 * HMAC signature has been verified. Only fields we actually use are declared.
 */
export interface TelegramInitData {
  /** Telegram user identifier. */
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  /** Unix seconds, when the data was issued. */
  auth_date: number;
  /** User's language tag, e.g. `fa` or `en`. */
  language_code?: string;
  query_id?: string;
}
