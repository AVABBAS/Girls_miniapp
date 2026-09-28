import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { createDatabase } from './client.js';

const url = process.env.DATABASE_URL ?? 'sqlite/local.db';

const db = createDatabase({ url });

migrate(db, { migrationsFolder: './migrations' });

console.warn(`[db] migrations applied to ${url}`);
