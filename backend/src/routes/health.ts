import type { FastifyInstance } from 'fastify';
import type { DatabaseClient } from '@girls/database';
import { sql } from 'drizzle-orm';
import type { HealthResponse } from '@girls/shared';

export interface HealthOptions {
  db: DatabaseClient;
}

export default async function healthRoutes(fastify: FastifyInstance, options: HealthOptions) {
  fastify.get('/health', async (): Promise<HealthResponse> => {
    let dbStatus: 'ok' | 'unavailable' = 'ok';
    try {
      await options.db.run(sql`select 1`);
    } catch {
      dbStatus = 'unavailable';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      service: 'girls-mini-app-api',
      time: new Date().toISOString(),
      db: dbStatus,
    };
  });
}
