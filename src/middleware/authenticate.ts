import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/index.ts";
import { sessions } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.session;

  if (!sessionId) {
    return reply.code(401).send({ message: "Unauthorized" });
  }

  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  const session = result[0];

  if (!session) {
    return reply.code(401).send({ message: "Unauthorized" });
  }

  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return reply.code(401).send({ message: "Session expired" });
  }
}
