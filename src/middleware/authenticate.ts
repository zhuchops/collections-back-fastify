import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET!;

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const jwtString = request.cookies['jwt'];
  if (!jwtString) {
    reply.unauthorized('Missing token');
    return;
  }

  try {
    const payload = jwt.verify(jwtString, jwtSecret) as { user_id: string };
    request.user = { id: payload.user_id }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      reply.unauthorized('Token expired');
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      reply.unauthorized('Invalid token');
      return;
    }
    reply.unauthorized('Unauthorized');
    return;
  }
}
