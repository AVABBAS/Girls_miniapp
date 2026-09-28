import pino, { type Logger, type LoggerOptions } from 'pino';

/**
 * Privacy-conscious logger factory. Never log request bodies, authorization
 * headers, Telegram initData, or personal data; callers must pass only
 * non-identifying context.
 */
export function createLogger(level = 'info', name = 'api'): Logger {
  const options: LoggerOptions = {
    level,
    name,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', '*.initData', '*.token'],
      remove: true,
    },
  };
  return pino(options);
}
