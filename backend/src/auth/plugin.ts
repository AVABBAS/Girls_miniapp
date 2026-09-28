import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { DatabaseClient } from '@girls/database';
import type { SessionClaims } from './jwt.js';
import { verifySession } from './jwt.js';
import type { AppConfig } from '../config.js';
import { UserRepository } from '../users/repository.js';

export interface AuthenticatedRequest extends FastifyRequest {
  user: SessionClaims;
}

declare module 'fastify' {
  interface FastifyInstance {
    /**
     * Verifies the bearer token and loads the caller's session. Every protected
     * route must use it: authorization is enforced server-side, never in the UI.
     */
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AuthPluginOptions {
  config: AppConfig;
  db: DatabaseClient;
}

export default fp(
  async (fastify: FastifyInstance, options: AuthPluginOptions) => {
    const users = new UserRepository(options.db);

    fastify.decorate(
      'authenticate',
      async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const header = request.headers.authorization;
        if (!header || !header.toLowerCase().startsWith('bearer ')) {
          await reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'missing bearer token' });
          return;
        }

        const token = header.slice(7).trim();
        let claims: SessionClaims;
        try {
          claims = await verifySession(token, options.config);
        } catch {
          await reply.code(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'invalid or expired token',
          });
          return;
        }

        // Re-check that the user still exists: deleted users lose access.
        const user = await users.findById(claims.sub);
        if (!user) {
          await reply.code(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'user no longer exists',
          });
          return;
        }

        (request as AuthenticatedRequest).user = claims;
      },
    );
  },
  { name: 'authenticate' },
);
