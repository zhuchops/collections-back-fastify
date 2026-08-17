import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch {
  // Ignore if .env doesn't exist
}

import Fastify, { fastify } from 'fastify'
import { authRoutes } from './handlers/auth.ts';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { authenticate } from './middleware/authenticate.ts';
import { userRoutes } from './handlers/users.ts';
import { collectionsRoutes } from './handlers/collections.ts';

const app = Fastify({ logger: true });

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
    }
  }
}

app.decorateRequest('user', undefined)

// libraries
app.register(import("@fastify/sensible"))
app.register(import("@fastify/cookie"))

// public routes
app.register(authRoutes)

// private routes
app.register(async (protectedRoutes) => {
  protectedRoutes.addHook('preHandler', authenticate)
  protectedRoutes.register(userRoutes)
  protectedRoutes.register(collectionsRoutes)
})

app.listen({ port: 8080 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
})
