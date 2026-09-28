import { z } from 'zod';

const ConfigSchema = z.object({
  appEnv: z.enum(['development', 'test', 'production']).default('development'),
  host: z.string().default('0.0.0.0'),
  port: z.coerce.number().int().positive().default(3000),
  appUrl: z.string().url().default('http://localhost:3000'),

  telegramBotToken: z.string().min(1),
  /** Max age of Telegram `auth_date`, in seconds (default 24h). */
  telegramAuthMaxAgeSeconds: z.coerce.number().int().positive().default(86_400),

  /** JWT signing key. Generated ephemerally in non-production when absent. */
  jwtSecret: z.string().min(16),
  jwtIssuer: z.string().default('girls-mini-app'),
  /** Access token lifetime in seconds (default 7 days, matching Telegram's). */
  jwtExpiresInSeconds: z.coerce.number().int().positive().default(604_800),

  databaseUrl: z.string().default('sqlite/local.db'),
  logLevel: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = ConfigSchema.safeParse({
    appEnv: env.APP_ENV,
    host: env.HOST,
    port: env.PORT,
    appUrl: env.APP_URL,
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    telegramAuthMaxAgeSeconds: env.TELEGRAM_AUTH_MAX_AGE_SECONDS,
    jwtSecret: env.JWT_SECRET,
    jwtIssuer: env.JWT_ISSUER,
    jwtExpiresInSeconds: env.JWT_EXPIRES_IN_SECONDS,
    databaseUrl: env.DATABASE_URL,
    logLevel: env.LOG_LEVEL,
  });

  if (parsed.success) {
    return parsed.data;
  }

  // In non-production we may safely fall back to an ephemeral session key so a
  // fresh local checkout works without configuration. Production must always
  // provide JWT_SECRET: sessions would otherwise reset on every restart.
  const appEnv = env.APP_ENV ?? 'development';
  const missingJwtSecret = parsed.error.issues.some(
    (i) => i.path.join('.') === 'jwtSecret',
  );

  if (appEnv !== 'production' && missingJwtSecret) {
    return ConfigSchema.parse({
      ...env,
      appEnv,
      jwtSecret: `ephemeral-dev-key-${crypto.randomUUID()}`,
    });
  }

  const details = parsed.error.issues
    .map((i) => `${i.path.join('.') || 'config'}: ${i.message}`)
    .join('; ');
  throw new Error(`Invalid configuration: ${details}`);
}

/**
 * Configured CORS origin check: the Mini App origin plus any explicitly allowed
 * origin from `APP_URL`. Telegram WebView requests carry no useful Origin, so
 * CORS is permissive in origin but credentials are never required cross-site.
 */
export function corsOrigin(config: AppConfig): (origin: string | undefined) => boolean {
  const allowed = new Set<string>([config.appUrl]);
  return (origin) => (origin === undefined ? true : allowed.has(origin));
}
