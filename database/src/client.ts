import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import * as schema from './schema.js';

export type DatabaseClient = ReturnType<typeof createDatabase>;

export interface CreateDatabaseOptions {
  url: string;
  /** Run in-memory (used by tests). */
  memory?: boolean;
  /** Enable query logging in development. */
  verbose?: boolean;
}

/**
 * Create a Drizzle client over better-sqlite3. SQLite is used for local
 * development and self-hosted production; see docs/ARCHITECTURE.md for the
 * documented Postgres migration path.
 */
export function createDatabase(options: CreateDatabaseOptions) {
  if (!options.memory && !existsSync(dirname(options.url))) {
    mkdirSync(dirname(options.url), { recursive: true });
  }

  const connection = options.memory
    ? new Database(':memory:')
    : new Database(options.url);

  connection.pragma('journal_mode = WAL');
  connection.pragma('foreign_keys = ON');

  if (options.verbose) {
    // `better-sqlite3` emits a `trace` event per executed statement. The
    // installed definitions omit its EventEmitter surface, so narrow it here.
    const emitter = connection as unknown as {
      on(event: 'trace', listener: (query: string) => void): void;
    };
    emitter.on('trace', (query) => console.warn('[sql]', query));
  }

  return drizzle(connection, { schema });
}
