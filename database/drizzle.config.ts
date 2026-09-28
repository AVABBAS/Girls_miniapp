import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/schema.ts',
  out: './migrations',
  // Migrations are generated from the schema and committed to the repo so
  // production deploys never need the source schema at build time.
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'sqlite/local.db',
  },
});
